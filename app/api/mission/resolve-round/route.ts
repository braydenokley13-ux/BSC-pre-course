export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getStudentFromRequest } from "@/lib/getStudent";
import { resolveMissionRound } from "@/lib/missionRound";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    missionId?: string;
    roundId?: string;
    timedOut?: boolean;
  };
  const missionId = body.missionId?.trim();
  const roundId = body.roundId?.trim();

  if (!missionId || !roundId) {
    return NextResponse.json({ error: "missionId and roundId required" }, { status: 400 });
  }

  const result = await resolveMissionRound({
    teamId: student.teamId,
    sessionId: student.sessionId,
    missionId,
    roundId,
    allowNoVotes: body.timedOut === true,
    eventSource: "student",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.error, code: result.error.code },
      { status: result.error.status }
    );
  }

  return NextResponse.json(result.data);
}
