export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/apiErrors";
import {
  createTeacherSession,
  makeTeacherSessionCookie,
  validateTeacherPassword,
} from "@/lib/teacherAuth";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { password?: string };
  const password = body.password?.trim();
  const valid = await validateTeacherPassword(password);
  if (!valid) {
    return errorResponse("Invalid password", "UNAUTHORIZED", 401);
  }

  const activeSession = await prisma.session.findFirst({
    where: { status: "active" },
    select: { id: true },
  });

  const { token } = await createTeacherSession(activeSession?.id);
  const res = NextResponse.json({
    ok: true,
    teacher: { id: "teacher", role: "teacher" as const },
  });
  res.headers.set("Set-Cookie", makeTeacherSessionCookie(token));
  return res;
}
