export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { generateStudentClaimCode } from "@/lib/claimCode";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: student.teamId } });
  if (!team?.claimCode) {
    return NextResponse.json({ error: "Team has not completed all missions" }, { status: 400 });
  }

  // Check if already submitted
  const existing = await prisma.finalSubmission.findFirst({
    where: { studentId: student.id },
  });
  if (existing) {
    return NextResponse.json({ claimCode: existing.claimCode, alreadySubmitted: true });
  }

  const claimCode = generateStudentClaimCode(team.claimCode, student.id);

  await prisma.finalSubmission.create({
    data: {
      sessionId: student.sessionId,
      teamId: student.teamId,
      studentId: student.id,
      claimCode,
    },
  });

  return NextResponse.json({ claimCode, ok: true });
}
