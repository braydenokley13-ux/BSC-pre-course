import bcrypt from "bcryptjs";

export async function checkTeacherPassword(input: string): Promise<boolean> {
  const hash = process.env.TEACHER_PASSWORD;
  if (!hash) return false;
  // Support both plain text (for dev) and bcrypt hash (for prod)
  if (hash.startsWith("$2")) {
    return bcrypt.compare(input, hash);
  }
  return input === hash;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
