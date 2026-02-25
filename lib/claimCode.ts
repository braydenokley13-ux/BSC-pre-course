import { createHash } from "crypto";

export function generateTeamClaimCode(teamId: string, badges: string[]): string {
  const payload = `${teamId}:${badges.sort().join(",")}`;
  const hash = createHash("sha256").update(payload).digest("hex").slice(0, 6).toUpperCase();
  return `BSC-${hash}`;
}

export function generateStudentClaimCode(teamClaimCode: string, studentId: string): string {
  const suffix = createHash("sha256").update(studentId).digest("hex").slice(0, 4).toUpperCase();
  return `${teamClaimCode}-${suffix}`;
}
