export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { getCheck } from "@/lib/checks";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { conceptId, q1Answer, q2Answer } = await req.json() as {
    conceptId: string;
    q1Answer: number;
    q2Answer: number;
  };

  const check = getCheck(conceptId);
  if (!check) return NextResponse.json({ error: "Unknown concept" }, { status: 400 });

  const q1Correct = q1Answer === check.questions[0].correctIndex;
  const q2Correct = q2Answer === check.questions[1].correctIndex;
  const passed = q1Correct && q2Correct;

  // Count prior attempts for this student+concept
  const priorAttempts = await prisma.catalogAttempt.count({
    where: { studentId: student.id, conceptId },
  });

  await prisma.catalogAttempt.create({
    data: {
      sessionId: student.sessionId,
      teamId: student.teamId,
      studentId: student.id,
      conceptId,
      q1Answer,
      q2Answer,
      q1Correct,
      q2Correct,
      passed,
      attemptNum: priorAttempts + 1,
    },
  });

  return NextResponse.json({
    q1Correct,
    q2Correct,
    passed,
    attemptNum: priorAttempts + 1,
    correctAnswers: passed
      ? null
      : {
          q1: check.questions[0].correctIndex,
          q2: check.questions[1].correctIndex,
        },
  });
}
