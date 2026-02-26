export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import {
  GAME_SITUATION_COUNT,
  createBranchState,
  getDefaultNodeIdForStep,
  getMissionNode,
} from "@/lib/missions";

type RunoffState = {
  optionIndexes: number[];
  endsAt: string;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.student.update({
    where: { id: student.id },
    data: { lastSeenAt: new Date() },
  });

  const team = await prisma.team.findUnique({
    where: { id: student.teamId },
    include: {
      students: { select: { id: true, nickname: true, lastSeenAt: true } },
      missionProgress: { orderBy: { completedAt: "asc" } },
    },
  });

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const step = Math.min(team.missionIndex + 1, GAME_SITUATION_COUNT);
  const fallbackNodeId = getDefaultNodeIdForStep(step);
  const currentNodeId = team.currentNodeId || fallbackNodeId;
  const currentMission = team.missionIndex >= GAME_SITUATION_COUNT ? null : getMissionNode(currentNodeId) ?? getMissionNode(fallbackNodeId) ?? null;

  const votes = currentMission
    ? await prisma.vote.findMany({
        where: { teamId: team.id, missionId: currentMission.id },
        select: { studentId: true, optionIndex: true },
      })
    : [];

  const branchState = createBranchState(
    parseJson<Record<string, number>>(team.branchStateJson, {
      capFlex: 0,
      starPower: 0,
      dataTrust: 0,
      culture: 0,
      riskHeat: 0,
    })
  );

  const now = new Date();
  const activeCutoff = new Date(now.getTime() - 60 * 1000);
  const activeMembers = team.students.filter((s) => s.lastSeenAt >= activeCutoff);

  const runoff = parseJson<RunoffState | null>(team.runoffStateJson, null);
  const validRunoff = runoff && Array.isArray(runoff.optionIndexes) && runoff.optionIndexes.length >= 2
    ? runoff
    : null;

  const elapsedSeconds = Math.floor((now.getTime() - team.lastProgressAt.getTime()) / 1000);
  const badges = parseJson<string[]>(team.badges, []);

  return NextResponse.json({
    team: {
      id: team.id,
      name: team.name,
      joinCode: team.joinCode,
      missionIndex: team.missionIndex,
      currentNodeId,
      branchState,
      badges,
      score: team.score,
      claimCode: team.claimCode,
      completedAt: team.completedAt,
    },
    me: {
      id: student.id,
      nickname: student.nickname,
    },
    members: team.students.map((s) => ({
      id: s.id,
      nickname: s.nickname,
      active: s.lastSeenAt >= activeCutoff,
    })),
    activeCount: activeMembers.length,
    currentMission,
    runoff: validRunoff,
    elapsedSeconds,
    votes: votes.map((v) => ({
      studentId: v.studentId,
      optionIndex: v.optionIndex,
    })),
    myVote: votes.find((v) => v.studentId === student.id)?.optionIndex ?? null,
  });
}
