function parseFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

export const FEATURE_TEACHER_CONTROLS_V1 = parseFlag(
  process.env.FEATURE_TEACHER_CONTROLS_V1,
  true
);
export const FEATURE_TEACHER_AUTH_V2 = parseFlag(process.env.FEATURE_TEACHER_AUTH_V2, true);
export const FEATURE_STUDENT_RECOVERY_V1 = parseFlag(
  process.env.FEATURE_STUDENT_RECOVERY_V1,
  true
);
export const FEATURE_TEACHER_ALERTS_V1 = parseFlag(
  process.env.FEATURE_TEACHER_ALERTS_V1,
  true
);
export const FEATURE_TEACHER_AUTH_LEGACY_FALLBACK = parseFlag(
  process.env.FEATURE_TEACHER_AUTH_LEGACY_FALLBACK,
  true
);
