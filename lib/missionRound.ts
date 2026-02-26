import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FinalOutcome,
  getMissionById,
  isLegacyMission,
  Mission,
  MissionRound,
  OutcomeVariant,
  RoundOption,
} from "@/lib/missions";
import { applyStatuses } from "@/lib/statusEffects";
import { generateTeamClaimCode } from "@/lib/claimCode";
import { parseJson } from "@/lib/json";
import { recordTeamEvent } from "@/lib/teamEvents";

export interface CompletedRound {
  roundId: string;
  winningOptionId: string;
  winningTags: string[];
}

export interface MissionRoundState {
  missionId: string;
  currentRoundId: string;
  completedRounds: CompletedRound[];
  allTags: string[];
  rivalFired: boolean;
  isResolved: boolean;
}

export interface ResolveOutcomePayload {
  label: string;
  narrative: string;
  scoreΔ: number;
  applyStatus: string[];
  newTeamStatus: string[];
}

export interface ResolveRoundResponseData {
  roundId: string;
  winningOptionId: string;
  winningTags: string[];
  tally: number[];
  rivalFired: boolean;
  rivalMessage?: string;
  rivalResponseRound?: MissionRound;
  nextRoundId: string | null;
  nextRound?: MissionRound;
  isComplete: boolean;
  alreadyResolved?: boolean;
  outcome?: ResolveOutcomePayload;
  conceptId?: string;
  missionId?: string;
  isGameComplete?: boolean;
  stateVersion: number;
}

export interface ResolveRoundError {
  status: 400 | 404 | 409;
  error: string;
  code: "BAD_REQUEST" | "NOT_FOUND" | "CONFLICT";
}

export type ResolveRoundResult =
  | { ok: true; data: ResolveRoundResponseData }
  | { ok: false; error: ResolveRoundError };

export interface ResolveRoundInput {
  teamId: string;
  sessionId: string;
  missionId: string;
  roundId: string;
  allowNoVotes?: boolean;
  forcedOptionIndex?: number;
  eventSource?: "student" | "teacher";
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
  const sorted = [...outcomes].sort((a, b) => b.roundTagCombo.length - a.roundTagCombo.length);
  return sorted.find((o) => o.roundTagCombo.every((t) => allTags.includes(t))) ?? null;
}

function getNextRound(mission: Mission, completedRounds: CompletedRound[]): string | null {
  const completedIds = new Set(completedRounds.map((r) => r.roundId));
  for (const round of mission.rounds) {
    if (completedIds.has(round.id)) continue;
    if (!round.dependsOnRoundId) continue;

    const parent = completedRounds.find((r) => r.roundId === round.dependsOnRoundId);
    if (!parent) continue;
    if (round.dependsOnTag && !parent.winningTags.includes(round.dependsOnTag)) continue;
    return round.id;
  }
  return null;
}

function tallyVotes(optionCount: number, optionIndexes: number[]): number[] {
  const tally = new Array(optionCount).fill(0) as number[];
  for (const idx of optionIndexes) {
    if (idx >= 0 && idx < optionCount) tally[idx] += 1;
  }
  return tally;
}

export function parseMissionRoundState(raw: string | null | undefined): MissionRoundState {
  return parseJson<MissionRoundState>(raw, {
    missionId: "",
    currentRoundId: "",
    completedRounds: [],
    allTags: [],
    rivalFired: false,
    isResolved: false,
  });
}

export function applyRoundOptionMutations(round: MissionRound, teamStatus: string[]): MissionRound {
  const patchedOptions: RoundOption[] = round.options
    .map((opt) => {
      if (!opt.mutations) return opt;
      let patched = { ...opt };
      for (const mut of opt.mutations) {
        if (teamStatus.includes(mut.ifStatus)) {
          if (mut.blocksThis) return null;
          if (mut.labelSuffix) patched = { ...patched, label: patched.label + mut.labelSuffix };
          if (mut.descriptionPrefix) {
            patched = {
              ...patched,
              description: mut.descriptionPrefix + patched.description,
            };
          }
        }
      }
      return patched;
    })
    .filter(Boolean) as RoundOption[];
  return { ...round, options: patchedOptions };
}

