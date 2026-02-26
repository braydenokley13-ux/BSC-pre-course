export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { getMissionById, isLegacyMission, Mission } from "@/lib/missions";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { missionId, roundId, optionIndex } = (await req.json()) as {
    missionId: string;
    roundId: string;
    optionIndex: number;
  };

  if (!missionId || !roundId || typeof optionIndex !== "number") {
    return NextResponse.json({ error: "missionId, roundId, and optionIndex required" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: student.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const mission = getMissionById(missionId);
  if (!mission || isLegacyMission(mission)) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  const richMission = mission as Mission;

  // Validate optionIndex is in range for this round
  const round = richMission.rounds.find((r) => r.id === roundId)
    ?? richMission.rivalCounter?.responseRound;

  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });
  if (optionIndex < 0 || optionIndex >= round.options.length) {
    return NextResponse.json({ error: "Invalid optionIndex" }, { status: 400 });
  }

  // Upsert vote with roundId
  await prisma.vote.upsert({
    where: {
      teamId_missionId_studentId_roundId: {
        teamId: team.id,
        missionId,
        studentId: student.id,
        roundId,
      },
    },
    update: { optionIndex },
    create: {
      sessionId: student.sessionId,
      teamId: team.id,
      studentId: student.id,
      missionId,
      roundId,
      optionIndex,
    },
  });

  // Return current tally (without revealing who voted for what)
  const allVotes = await prisma.vote.findMany({
    where: { teamId: team.id, missionId, roundId },
    select: { studentId: true, optionIndex: true },
  });

  return NextResponse.json({
    ok: true,
    roundId,
    votedCount: allVotes.length,
    myVoteIndex: optionIndex,
  });
}
