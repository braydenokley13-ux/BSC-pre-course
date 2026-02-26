export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { MISSIONS } from "@/lib/missions";
import { getUnlockedMissions, isGameComplete } from "@/lib/missionGraph";

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Update lastSeen
  await prisma.student.update({
    where: { id: student.id },
    data: { lastSeenAt: new Date() },
  });

  const team = await prisma.team.findUnique({
    where: { id: student.teamId },
    include: {
      students: { select: { id: true, nickname: true, lastSeenAt: true } },
      missionProgress: { orderBy: { completedAt: "asc" } },
      votes: {
        where: {
          missionId: MISSIONS[
            Math.min(
              (await prisma.team.findUnique({ where: { id: student.teamId }, select: { missionIndex: true } }))
                ?.missionIndex ?? 0,
              MISSIONS.length - 1
            )
          ]?.id ?? "",
        },
        select: { studentId: true, optionIndex: true },
      },
    },
  });

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const now = new Date();
  const activeCutoff = new Date(now.getTime() - 60 * 1000); // 60s
  const activeMembers = team.students.filter((s) => s.lastSeenAt >= activeCutoff);

  const currentMission = MISSIONS[team.missionIndex] ?? null;
  const badges = JSON.parse(team.badges) as string[];
  const completedMissions = JSON.parse(team.completedMissions) as string[];
  const teamStatus = JSON.parse(team.teamStatus) as string[];
  const roleAssignments = JSON.parse(team.roleAssignments) as Record<string, string>;
  const missionRoundState = JSON.parse(team.missionRoundState || "{}") as Record<string, unknown>;
  const unlockedMissions = getUnlockedMissions(completedMissions);
  const gameComplete = isGameComplete(completedMissions);
  const myRole = roleAssignments[student.id] ?? null;

  // Get votes for current mission
  const votes = currentMission
    ? await prisma.vote.findMany({ where: { teamId: team.id, missionId: currentMission.id } })
    : [];

  // Elapsed time on current mission
  const missionStartedAt = team.lastProgressAt;
  const elapsedSeconds = Math.floor((now.getTime() - missionStartedAt.getTime()) / 1000);

  return NextResponse.json({
    team: {
      id: team.id,
      name: team.name,
      joinCode: team.joinCode,
      missionIndex: team.missionIndex,
      badges,
      score: team.score,
      claimCode: team.claimCode,
      completedAt: team.completedAt,
      completedMissions,
      teamStatus,
    },
    me: {
      id: student.id,
      nickname: student.nickname,
      role: myRole,
    },
    members: team.students.map((s) => ({
      id: s.id,
      nickname: s.nickname,
      active: s.lastSeenAt >= activeCutoff,
      role: roleAssignments[s.id] ?? null,
    })),
    activeCount: activeMembers.length,
    currentMission,
    elapsedSeconds,
    votes: votes.map((v) => ({
      studentId: v.studentId,
      optionIndex: v.optionIndex,
    })),
    myVote: votes.find((v) => v.studentId === student.id)?.optionIndex ?? null,
    // New fields for rich mission system
    unlockedMissions,
    completedMissions,
    teamStatus,
    roleAssignments,
    missionRoundState,
    gameComplete,
  });
}
