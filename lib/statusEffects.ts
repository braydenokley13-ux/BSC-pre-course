export interface StatusEffect {
  id: string;
  label: string;       // short display label: "STAR RETAINED"
  description: string; // what it means for the team
  icon: string;        // emoji for quick display
  positive: boolean;   // for UI coloring (gold vs red)
}

export const STATUS_EFFECTS: Record<string, StatusEffect> = {
  "star-retained": {
    id: "star-retained",
    label: "STAR RETAINED",
    description: "Your franchise player is locked in. Future roster decisions benefit from elite talent.",
    icon: "★",
    positive: true,
  },
  "rebuild-mode": {
    id: "rebuild-mode",
    label: "REBUILD MODE",
    description: "Team is in a rebuilding phase. Draft and development decisions carry more weight.",
    icon: "⟳",
    positive: false,
  },
  "over-luxury-tax": {
    id: "over-luxury-tax",
    label: "OVER LUXURY TAX",
    description: "Payroll exceeds the luxury tax line. Trade matching and cap flexibility are constrained.",
    icon: "⚠",
    positive: false,
  },
  "cap-space-limited": {
    id: "cap-space-limited",
    label: "CAP SPACE LIMITED",
    description: "Roster depth was sacrificed for cap room. Mid-season options are narrowed.",
    icon: "↓",
    positive: false,
  },
  "analytics-forward": {
    id: "analytics-forward",
    label: "ANALYTICS FORWARD",
    description: "Data-driven culture is established. Model-based decisions yield better outcomes.",
    icon: "◈",
    positive: true,
  },
  "coach-conflict": {
    id: "coach-conflict",
    label: "COACH CONFLICT",
    description: "Front office and coaching staff are at odds. Some roster options are limited.",
    icon: "✕",
    positive: false,
  },
  "high-morale": {
    id: "high-morale",
    label: "HIGH MORALE",
    description: "Team culture is strong. Next mission outcome scores are boosted by +1.",
    icon: "↑",
    positive: true,
  },
  "trade-assets-rich": {
    id: "trade-assets-rich",
    label: "TRADE ASSETS RICH",
    description: "Stockpiled picks and young talent. Draft and trade missions have expanded options.",
    icon: "◆",
    positive: true,
  },
  "scout-trusted": {
    id: "scout-trusted",
    label: "SCOUT TRUSTED",
    description: "Scouting staff has earned front office trust. Traditional evaluation options are strengthened.",
    icon: "◉",
    positive: true,
  },
};

export function getStatusEffect(id: string): StatusEffect | undefined {
  return STATUS_EFFECTS[id];
}

export function hasStatus(teamStatus: string[], id: string): boolean {
  return teamStatus.includes(id);
}

export function applyStatuses(
  current: string[],
  toAdd: string[],
  toRemove: string[] = []
): string[] {
  const without = current.filter((s) => !toRemove.includes(s));
  const combined = Array.from(new Set([...without, ...toAdd]));
  return combined;
}

// Returns +1 score bonus if team has high-morale status
export function getMoralBonus(teamStatus: string[]): number {
  return hasStatus(teamStatus, "high-morale") ? 1 : 0;
}
