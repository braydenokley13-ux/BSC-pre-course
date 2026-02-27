export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { computeGmTitle, BranchState } from "@/lib/gmTitles";

function parseBranchState(raw: string): BranchState {
  try {
    return JSON.parse(raw) as BranchState;
  } catch {
    return { capFlex: 0, starPower: 0, dataTrust: 0, culture: 0, riskHeat: 0 };
  }
}

function parseJsonArray(raw: string): string[] {
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const team = await prisma.team.findUnique({
    where: { id: student.teamId },
    select: { sessionId: true },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const teams = await prisma.team.findMany({
    where: { sessionId: team.sessionId },
    select: {
      id: true,
      name: true,
      score: true,
      color: true,
      completedAt: true,
      branchStateJson: true,
      badges: true,
    },
    orderBy: [
      { score: "desc" },
      { completedAt: "asc" },
    ],
  });

  const leaderboard = teams.map((t, idx) => {
    const branchState = parseBranchState(t.branchStateJson);
    const gmTitle = computeGmTitle(branchState);
    const badgeCount = parseJsonArray(t.badges).length;

    return {
      rank: idx + 1,
      teamId: t.id,
      teamName: t.name,
      score: t.score,
      color: t.color ?? "blue",
      completedAt: t.completedAt?.toISOString() ?? null,
      gmTitle: gmTitle.title,
      gmDesc: gmTitle.desc,
      gmEmoji: gmTitle.emoji,
      badgeCount,
      isCurrentTeam: t.id === student.teamId,
    };
  });

  return NextResponse.json({ leaderboard });
}
