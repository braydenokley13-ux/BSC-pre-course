export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import {
  GAME_SITUATION_COUNT,
  applyBranchDelta,
  createBranchState,
  getDefaultNodeIdForStep,
  getMissionNode,
  getNextNodeId,
} from "@/lib/missions";
import { generateTeamClaimCode } from "@/lib/claimCode";

type RunoffState = {
  optionIndexes: number[];
  endsAt: string;
};

type StoredMissionState = {
  tally: number[];
  scoreΔ: number;
  narrative: string;
  conceptId: string;
  nextNodeId: string | null;
  tieBreakMethod: "majority" | "random-after-runoff";
  isComplete: boolean;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getTally(votes: { optionIndex: number }[], optionCount: number): number[] {
  const tally = Array.from({ length: optionCount }).fill(0) as number[];
  for (const vote of votes) {
    if (vote.optionIndex >= 0 && vote.optionIndex < optionCount) {
      tally[vote.optionIndex] += 1;
    }
  }
  return tally;
}

function getWinners(tally: number[], optionIndexes?: number[]): number[] {
  const indexes = optionIndexes ?? tally.map((_, i) => i);
  const maxVotes = Math.max(...indexes.map((i) => tally[i] ?? 0));
  return indexes.filter((i) => (tally[i] ?? 0) === maxVotes);
}

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const team = await prisma.team.findUnique({
    where: { id: student.teamId },
    include: {
      students: { select: { id: true, lastSeenAt: true } },
    },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (team.missionIndex >= GAME_SITUATION_COUNT || team.completedAt) {
    return NextResponse.json({ error: "No active situation" }, { status: 400 });
  }

  const step = Math.min(team.missionIndex + 1, GAME_SITUATION_COUNT);
  const missionId = team.currentNodeId || getDefaultNodeIdForStep(step);
  const mission = getMissionNode(missionId);
  if (!mission) return NextResponse.json({ error: "No active situation" }, { status: 400 });

  const existing = await prisma.missionProgress.findUnique({
    where: { teamId_missionId: { teamId: team.id, missionId: mission.id } },
  });
  if (existing) {
    const state = parseJson<StoredMissionState | null>(existing.stateJson, null);
    if (!state) {
      return NextResponse.json({ outcome: existing.outcome, missionId: mission.id, alreadyResolved: true });
    }
    return NextResponse.json({
      outcome: existing.outcome,
      tally: state.tally,
      narrative: state.narrative,
      scoreΔ: state.scoreΔ,
      conceptId: state.conceptId,
      missionId: mission.id,
      isComplete: state.isComplete,
      nextNodeId: state.nextNodeId,
      tieBreakMethod: state.tieBreakMethod,
      alreadyResolved: true,
    });
  }

  const votes = await prisma.vote.findMany({
    where: { teamId: team.id, missionId: mission.id },
  });

  const runoff = parseJson<RunoffState | null>(team.runoffStateJson, null);
  const nowMs = Date.now();
  const runoffConfigured: RunoffState | null =
    runoff && Array.isArray(runoff.optionIndexes) && runoff.optionIndexes.length >= 2
      ? runoff
      : null;
  const runoffDeadlineMs = runoffConfigured ? new Date(runoffConfigured.endsAt).getTime() : 0;
  const runoffActive = runoffConfigured ? runoffDeadlineMs > nowMs : false;

  let tally: number[];
  let winners: number[];
  let tieBreakMethod: "majority" | "random-after-runoff" = "majority";

  if (!runoffConfigured) {
    if (votes.length === 0) {
      return NextResponse.json({ error: "No votes cast yet" }, { status: 400 });
    }

    tally = getTally(votes, mission.options.length);
    winners = getWinners(tally);
    if (winners.length > 1) {
      const endsAt = new Date(nowMs + 30_000).toISOString();
      const runoffState: RunoffState = {
        optionIndexes: winners,
        endsAt,
      };

      await prisma.$transaction([
        prisma.team.update({
          where: { id: team.id },
          data: {
            runoffStateJson: JSON.stringify(runoffState),
          },
        }),
        prisma.vote.deleteMany({ where: { teamId: team.id, missionId: mission.id } }),
      ]);

      return NextResponse.json({
        requiresRunoff: true,
        runoffOptions: winners,
        runoffEndsAt: endsAt,
      });
    }
  } else {
    if (runoffActive) {
      const activeCutoff = new Date(nowMs - 60_000);
      const activeIds = team.students.filter((s) => s.lastSeenAt >= activeCutoff).map((s) => s.id);
      const votedIds = new Set(votes.map((v) => v.studentId));
      const allActiveVoted = activeIds.length > 0 && activeIds.every((id) => votedIds.has(id));

      if (!allActiveVoted) {
        return NextResponse.json({
          requiresRunoff: true,
          runoffOptions: runoffConfigured.optionIndexes,
          runoffEndsAt: runoffConfigured.endsAt,
        });
      }
    }

    const runoffVotes = votes.filter((v) => runoffConfigured.optionIndexes.includes(v.optionIndex));
    tally = getTally(runoffVotes, mission.options.length);
    winners = getWinners(tally, runoffConfigured.optionIndexes);
    if (winners.length > 1) {
      tieBreakMethod = "random-after-runoff";
      winners = [winners[Math.floor(Math.random() * winners.length)]];
    }
  }

  const outcome = winners[0];
  const selectedOption = mission.options[outcome];
  if (!selectedOption) {
    return NextResponse.json({ error: "Invalid winning option" }, { status: 500 });
  }

  const currentBranchState = createBranchState(
    parseJson<Record<string, number>>(team.branchStateJson, {
      capFlex: 0,
      starPower: 0,
      dataTrust: 0,
      culture: 0,
      riskHeat: 0,
    })
  );

  const newBranchState = applyBranchDelta(currentBranchState, selectedOption.effects.branchΔ);

  const computedNextNodeId = selectedOption.nextNodeId ?? getNextNodeId(mission.step, newBranchState, outcome);
  const nextNode = computedNextNodeId ? getMissionNode(computedNextNodeId) : null;
  const advancesSituation = !nextNode || nextNode.step > mission.step;
  const newMissionIndexRaw = team.missionIndex + (advancesSituation ? 1 : 0);
  const isComplete = newMissionIndexRaw >= GAME_SITUATION_COUNT || !computedNextNodeId;
  const newMissionIndex = isComplete ? GAME_SITUATION_COUNT : newMissionIndexRaw;

  const badges = parseJson<string[]>(team.badges, []);
  if (!badges.includes(mission.conceptId)) badges.push(mission.conceptId);

  const newScore = team.score + selectedOption.effects.scoreΔ;
  const teamClaimCode = isComplete ? generateTeamClaimCode(team.id, badges) : undefined;

  const stateForStorage: StoredMissionState = {
    tally,
    scoreΔ: selectedOption.effects.scoreΔ,
    narrative: selectedOption.outcome.narrative,
    conceptId: mission.conceptId,
    nextNodeId: isComplete ? null : computedNextNodeId,
    tieBreakMethod,
    isComplete,
  };

  try {
    await prisma.$transaction([
      prisma.missionProgress.create({
        data: {
          sessionId: student.sessionId,
          teamId: team.id,
          missionId: mission.id,
          outcome,
          stateJson: JSON.stringify(stateForStorage),
        },
      }),
      prisma.team.update({
        where: { id: team.id },
        data: {
          missionIndex: newMissionIndex,
          currentNodeId: isComplete ? mission.id : computedNextNodeId,
          branchStateJson: JSON.stringify(newBranchState),
          runoffStateJson: null,
          score: newScore,
          badges: JSON.stringify(badges),
          lastProgressAt: new Date(),
          ...(isComplete && {
            completedAt: new Date(),
            claimCode: teamClaimCode,
          }),
        },
      }),
    ]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Unique constraint") || message.includes("P2002")) {
      const replay = await prisma.missionProgress.findUnique({
        where: { teamId_missionId: { teamId: team.id, missionId: mission.id } },
      });
      const replayState = parseJson<StoredMissionState | null>(replay?.stateJson, null);
      if (replay && replayState) {
        return NextResponse.json({
          outcome: replay.outcome,
          tally: replayState.tally,
          narrative: replayState.narrative,
          scoreΔ: replayState.scoreΔ,
          conceptId: replayState.conceptId,
          missionId: mission.id,
          isComplete: replayState.isComplete,
          nextNodeId: replayState.nextNodeId,
          tieBreakMethod: replayState.tieBreakMethod,
          alreadyResolved: true,
        });
      }
    }
    throw error;
  }

  return NextResponse.json({
    outcome,
    tally,
    narrative: selectedOption.outcome.narrative,
    scoreΔ: selectedOption.effects.scoreΔ,
    conceptId: mission.conceptId,
    missionId: mission.id,
    isComplete,
    nextNodeId: isComplete ? null : computedNextNodeId,
    tieBreakMethod,
  });
}
