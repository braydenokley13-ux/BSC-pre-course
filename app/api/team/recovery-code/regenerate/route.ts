export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { FEATURE_STUDENT_RECOVERY_V1 } from "@/lib/features";
import { generateRecoveryCode, hashRecoveryCode } from "@/lib/recovery";

export async function POST(req: NextRequest) {
  if (!FEATURE_STUDENT_RECOVERY_V1) {
    return NextResponse.json({ error: "Recovery is disabled", code: "FEATURE_DISABLED" }, { status: 409 });
  }

  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = hashRecoveryCode(recoveryCode);

  await prisma.student.update({
    where: { id: student.id },
    data: {
      recoveryCodeHash,
      recoveryCodeUpdatedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    recoveryCode,
  });
}
