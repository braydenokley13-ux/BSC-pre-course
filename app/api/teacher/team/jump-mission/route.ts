export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { FEATURE_TEACHER_CONTROLS_V1 } from "@/lib/features";
import { createAdminActionLog } from "@/lib/adminActions";
import { getMissionById } from "@/lib/missions";
import { getUnlockedMissions } from "@/lib/missionGraph";
import { parseJson } from "@/lib/json";
import { recordTeamEvent } from "@/lib/teamEvents";

interface Body {
  teamId?: string;
  missionId?: string;
  expectedStateVersion?: number;
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
  const missionId = body.missionId?.trim();
  if (!teamId || !missionId) {
    return errorResponse("teamId and missionId are required", "BAD_REQUEST", 400);
  }

  if (!getMissionById(missionId)) {
    return errorResponse("Mission not found", "NOT_FOUND", 404);
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { session: { select: { status: true } } },
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

  const completedMissions = parseJson<string[]>(team.completedMissions, []);
  const unlocked = new Set(getUnlockedMissions(completedMissions));
  if (!unlocked.has(missionId)) {
    const action = await createAdminActionLog({
      sessionId: team.sessionId,
      teamId: team.id,
      teacherIdOrKey: auth.teacher.id,
      actionType: "jump-mission",
      payload: {
        missionId,
        expectedStateVersion: body.expectedStateVersion ?? null,
      },
      result: {
        ok: false,
        error: "Mission is locked for this team",
      },
    });
    return NextResponse.json(
      {
        error: "Mission is locked for this team",
        code: "MISSION_LOCKED",
        actionId: action.id,
      },
      { status: 409 }
    );
  }

  const updated = await prisma.team.update({
    where: { id: team.id },
    data: {
      currentNodeId: missionId,
      missionRoundState: JSON.stringify({}),
      roleAssignments: JSON.stringify({}),
      runoffStateJson: null,
      lastProgressAt: new Date(),
      teamStateVersion: { increment: 1 },
    },
    select: { teamStateVersion: true },
  });

  await recordTeamEvent({
    sessionId: team.sessionId,
    teamId: team.id,
    eventType: "mission_jump",
    payload: {
      source: "teacher",
      missionId,
    },
  });

  const action = await createAdminActionLog({
    sessionId: team.sessionId,
    teamId: team.id,
    teacherIdOrKey: auth.teacher.id,
    actionType: "jump-mission",
    payload: {
      missionId,
      expectedStateVersion: body.expectedStateVersion ?? null,
    },
    result: {
      ok: true,
      stateVersion: updated.teamStateVersion,
    },
  });

  return NextResponse.json({
    ok: true,
    teamId: team.id,
    actionId: action.id,
    stateVersion: updated.teamStateVersion,
  });
}
