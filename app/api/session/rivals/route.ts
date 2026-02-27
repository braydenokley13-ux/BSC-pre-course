export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";

interface RivalEvent {
  teamName: string;
  teamColor: string;
  message: string;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  void req;
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const team = await prisma.team.findUnique({
    where: { id: student.teamId },
    select: { sessionId: true },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const cutoff = new Date(Date.now() - 90 * 1000); // last 90 seconds

  const events = await prisma.teamEvent.findMany({
    where: {
      sessionId: team.sessionId,
      teamId: { not: student.teamId },
      eventType: "mission_completed",
      createdAt: { gte: cutoff },
    },
    include: {
      team: { select: { name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const rivals: RivalEvent[] = events.map((ev) => {
    let payload: { missionTitle?: string; scoreDelta?: number } = {};
    try { payload = JSON.parse(ev.payloadJson) as typeof payload; } catch { /* ignore */ }
    const title = payload.missionTitle ?? "a mission";
    const delta = payload.scoreDelta ?? 0;
    const teamName = ev.team.name;
    const teamColor = ev.team.color ?? "blue";

    const messages = [
      `${teamName} cleared ${title}! +${delta} pts 🔥`,
      `${teamName} just wrapped ${title} — +${delta}`,
      `Breaking: ${teamName} finished ${title} 📋`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      teamName,
      teamColor,
      message,
      createdAt: ev.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ rivals });
}
