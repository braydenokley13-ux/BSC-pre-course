export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { makeSetCookieHeader } from "@/lib/iron";
import { FEATURE_STUDENT_RECOVERY_V1 } from "@/lib/features";
import { verifyRecoveryCode } from "@/lib/recovery";
import { recordTeamEvent } from "@/lib/teamEvents";

interface Body {
  joinCode?: string;
  nickname?: string;
  recoveryCode?: string;
}

export async function POST(req: NextRequest) {
  if (!FEATURE_STUDENT_RECOVERY_V1) {
    return NextResponse.json({ error: "Recovery is disabled", code: "FEATURE_DISABLED" }, { status: 409 });
  }

  const body = (await req.json()) as Body;
  const joinCode = body.joinCode?.trim().toUpperCase();
  const nickname = body.nickname?.trim();
  const recoveryCode = body.recoveryCode?.trim();

  if (!joinCode || !nickname || !recoveryCode) {
    return NextResponse.json(
      { error: "joinCode, nickname, and recoveryCode are required", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const team = await prisma.team.findUnique({
    where: { joinCode },
    include: {
      session: { select: { id: true, status: true } },
    },
  });
  if (!team) {
    return NextResponse.json({ error: "Invalid join code", code: "NOT_FOUND" }, { status: 404 });
  }
  if (team.session.status !== "active") {
    return NextResponse.json(
      { error: "This session is archived and cannot be recovered.", code: "INVALID_STATE" },
      { status: 409 }
    );
  }

  const students = await prisma.student.findMany({
    where: { teamId: team.id },
    orderBy: { joinedAt: "desc" },
  });
  const student = students.find(
    (item) => item.nickname.trim().toLowerCase() === nickname.toLowerCase()
  );
  if (!student) {
    return NextResponse.json(
      { error: "Nickname was not found in this team.", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const validCode = verifyRecoveryCode(recoveryCode, student.recoveryCodeHash);
  if (!validCode) {
    return NextResponse.json({ error: "Recovery code does not match.", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const token = nanoid(32);
  await prisma.$transaction([
    prisma.student.update({
      where: { id: student.id },
      data: {
        token,
        lastSeenAt: new Date(),
      },
    }),
    prisma.team.update({
      where: { id: team.id },
      data: {
        lastProgressAt: new Date(),
        teamStateVersion: { increment: 1 },
      },
    }),
  ]);

  await recordTeamEvent({
    sessionId: team.session.id,
    teamId: team.id,
    eventType: "student_recovered",
    payload: { studentId: student.id },
  });

  const res = NextResponse.json({
    ok: true,
    studentId: student.id,
    teamId: team.id,
    tokenIssued: true,
  });
  res.headers.set("Set-Cookie", makeSetCookieHeader(token));
  return res;
}
