export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkTeacherPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const authed = await checkTeacherPassword(password);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.session.updateMany({
    where: { status: "active" },
    data: { status: "archived", archivedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
