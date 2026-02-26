export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher, validateTeacherPassword } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { password?: string };
  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  let authedByPassword = false;
  if (!auth && body.password) {
    authedByPassword = await validateTeacherPassword(body.password);
  }
  if (!auth && !authedByPassword) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  await prisma.session.updateMany({
    where: { status: "active" },
    data: { status: "archived", archivedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
