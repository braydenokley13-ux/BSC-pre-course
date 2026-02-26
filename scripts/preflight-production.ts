function fail(message: string): never {
  console.error(`[prod-preflight] FAIL: ${message}`);
  process.exit(1);
}

function ok(message: string) {
  console.log(`[prod-preflight] OK: ${message}`);
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is missing.`);
  return value;
}

function validateTeacherPassword(value: string) {
  if (value.length < 12) {
    fail("TEACHER_PASSWORD is too short. Use a long password or bcrypt hash.");
  }
  if (!value.startsWith("$2") && value.includes(" ")) {
    fail("TEACHER_PASSWORD plain text should not contain spaces.");
  }
}

function validateDatabaseUrl(value: string) {
  if (value.startsWith("file:")) {
    fail("DATABASE_URL uses sqlite (file:). Use a hosted Postgres URL for production.");
  }
  const lower = value.toLowerCase();
  if (!lower.startsWith("postgres://") && !lower.startsWith("postgresql://")) {
    fail("DATABASE_URL must start with postgres:// or postgresql:// for production.");
  }
}

function main() {
  const nodeEnv = process.env.NODE_ENV?.trim() || "production";
  if (nodeEnv !== "production") {
    ok(`NODE_ENV=${nodeEnv}. Running checks anyway.`);
  }

  const databaseUrl = requireEnv("DATABASE_URL");
  const teacherPassword = requireEnv("TEACHER_PASSWORD");
  const recoveryPepper = requireEnv("RECOVERY_CODE_PEPPER");

  validateDatabaseUrl(databaseUrl);
  validateTeacherPassword(teacherPassword);
  if (recoveryPepper.length < 16) {
    fail("RECOVERY_CODE_PEPPER should be at least 16 characters.");
  }

  ok("DATABASE_URL, TEACHER_PASSWORD, and RECOVERY_CODE_PEPPER are valid.");
}

main();
