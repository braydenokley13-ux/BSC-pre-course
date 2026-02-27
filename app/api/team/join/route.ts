export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { makeSetCookieHeader } from "@/lib/iron";
import { generateRecoveryCode, hashRecoveryCode } from "@/lib/recovery";
import { FEATURE_STUDENT_RECOVERY_V1 } from "@/lib/features";
import { recordTeamEvent } from "@/lib/teamEvents";

export async function POST(req: NextRequest) {
  const { nickname, joinCode, avatarId } = (await req.json()) as {
    nickname: string;
    joinCode: string;
    avatarId?: string;
  };

  if (!nickname?.trim() || !joinCode?.trim()) {
    return NextResponse.json(
      { error: "Nickname and join code required" },
      { status: 400 }
    );
  }

  const team = await prisma.team.findUnique({
    where: { joinCode: joinCode.trim().toUpperCase() },
    include: { session: true },
  });

  if (!team) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
  }

  if (team.session.status !== "active") {
    return NextResponse.json(
      { error: "Session is no longer active" },
      { status: 410 }
    );
  }

  const normalizedNickname = nickname.trim();
  const existingStudents = await prisma.student.findMany({
    where: { teamId: team.id },
    select: { id: true, nickname: true },
  });
  const duplicate = existingStudents.find(
    (student) => student.nickname.trim().toLowerCase() === normalizedNickname.toLowerCase()
  );
  if (duplicate && FEATURE_STUDENT_RECOVERY_V1) {
    return NextResponse.json(
      {
        error:
          "That nickname is already in this team. Use recovery so you can return to your original seat.",
        code: "NICKNAME_TAKEN_RECOVERABLE",
        canRecover: true,
      },
      { status: 409 }
    );
  }

  const token = nanoid(32);
  const recoveryCode = FEATURE_STUDENT_RECOVERY_V1 ? generateRecoveryCode() : null;
  const recoveryCodeHash = recoveryCode ? hashRecoveryCode(recoveryCode) : null;

  const student = await prisma.student.create({
    data: {
      sessionId: team.sessionId,
      teamId: team.id,
      nickname: normalizedNickname,
      avatarId: avatarId?.trim() || "hawks",
      token,
      recoveryCodeHash,
      recoveryCodeUpdatedAt: recoveryCode ? new Date() : null,
    },
  });

  await prisma.team.update({
    where: { id: team.id },
    data: {
      lastProgressAt: new Date(),
      teamStateVersion: { increment: 1 },
    },
  });

  await recordTeamEvent({
    sessionId: team.sessionId,
    teamId: team.id,
    eventType: "student_joined",
    payload: { studentId: student.id },
  });

  const res = NextResponse.json({
    studentId: student.id,
    teamId: team.id,
    teamName: team.name,
    sessionId: team.sessionId,
    ...(recoveryCode ? { recoveryCode } : {}),
  });

  res.headers.set("Set-Cookie", makeSetCookieHeader(token));

  return res;
}
