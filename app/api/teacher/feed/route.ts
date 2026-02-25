export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkTeacherPassword } from "@/lib/auth";
import { MISSIONS } from "@/lib/missions";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-teacher-password");
  if (!password) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await checkTeacherPassword(password);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await prisma.session.findFirst({
    where: { status: "active" },
    include: {
      teams: {
        include: {
          students: { select: { id: true, nickname: true, lastSeenAt: true } },
          missionProgress: true,
          catalogAttempts: true,
          finalSubmissions: { select: { studentId: true, claimCode: true, submittedAt: true } },
        },
      },
    },
  });

  if (!session) return NextResponse.json({ session: null });

  const now = new Date();
  const activeCutoff = new Date(now.getTime() - 60 * 1000);
  const stuckCutoff = new Date(now.getTime() - 3 * 60 * 1000);

  const teams = session.teams.map((t) => {
    const badges = JSON.parse(t.badges) as string[];
    const activeMembers = t.students.filter((s) => s.lastSeenAt >= activeCutoff);
    const isStuck = !t.completedAt && t.lastProgressAt < stuckCutoff && activeMembers.length > 0;
    const elapsedSeconds = Math.floor((now.getTime() - t.lastProgressAt.getTime()) / 1000);

    const checkPassRate =
      t.catalogAttempts.length > 0
        ? Math.round(
            (t.catalogAttempts.filter((a) => a.passed).length / t.catalogAttempts.length) * 100
          )
        : null;

    return {
      id: t.id,
      name: t.name,
      joinCode: t.joinCode,
      missionIndex: t.missionIndex,
      missionTitle: MISSIONS[t.missionIndex]?.title ?? "Complete",
      score: t.score,
      badges,
      badgeCount: badges.length,
      isComplete: !!t.completedAt,
      isStuck,
      elapsedSeconds,
      totalMembers: t.students.length,
      activeMembers: activeMembers.length,
      members: t.students.map((s) => ({
        id: s.id,
        nickname: s.nickname,
        active: s.lastSeenAt >= activeCutoff,
      })),
      claimCodesSubmitted: t.finalSubmissions.length,
      checkPassRate,
    };
  });

  return NextResponse.json({
    sessionId: session.id,
    title: session.title,
    createdAt: session.createdAt,
    teams,
    totalTeams: teams.length,
    completedTeams: teams.filter((t) => t.isComplete).length,
  });
}
