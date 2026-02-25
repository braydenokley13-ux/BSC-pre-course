export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { makeSetCookieHeader } from "@/lib/iron";

export async function POST(req: NextRequest) {
  const { nickname, joinCode } = (await req.json()) as {
    nickname: string;
    joinCode: string;
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

  const token = nanoid(32);

  const student = await prisma.student.create({
    data: {
      sessionId: team.sessionId,
      teamId: team.id,
      nickname: nickname.trim(),
      token,
    },
  });

  const res = NextResponse.json({
    studentId: student.id,
    teamId: team.id,
    teamName: team.name,
    sessionId: team.sessionId,
  });

  res.headers.set("Set-Cookie", makeSetCookieHeader(token));

  return res;
}
