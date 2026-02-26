import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkTeacherPassword } from "@/lib/auth";
import {
  FEATURE_TEACHER_AUTH_LEGACY_FALLBACK,
  FEATURE_TEACHER_AUTH_V2,
} from "@/lib/features";

export const TEACHER_SESSION_COOKIE = "bsc-teacher-session";
export const TEACHER_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h

export interface TeacherAuthContext {
  teacher: {
    id: string;
    role: "teacher";
  };
  authType: "session" | "legacy-password";
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${key}=([^;]+)`));
  return match?.[1] ?? null;
}

export function makeTeacherSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${TEACHER_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Max-Age=${TEACHER_SESSION_TTL_SECONDS}; Path=/${secure}`;
}

export function clearTeacherSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${TEACHER_SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/${secure}`;
}

export async function createTeacherSession(sessionId?: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TEACHER_SESSION_TTL_SECONDS * 1000);

  const row = await prisma.teacherSession.create({
    data: {
      tokenHash,
      expiresAt,
      sessionId: sessionId ?? null,
    },
  });

  return { token, session: row };
}

export async function revokeTeacherSessionFromRequest(req: NextRequest) {
  const token = parseCookieValue(req.headers.get("cookie"), TEACHER_SESSION_COOKIE);
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.teacherSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function validateTeacherPassword(password: string | null | undefined): Promise<boolean> {
  if (!password) return false;
  return checkTeacherPassword(password);
}

export async function getTeacherFromSession(req: NextRequest): Promise<TeacherAuthContext | null> {
  const token = parseCookieValue(req.headers.get("cookie"), TEACHER_SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = hashToken(token);
  const now = new Date();

  const session = await prisma.teacherSession.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: now },
    },
  });
  if (!session) return null;

  return {
    teacher: {
      id: "teacher",
      role: "teacher",
    },
    authType: "session",
  };
}

export async function requireTeacher(
  req: NextRequest,
  options?: { allowLegacyHeader?: boolean }
): Promise<TeacherAuthContext | null> {
  const fromSession = await getTeacherFromSession(req);
  if (fromSession) return fromSession;

  const allowLegacy = options?.allowLegacyHeader ?? true;
  const legacyAllowedByFlag =
    !FEATURE_TEACHER_AUTH_V2 || FEATURE_TEACHER_AUTH_LEGACY_FALLBACK;

  if (!allowLegacy || !legacyAllowedByFlag) return null;

  const password = req.headers.get("x-teacher-password");
  const valid = await validateTeacherPassword(password);
  if (!valid) return null;

  return {
    teacher: {
      id: "legacy-password",
      role: "teacher",
    },
    authType: "legacy-password",
  };
}
