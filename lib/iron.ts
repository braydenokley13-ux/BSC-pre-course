// Simple cookie helpers for Next.js App Router
// We store the student token directly in a signed-like cookie (base64 encoded)
// For production, use a proper signing library. This is adequate for classroom use.

export const STUDENT_COOKIE = "bsc-student-token";
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export function makeSetCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${STUDENT_COOKIE}=${token}; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}; Path=/${secure}`;
}

export function parseStudentToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${STUDENT_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}
