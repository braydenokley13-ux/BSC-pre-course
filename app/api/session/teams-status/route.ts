export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";

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
      color: true,
      joinCode: true,
      students: { select: { id: true } },
    },
  });

  const teamsStatus = teams
    .filter((t) => t.id !== student.teamId)
    .map((t) => ({
      color: t.color ?? "blue",
      codePrefix: t.joinCode.slice(0, 2).toUpperCase(),
      memberCount: t.students.length,
    }));

  return NextResponse.json({ teams: teamsStatus });
}
