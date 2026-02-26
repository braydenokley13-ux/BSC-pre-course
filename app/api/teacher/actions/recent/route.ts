export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { getRecentAdminActions } from "@/lib/adminActions";

export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  if (!auth) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "30");
  const limit = Number.isFinite(limitParam) ? limitParam : 30;
  const sessionIdParam = req.nextUrl.searchParams.get("sessionId");

  const sessionId =
    sessionIdParam ??
    (
      await prisma.session.findFirst({
        where: { status: "active" },
        select: { id: true },
      })
    )?.id;

  if (!sessionId) {
    return NextResponse.json({ actions: [] });
  }

  const actions = await getRecentAdminActions(sessionId, limit);
  return NextResponse.json({
    actions: actions.map((action) => ({
      id: action.id,
      teamId: action.teamId,
      actionType: action.actionType,
      createdAt: action.createdAt,
      success: Boolean(action.result.ok),
      payload: action.payload,
      result: action.result,
    })),
  });
}
