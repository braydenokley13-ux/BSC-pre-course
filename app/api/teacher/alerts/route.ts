export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { FEATURE_TEACHER_ALERTS_V1 } from "@/lib/features";
import { getTeacherAlerts } from "@/lib/teacherInsights";

export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  if (!auth) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  if (!FEATURE_TEACHER_ALERTS_V1) {
    return NextResponse.json([]);
  }

  const sessionIdParam = req.nextUrl.searchParams.get("sessionId");
  const sessionId =
    sessionIdParam ??
    (
      await prisma.session.findFirst({
        where: { status: "active" },
        select: { id: true },
      })
    )?.id;

  if (!sessionId) return NextResponse.json([]);
  const alerts = await getTeacherAlerts(sessionId);
  return NextResponse.json(alerts);
}
