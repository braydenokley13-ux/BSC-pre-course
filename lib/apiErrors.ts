import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FEATURE_DISABLED"
  | "INVALID_STATE"
  | "MISSION_LOCKED"
  | "STATE_VERSION_CONFLICT";

export function errorResponse(
  error: string,
  code: ApiErrorCode,
  status: 400 | 401 | 404 | 409
) {
  return NextResponse.json({ error, code }, { status });
}
