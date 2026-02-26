import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";

export type TeacherActionType =
  | "force-resolve"
  | "clear-round-votes"
  | "jump-mission"
  | "reset-team";

interface AdminActionLogInput {
  sessionId: string;
  teamId: string;
  teacherIdOrKey: string;
  actionType: TeacherActionType;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
}

export async function createAdminActionLog(input: AdminActionLogInput) {
  return prisma.adminActionLog.create({
    data: {
      sessionId: input.sessionId,
      teamId: input.teamId,
      teacherIdOrKey: input.teacherIdOrKey,
      actionType: input.actionType,
      payloadJson: JSON.stringify(input.payload),
      resultJson: JSON.stringify(input.result),
    },
  });
}

export async function getRecentAdminActions(sessionId: string, limit = 30) {
  const rows = await prisma.adminActionLog.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 100)),
  });

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.sessionId,
    teamId: row.teamId,
    teacherIdOrKey: row.teacherIdOrKey,
    actionType: row.actionType,
    payload: parseJson<Record<string, unknown>>(row.payloadJson, {}),
    result: parseJson<Record<string, unknown>>(row.resultJson, {}),
    createdAt: row.createdAt,
  }));
}
