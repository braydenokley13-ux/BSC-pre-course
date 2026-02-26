import { createHash, randomBytes } from "crypto";

function getRecoveryPepper(): string {
  return process.env.RECOVERY_CODE_PEPPER ?? "";
}

export function generateRecoveryCode(): string {
  // Format like ABCD-EFGH so it is easier to read in class.
  const raw = randomBytes(6).toString("base64url").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const padded = (raw + "ABCDEFGH").slice(0, 8);
  return `${padded.slice(0, 4)}-${padded.slice(4, 8)}`;
}

export function normalizeRecoveryCode(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function hashRecoveryCode(code: string): string {
  const normalized = normalizeRecoveryCode(code);
  return createHash("sha256").update(`${normalized}:${getRecoveryPepper()}`).digest("hex");
}

export function verifyRecoveryCode(input: string, expectedHash: string | null | undefined): boolean {
  if (!expectedHash) return false;
  return hashRecoveryCode(input) === expectedHash;
}
