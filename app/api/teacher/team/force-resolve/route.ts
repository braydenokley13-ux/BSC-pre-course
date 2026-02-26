export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { FEATURE_TEACHER_CONTROLS_V1 } from "@/lib/features";
import { createAdminActionLog } from "@/lib/adminActions";
import { parseMissionRoundState, resolveMissionRound } from "@/lib/missionRound";

interface Body {
  teamId?: string;
  expectedStateVersion?: number;
  forcedOptionIndex?: number;
}

export async function POST(req: NextRequest) {
  if (!FEATURE_TEACHER_CONTROLS_V1) {
    return errorResponse("Teacher controls are disabled", "FEATURE_DISABLED", 409);
  }

  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  if (!auth) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const body = (await req.json()) as Body;
  const teamId = body.teamId?.trim();
  if (!teamId) {
    return errorResponse("teamId is required", "BAD_REQUEST", 400);
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { session: { select: { id: true, status: true } } },
  });
  if (!team) {
    return errorResponse("Team not found", "NOT_FOUND", 404);
  }
  if (team.session.status !== "active") {
    return errorResponse("Session is archived", "INVALID_STATE", 409);
  }
  if (
    typeof body.expectedStateVersion === "number" &&
    team.teamStateVersion !== body.expectedStateVersion
  ) {
    return errorResponse("State version conflict", "STATE_VERSION_CONFLICT", 409);
  }

  const roundState = parseMissionRoundState(team.missionRoundState);
  if (!roundState.missionId || !roundState.currentRoundId || roundState.isResolved) {
    const action = await createAdminActionLog({
      sessionId: team.sessionId,
      teamId: team.id,
      teacherIdOrKey: auth.teacher.id,
      actionType: "force-resolve",
      payload: {
        expectedStateVersion: body.expectedStateVersion ?? null,
        forcedOptionIndex: body.forcedOptionIndex ?? null,
      },
      result: { ok: false, error: "No active round to resolve" },
    });
    return NextResponse.json(
      {
        error: "No active round to resolve",
        code: "INVALID_STATE",
        actionId: action.id,
      },
      { status: 409 }
    );
  }

  const resolved = await resolveMissionRound({
    teamId: team.id,
    sessionId: team.sessionId,
    missionId: roundState.missionId,
    roundId: roundState.currentRoundId,
    allowNoVotes: true,
    forcedOptionIndex: body.forcedOptionIndex,
    eventSource: "teacher",
  });

  if (!resolved.ok) {
    const action = await createAdminActionLog({
      sessionId: team.sessionId,
      teamId: team.id,
      teacherIdOrKey: auth.teacher.id,
      actionType: "force-resolve",
      payload: {
        expectedStateVersion: body.expectedStateVersion ?? null,
        missionId: roundState.missionId,
        roundId: roundState.currentRoundId,
        forcedOptionIndex: body.forcedOptionIndex ?? null,
      },
      result: {
        ok: false,
        error: resolved.error.error,
        code: resolved.error.code,
      },
    });
    return NextResponse.json(
      {
        error: resolved.error.error,
        code: resolved.error.code,
        actionId: action.id,
      },
      { status: resolved.error.status }
    );
  }

  const action = await createAdminActionLog({
    sessionId: team.sessionId,
    teamId: team.id,
    teacherIdOrKey: auth.teacher.id,
    actionType: "force-resolve",
    payload: {
      expectedStateVersion: body.expectedStateVersion ?? null,
      missionId: roundState.missionId,
      roundId: roundState.currentRoundId,
      forcedOptionIndex: body.forcedOptionIndex ?? null,
    },
    result: {
      ok: true,
      nextRoundId: resolved.data.nextRoundId,
      isComplete: resolved.data.isComplete,
      stateVersion: resolved.data.stateVersion,
    },
  });

  return NextResponse.json({
    ok: true,
    teamId: team.id,
    actionId: action.id,
    stateVersion: resolved.data.stateVersion,
  });
}
