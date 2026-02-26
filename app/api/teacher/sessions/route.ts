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

  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      archivedAt: true,
      _count: {
        select: {
          teams: true,
          students: true,
          votes: true,
          missionProgress: true,
        },
      },
    },
  });

  return NextResponse.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      title: session.title,
      status: session.status,
      createdAt: session.createdAt,
      archivedAt: session.archivedAt,
      teamCount: session._count.teams,
      studentCount: session._count.students,
      voteCount: session._count.votes,
      missionProgressCount: session._count.missionProgress,
    })),
  });
}
