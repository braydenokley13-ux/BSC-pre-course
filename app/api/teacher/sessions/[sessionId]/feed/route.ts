export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { loadTeacherFeed } from "@/lib/teacherData";

interface Params {
  params: {
    sessionId: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  if (!auth) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const sessionId = params.sessionId?.trim();
  if (!sessionId) {
    return errorResponse("sessionId is required", "BAD_REQUEST", 400);
  }

  const feed = await loadTeacherFeed({ sessionId });
  if (!feed.session) {
    return errorResponse("Session not found", "NOT_FOUND", 404);
  }

  return NextResponse.json(feed);
}
