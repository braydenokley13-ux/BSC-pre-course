export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { MISSIONS } from "@/lib/missions";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { optionIndex } = await req.json() as { optionIndex: number };
  if (typeof optionIndex !== "number" || optionIndex < 0 || optionIndex > 3) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: student.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const mission = MISSIONS[team.missionIndex];
  if (!mission) return NextResponse.json({ error: "No active mission" }, { status: 400 });

  // Upsert vote (allow changing vote before reveal)
  await prisma.vote.upsert({
    where: {
      teamId_missionId_studentId_roundId: {
        teamId: team.id,
        missionId: mission.id,
        studentId: student.id,
        roundId: "final",
      },
    },
    update: { optionIndex },
    create: {
      sessionId: student.sessionId,
      teamId: team.id,
      studentId: student.id,
      missionId: mission.id,
      roundId: "final",
      optionIndex,
    },
  });

  return NextResponse.json({ ok: true, missionId: mission.id, optionIndex });
}
