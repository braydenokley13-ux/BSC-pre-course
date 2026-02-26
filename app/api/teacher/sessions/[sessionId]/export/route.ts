export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";
import { buildSessionExport } from "@/lib/teacherData";

interface Params {
  params: {
    sessionId: string;
  };
}

function parseFormat(value: string | null): "summary" | "detail" {
  return value === "detail" ? "detail" : "summary";
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

  const format = parseFormat(req.nextUrl.searchParams.get("format"));
  const csv = await buildSessionExport(sessionId, format);
  if (csv == null) {
    return errorResponse("Session not found", "NOT_FOUND", 404);
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="bsc-${format}-${sessionId}.csv"`,
    },
  });
}
