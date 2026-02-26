export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import {
  getMissionById,
  isLegacyMission,
  Mission,
  FinalOutcome,
  OutcomeVariant,
} from "@/lib/missions";
import { applyStatuses } from "@/lib/statusEffects";
import { generateTeamClaimCode } from "@/lib/claimCode";

interface CompletedRound {
  roundId: string;
  winningOptionId: string;
  winningTags: string[];
}

interface MissionRoundState {
  missionId: string;
  currentRoundId: string;
  completedRounds: CompletedRound[];
  allTags: string[];
  rivalFired: boolean;
  isResolved: boolean;
}

function pickVariant(variants: OutcomeVariant[]): OutcomeVariant {
  const rand = Math.random();
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.probability;
    if (rand < cumulative) return v;
  }
  return variants[variants.length - 1];
}

function findMatchingOutcome(outcomes: FinalOutcome[], allTags: string[]): FinalOutcome | null {
  // Sort by specificity (longer combos first) for most-specific match
  const sorted = [...outcomes].sort((a, b) => b.roundTagCombo.length - a.roundTagCombo.length);
  return sorted.find((o) => o.roundTagCombo.every((t) => allTags.includes(t))) ?? null;
}

function getNextRound(mission: Mission, completedRounds: CompletedRound[]): string | null {
  const completedIds = new Set(completedRounds.map((r) => r.roundId));

  for (const round of mission.rounds) {
    if (completedIds.has(round.id)) continue; // already done
    if (!round.dependsOnRoundId) continue;    // first-round, already done

    // Check if its parent is completed and the tag matches
    const parent = completedRounds.find((r) => r.roundId === round.dependsOnRoundId);
    if (!parent) continue;
    if (round.dependsOnTag && !parent.winningTags.includes(round.dependsOnTag)) continue;

    return round.id;
  }

  return null; // no more rounds → resolve final outcome
}

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { missionId, roundId } = (await req.json()) as {
    missionId: string;
    roundId: string;
  };

  if (!missionId || !roundId) {
    return NextResponse.json({ error: "missionId and roundId required" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: student.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const mission = getMissionById(missionId);
  if (!mission || isLegacyMission(mission)) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }
  const richMission = mission as Mission;

  // Load current round state
  const roundState: MissionRoundState = JSON.parse(team.missionRoundState || "{}") as MissionRoundState;
  if (roundState.missionId !== missionId) {
    return NextResponse.json({ error: "Round state mismatch — start mission first" }, { status: 400 });
  }
  if (roundState.isResolved) {
    return NextResponse.json({ error: "Mission already resolved" }, { status: 400 });
  }
  if (roundState.currentRoundId !== roundId) {
    return NextResponse.json({ error: "Not the current round" }, { status: 400 });
  }

  // Get votes for this round
  const votes = await prisma.vote.findMany({
    where: { teamId: team.id, missionId, roundId },
  });
  if (votes.length === 0) {
    return NextResponse.json({ error: "No votes cast yet" }, { status: 400 });
  }

  // Tally and pick winner
  const isRivalRound = roundId === "rival-response";
  const roundDef = isRivalRound
    ? richMission.rivalCounter?.responseRound
    : richMission.rounds.find((r) => r.id === roundId);

  if (!roundDef) return NextResponse.json({ error: "Round definition not found" }, { status: 400 });
  if (roundDef.options.length === 0) return NextResponse.json({ error: "Round has no options" }, { status: 500 });

  const tally = new Array(roundDef.options.length).fill(0) as number[];
  for (const v of votes) {
    if (v.optionIndex >= 0 && v.optionIndex < tally.length) {
      tally[v.optionIndex]++;
    }
  }
  const maxVotes = Math.max(...tally);
  const winnerIdx = tally.findIndex((c) => c === maxVotes);
  const winningOption = roundDef.options[winnerIdx];
  const winningOptionId = winningOption.id;
  const winningTags = winningOption.tags;

  // Update completed rounds
  const newCompleted: CompletedRound[] = [
    ...roundState.completedRounds,
    { roundId, winningOptionId, winningTags },
  ];
  const newAllTags = Array.from(new Set([...roundState.allTags, ...winningTags]));

  // Check rival counter: fires if not yet fired, not a rival round, and tags match
  const rival = richMission.rivalCounter;
  const rivalShouldFire =
    !isRivalRound &&
    !roundState.rivalFired &&
    rival != null &&
    rival.triggerTags.some((t) => newAllTags.includes(t));

  if (rivalShouldFire && rival) {
    // Next round is the rival response
    const newState: MissionRoundState = {
      ...roundState,
      currentRoundId: "rival-response",
      completedRounds: newCompleted,
      allTags: newAllTags,
      rivalFired: true,
    };
    await prisma.team.update({
      where: { id: team.id },
      data: { missionRoundState: JSON.stringify(newState) },
    });

    return NextResponse.json({
      roundId,
      winningOptionId,
      winningTags,
      tally,
      rivalFired: true,
      rivalMessage: rival.message,
      rivalResponseRound: rival.responseRound,
      nextRoundId: "rival-response",
      isComplete: false,
    });
  }

  // Determine next round
  const nextRoundId = getNextRound(richMission, newCompleted);

  if (nextRoundId) {
    // More rounds to go
    const newState: MissionRoundState = {
      ...roundState,
      currentRoundId: nextRoundId,
      completedRounds: newCompleted,
      allTags: newAllTags,
      rivalFired: roundState.rivalFired || rivalShouldFire,
    };
    await prisma.team.update({
      where: { id: team.id },
      data: { missionRoundState: JSON.stringify(newState) },
    });

    const nextRound = richMission.rounds.find((r) => r.id === nextRoundId);
    return NextResponse.json({
      roundId,
      winningOptionId,
      winningTags,
      tally,
      rivalFired: false,
      nextRoundId,
      nextRound,
      isComplete: false,
    });
  }

  // ── All rounds done → resolve final outcome ────────────────────────────────
  const existingProgress = await prisma.missionProgress.findUnique({
    where: { teamId_missionId: { teamId: team.id, missionId } },
  });
  if (existingProgress) {
    return NextResponse.json({
      roundId,
      winningOptionId,
      winningTags,
      tally,
      rivalFired: false,
      nextRoundId: null,
      isComplete: true,
      alreadyResolved: true,
    });
  }

  // Find matching outcome
  const matchedOutcome =
    findMatchingOutcome(richMission.outcomes, newAllTags) ?? richMission.defaultOutcome;
  const variant = pickVariant(matchedOutcome.variants);

  // Apply status effects
  const currentStatus = JSON.parse(team.teamStatus) as string[];
  const newStatus = applyStatuses(
    currentStatus,
    variant.applyStatus,
    variant.removeStatus ?? []
  );

  // Update completedMissions
  const completedMissions = JSON.parse(team.completedMissions) as string[];
  if (!completedMissions.includes(missionId)) {
    completedMissions.push(missionId);
  }

  // Score
  const newScore = team.score + variant.scoreΔ;
  const badges = JSON.parse(team.badges) as string[];
  if (!badges.includes(richMission.conceptId)) {
    badges.push(richMission.conceptId);
  }

  // Check game complete
  const isGameComplete = completedMissions.includes("final-gm-call");
  const teamClaimCode = isGameComplete ? generateTeamClaimCode(team.id, badges) : undefined;

  const finalState: MissionRoundState = {
    ...roundState,
    completedRounds: newCompleted,
    allTags: newAllTags,
    rivalFired: roundState.rivalFired,
    isResolved: true,
    currentRoundId: "resolved",
  };

  await prisma.missionProgress.create({
    data: {
      sessionId: student.sessionId,
      teamId: team.id,
      missionId,
      outcome: matchedOutcome.variants.indexOf(variant),
      stateJson: JSON.stringify({
        allTags: newAllTags,
        completedRounds: newCompleted,
        variantLabel: variant.label,
        scoreΔ: variant.scoreΔ,
      }),
    },
  });

  await prisma.team.update({
    where: { id: team.id },
    data: {
      score: newScore,
      badges: JSON.stringify(badges),
      completedMissions: JSON.stringify(completedMissions),
      missionIndex: completedMissions.length,
      teamStatus: JSON.stringify(newStatus),
      missionRoundState: JSON.stringify(finalState),
      lastProgressAt: new Date(),
      ...(isGameComplete && {
        completedAt: new Date(),
        claimCode: teamClaimCode,
      }),
    },
  });

  return NextResponse.json({
    roundId,
    winningOptionId,
    winningTags,
    tally,
    rivalFired: false,
    nextRoundId: null,
    isComplete: true,
    outcome: {
      label: variant.label,
      narrative: variant.narrative,
      scoreΔ: variant.scoreΔ,
      applyStatus: variant.applyStatus,
      newTeamStatus: newStatus,
    },
    conceptId: richMission.conceptId,
    missionId,
    isGameComplete,
  });
}
