export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";

export async function GET(req: NextRequest) {
  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  if (!auth) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const activeSession = await prisma.session.findFirst({
    where: { status: "active" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      archivedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    teacher: auth.teacher,
    activeSession,
  });
}
