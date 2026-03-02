export const TEAM_COLOR_HEX: Record<string, string> = {
  blue: "#3b82f6",
  gold: "#c9a84c",
  purple: "#7c3aed",
  red: "#ef4444",
  green: "#22c55e",
  teal: "#14b8a6",
  orange: "#f97316",
  // Use a light slate for "black" teams so they remain visible on the dark UI.
  black: "#cbd5e1",
};

function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value);
}

export function normalizeTeamColor(color: string | null | undefined): string | null {
  const normalized = color?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export function getTeamColorHex(
  color: string | null | undefined,
  fallback: keyof typeof TEAM_COLOR_HEX = "gold"
): string {
  const normalized = normalizeTeamColor(color);
  if (!normalized) return TEAM_COLOR_HEX[fallback];
  if (normalized in TEAM_COLOR_HEX) {
    return TEAM_COLOR_HEX[normalized];
  }
  if (isHexColor(normalized)) {
    return normalized;
  }
  return TEAM_COLOR_HEX[fallback];
}
