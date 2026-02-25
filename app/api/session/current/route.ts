export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await prisma.session.findFirst({
    where: { status: "active" },
    include: { teams: { select: { id: true, name: true, joinCode: true, missionIndex: true } } },
  });

  if (!session) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      teams: session.teams,
    },
  });
}
