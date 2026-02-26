export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import {
  GAME_SITUATION_COUNT,
  getDefaultNodeIdForStep,
  getMissionNode,
} from "@/lib/missions";

type RunoffState = {
  optionIndexes: number[];
  endsAt: string;
};

function parseRunoff(raw: string | null): RunoffState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RunoffState;
    if (!Array.isArray(parsed.optionIndexes) || typeof parsed.endsAt !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { optionIndex } = (await req.json()) as { optionIndex: number };
  if (typeof optionIndex !== "number") {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: student.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (team.missionIndex >= GAME_SITUATION_COUNT) {
    return NextResponse.json({ error: "No active situation" }, { status: 400 });
  }

  const step = Math.min(team.missionIndex + 1, GAME_SITUATION_COUNT);
  const missionId = team.currentNodeId || getDefaultNodeIdForStep(step);
  const mission = getMissionNode(missionId);
  if (!mission) return NextResponse.json({ error: "No active situation" }, { status: 400 });

  if (optionIndex < 0 || optionIndex >= mission.options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const runoff = parseRunoff(team.runoffStateJson);
  const runoffConfigured = runoff && runoff.optionIndexes.length > 0;
  const runoffExpired = runoffConfigured && new Date(runoff.endsAt).getTime() <= Date.now();
  if (runoffExpired) {
    return NextResponse.json({ error: "Runoff voting window closed. Resolving now." }, { status: 409 });
  }
  if (runoffConfigured && !runoff.optionIndexes.includes(optionIndex)) {
    return NextResponse.json(
      {
        error: "Runoff vote must use one of the tied options",
        allowed: runoff.optionIndexes,
      },
      { status: 400 }
    );
  }

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

  return NextResponse.json({ ok: true, missionId: mission.id, optionIndex, runoffActive: !!runoffConfigured });
}