export async function resolveMissionRound(input: ResolveRoundInput): Promise<ResolveRoundResult> {
  const team = await prisma.team.findUnique({ where: { id: input.teamId } });
  if (!team) {
    return {
      ok: false,
      error: { status: 404, error: "Team not found", code: "NOT_FOUND" },
    };
  }

  const mission = getMissionById(input.missionId);
  if (!mission || isLegacyMission(mission)) {
    return {
      ok: false,
      error: { status: 404, error: "Mission not found", code: "NOT_FOUND" },
    };
  }

  const richMission = mission as Mission;
  const roundState = parseMissionRoundState(team.missionRoundState);
  if (roundState.missionId !== input.missionId) {
    return {
      ok: false,
      error: {
        status: 400,
        error: "Round state mismatch — start mission first",
        code: "BAD_REQUEST",
      },
    };
  }
  if (roundState.isResolved) {
    return {
      ok: false,
      error: { status: 400, error: "Mission already resolved", code: "BAD_REQUEST" },
    };
  }
  if (roundState.currentRoundId !== input.roundId) {
    return {
      ok: false,
      error: { status: 409, error: "Not the current round", code: "CONFLICT" },
    };
  }

  const isRivalRound = input.roundId === "rival-response";
  const roundDef = isRivalRound
    ? richMission.rivalCounter?.responseRound
    : richMission.rounds.find((r) => r.id === input.roundId);

  if (!roundDef) {
    return {
      ok: false,
      error: { status: 400, error: "Round definition not found", code: "BAD_REQUEST" },
    };
  }
  if (roundDef.options.length === 0) {
    return {
      ok: false,
      error: { status: 400, error: "Round has no options", code: "BAD_REQUEST" },
    };
  }

  const votes = await prisma.vote.findMany({
    where: { teamId: team.id, missionId: input.missionId, roundId: input.roundId },
    select: { optionIndex: true },
  });

  const votesIndexes = votes.map((v) => v.optionIndex);
  let tally = tallyVotes(roundDef.options.length, votesIndexes);
  let winnerIdx = 0;

  if (typeof input.forcedOptionIndex === "number") {
    if (input.forcedOptionIndex < 0 || input.forcedOptionIndex >= roundDef.options.length) {
      return {
        ok: false,
        error: { status: 400, error: "Invalid forced option index", code: "BAD_REQUEST" },
      };
    }
    winnerIdx = input.forcedOptionIndex;
  } else if (votes.length === 0) {
    if (!input.allowNoVotes) {
      return {
        ok: false,
        error: { status: 400, error: "No votes cast yet", code: "BAD_REQUEST" },
      };
    }
    winnerIdx = 0;
  } else {
    const maxVotes = Math.max(...tally);
    winnerIdx = tally.findIndex((count) => count === maxVotes);
  }

  const winningOption = roundDef.options[winnerIdx];
  const winningOptionId = winningOption.id;
  const winningTags = winningOption.tags;

  const newCompleted: CompletedRound[] = [
    ...roundState.completedRounds,
    { roundId: input.roundId, winningOptionId, winningTags },
  ];
  const newAllTags = Array.from(new Set([...roundState.allTags, ...winningTags]));

  const rival = richMission.rivalCounter;
  const rivalShouldFire =
    !isRivalRound &&
    !roundState.rivalFired &&
    rival != null &&
    rival.triggerTags.some((t) => newAllTags.includes(t));

  if (rivalShouldFire && rival) {
    const newState: MissionRoundState = {
      ...roundState,
      currentRoundId: "rival-response",
      completedRounds: newCompleted,
      allTags: newAllTags,
      rivalFired: true,
      isResolved: false,
    };

    const updatedTeam = await prisma.team.update({
      where: { id: team.id },
      data: {
        missionRoundState: JSON.stringify(newState),
        teamStateVersion: { increment: 1 },
        lastProgressAt: new Date(),
      },
      select: { teamStateVersion: true },
    });

    await recordTeamEvent({
      sessionId: input.sessionId,
      teamId: team.id,
      eventType: "round_resolved",
      payload: {
        source: input.eventSource ?? "student",
        missionId: input.missionId,
        roundId: input.roundId,
        winnerOptionId: winningOptionId,
        rivalFired: true,
      },
    });

    return {
      ok: true,
      data: {
        roundId: input.roundId,
        winningOptionId,
        winningTags,
        tally,
        rivalFired: true,
        rivalMessage: rival.message,
        rivalResponseRound: rival.responseRound,
        nextRoundId: "rival-response",
        isComplete: false,
        stateVersion: updatedTeam.teamStateVersion,
      },
    };
  }

  const nextRoundId = getNextRound(richMission, newCompleted);
  if (nextRoundId) {
    const newState: MissionRoundState = {
      ...roundState,
      currentRoundId: nextRoundId,
      completedRounds: newCompleted,
      allTags: newAllTags,
      rivalFired: roundState.rivalFired || rivalShouldFire,
      isResolved: false,
    };

    const updatedTeam = await prisma.team.update({
      where: { id: team.id },
      data: {
        missionRoundState: JSON.stringify(newState),
        teamStateVersion: { increment: 1 },
        lastProgressAt: new Date(),
      },
      select: {
        teamStateVersion: true,
        teamStatus: true,
      },
    });

    const rawNextRound = richMission.rounds.find((r) => r.id === nextRoundId);
    const teamStatus = parseJson<string[]>(updatedTeam.teamStatus, []);
    const nextRound = rawNextRound ? applyRoundOptionMutations(rawNextRound, teamStatus) : undefined;

    await recordTeamEvent({
      sessionId: input.sessionId,
      teamId: team.id,
      eventType: "round_resolved",
      payload: {
        source: input.eventSource ?? "student",
        missionId: input.missionId,
        roundId: input.roundId,
        winnerOptionId: winningOptionId,
        nextRoundId,
      },
    });

    return {
      ok: true,
      data: {
        roundId: input.roundId,
        winningOptionId,
        winningTags,
        tally,
        rivalFired: false,
        nextRoundId,
        nextRound,
        isComplete: false,
        stateVersion: updatedTeam.teamStateVersion,
      },
    };
  }

  const existingProgress = await prisma.missionProgress.findUnique({
    where: { teamId_missionId: { teamId: team.id, missionId: input.missionId } },
  });
  if (existingProgress) {
    return {
      ok: true,
      data: {
        roundId: input.roundId,
        winningOptionId,
        winningTags,
        tally,
        rivalFired: false,
        nextRoundId: null,
        isComplete: true,
        alreadyResolved: true,
        stateVersion: team.teamStateVersion,
      },
    };
  }

  const matchedOutcome =
    findMatchingOutcome(richMission.outcomes, newAllTags) ?? richMission.defaultOutcome;
  const variant = pickVariant(matchedOutcome.variants);
  const currentStatus = parseJson<string[]>(team.teamStatus, []);
  const newStatus = applyStatuses(currentStatus, variant.applyStatus, variant.removeStatus ?? []);

  const completedMissions = parseJson<string[]>(team.completedMissions, []);
  if (!completedMissions.includes(input.missionId)) {
    completedMissions.push(input.missionId);
  }

  const newScore = team.score + variant.scoreΔ;
  const badges = parseJson<string[]>(team.badges, []);
  if (!badges.includes(richMission.conceptId)) {
    badges.push(richMission.conceptId);
  }

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

  let updatedVersion = team.teamStateVersion;

  try {
    const [, updatedTeam] = await prisma.$transaction([
      prisma.missionProgress.create({
        data: {
          sessionId: input.sessionId,
          teamId: team.id,
          missionId: input.missionId,
          outcome: matchedOutcome.variants.indexOf(variant),
          stateJson: JSON.stringify({
            allTags: newAllTags,
            completedRounds: newCompleted,
            variantLabel: variant.label,
            scoreΔ: variant.scoreΔ,
          }),
        },
      }),
      prisma.team.update({
        where: { id: team.id },
        data: {
          score: newScore,
          badges: JSON.stringify(badges),
          completedMissions: JSON.stringify(completedMissions),
          missionIndex: completedMissions.length,
          teamStatus: JSON.stringify(newStatus),
          missionRoundState: JSON.stringify(finalState),
          lastProgressAt: new Date(),
          teamStateVersion: { increment: 1 },
          ...(isGameComplete && {
            completedAt: new Date(),
            claimCode: teamClaimCode,
          }),
        },
        select: { teamStateVersion: true },
      }),
    ]);
    updatedVersion = updatedTeam.teamStateVersion;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const replay = await prisma.missionProgress.findUnique({
        where: { teamId_missionId: { teamId: team.id, missionId: input.missionId } },
      });
      if (replay) {
        return {
          ok: true,
          data: {
            roundId: input.roundId,
            winningOptionId,
            winningTags,
            tally,
            rivalFired: false,
            nextRoundId: null,
            isComplete: true,
            alreadyResolved: true,
            stateVersion: team.teamStateVersion,
          },
        };
      }
    }
    throw error;
  }

  await recordTeamEvent({
    sessionId: input.sessionId,
    teamId: team.id,
    eventType: "round_resolved",
    payload: {
      source: input.eventSource ?? "student",
      missionId: input.missionId,
      roundId: input.roundId,
      winnerOptionId: winningOptionId,
      complete: true,
      outcomeLabel: variant.label,
    },
  });

  await recordTeamEvent({
    sessionId: input.sessionId,
    teamId: team.id,
    eventType: "mission_completed",
    payload: {
      source: input.eventSource ?? "student",
      missionId: input.missionId,
      scoreDelta: variant.scoreΔ,
      conceptId: richMission.conceptId,
    },
  });

  return {
    ok: true,
    data: {
      roundId: input.roundId,
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
      missionId: input.missionId,
      isGameComplete,
      stateVersion: updatedVersion,
    },
  };
}
