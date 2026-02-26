export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  clearTeacherSessionCookie,
  revokeTeacherSessionFromRequest,
} from "@/lib/teacherAuth";

export async function POST(req: NextRequest) {
  await revokeTeacherSessionFromRequest(req);
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearTeacherSessionCookie());
  return res;
}
