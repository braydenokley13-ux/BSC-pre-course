export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { FEATURE_TEACHER_CONTROLS_V1 } from "@/lib/features";
import { createAdminActionLog } from "@/lib/adminActions";
import { getDefaultNodeIdForStep } from "@/lib/missions";
import { recordTeamEvent } from "@/lib/teamEvents";

interface Body {
  teamId?: string;
  expectedStateVersion?: number;
}

const EMPTY_BRANCH_STATE = JSON.stringify({
  capFlex: 0,
  starPower: 0,
  dataTrust: 0,
  culture: 0,
  riskHeat: 0,
});

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

  const [, , , , updated] = await prisma.$transaction([
    prisma.vote.deleteMany({ where: { teamId: team.id } }),
    prisma.missionProgress.deleteMany({ where: { teamId: team.id } }),
    prisma.catalogAttempt.deleteMany({ where: { teamId: team.id } }),
    prisma.finalSubmission.deleteMany({ where: { teamId: team.id } }),
    prisma.team.update({
      where: { id: team.id },
      data: {
        missionIndex: 0,
        currentNodeId: getDefaultNodeIdForStep(1),
        branchStateJson: EMPTY_BRANCH_STATE,
        runoffStateJson: null,
        badges: JSON.stringify([]),
        score: 0,
        claimCode: null,
        completedAt: null,
        completedMissions: JSON.stringify([]),
        teamStatus: JSON.stringify([]),
        roleAssignments: JSON.stringify({}),
        missionRoundState: JSON.stringify({}),
        lastProgressAt: new Date(),
        teamStateVersion: { increment: 1 },
      },
      select: { teamStateVersion: true },
    }),
  ]);

  await recordTeamEvent({
    sessionId: team.sessionId,
    teamId: team.id,
    eventType: "team_reset",
    payload: { source: "teacher" },
  });

  const action = await createAdminActionLog({
    sessionId: team.sessionId,
    teamId: team.id,
    teacherIdOrKey: auth.teacher.id,
    actionType: "reset-team",
    payload: { expectedStateVersion: body.expectedStateVersion ?? null },
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
