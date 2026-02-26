type PrereqMode = "all" | "any" | "count";

interface MissionNode {
  prereqs: string[];
  prereqMode: PrereqMode;
  prereqCount?: number; // used when mode === "count"
}

export const MISSION_GRAPH: Record<string, MissionNode> = {
  "cap-crunch": {
    prereqs: [],
    prereqMode: "all",
  },
  "contract-choice": {
    prereqs: ["cap-crunch"],
    prereqMode: "all",
  },
  "revenue-mix": {
    prereqs: ["cap-crunch"],
    prereqMode: "all",
  },
  "stats-lineup": {
    prereqs: ["cap-crunch"],
    prereqMode: "all",
  },
  "expense-pressure": {
    prereqs: ["contract-choice", "revenue-mix", "stats-lineup"],
    prereqMode: "count",
    prereqCount: 2,
  },
  "matchup-adjust": {
    prereqs: ["contract-choice", "stats-lineup"],
    prereqMode: "any",
  },
  "draft-table": {
    prereqs: ["revenue-mix", "stats-lineup"],
    prereqMode: "any",
  },
  "final-gm-call": {
    prereqs: [],
    prereqMode: "count",
    prereqCount: 6,
  },
};

function isMissionUnlocked(
  missionId: string,
  completed: string[]
): boolean {
  const node = MISSION_GRAPH[missionId];
  if (!node) return false;
  if (completed.includes(missionId)) return false; // already done

  const { prereqs, prereqMode, prereqCount } = node;

  if (prereqMode === "all") {
    return prereqs.every((p) => completed.includes(p));
  }
  if (prereqMode === "any") {
    return prereqs.length === 0 || prereqs.some((p) => completed.includes(p));
  }
  if (prereqMode === "count") {
    if (prereqs.length === 0) {
      // "final-gm-call" uses total completed count
      return completed.length >= (prereqCount ?? 0);
    }
    const matchCount = prereqs.filter((p) => completed.includes(p)).length;
    return matchCount >= (prereqCount ?? 0);
  }
  return false;
}

export function getUnlockedMissions(completed: string[]): string[] {
  return Object.keys(MISSION_GRAPH).filter((id) =>
    isMissionUnlocked(id, completed)
  );
}

export function isGameComplete(completed: string[]): boolean {
  return completed.includes("final-gm-call");
}

// Room metadata for the HQ floor map
export interface RoomMeta {
  missionId: string;
  department: string;
  roomName: string;
  tagline: string;
  gridCol: number; // 1-3
  gridRow: number; // 1-4
}

export const ROOM_LAYOUT: RoomMeta[] = [
  {
    missionId: "cap-crunch",
    department: "SALARY CAP DEPT",
    roomName: "Cap Room",
    tagline: "Extension deadline in 48 hours.",
    gridCol: 2,
    gridRow: 1,
  },
  {
    missionId: "contract-choice",
    department: "CONTRACT OFFICE",
    roomName: "Contract Office",
    tagline: "Supermax or sign-and-trade?",
    gridCol: 1,
    gridRow: 2,
  },
  {
    missionId: "revenue-mix",
    department: "PARTNERSHIP OFFICE",
    roomName: "Revenue Hub",
    tagline: "Largest sponsorship in franchise history.",
    gridCol: 2,
    gridRow: 2,
  },
  {
    missionId: "stats-lineup",
    department: "ANALYTICS LAB",
    roomName: "Analytics Lab",
    tagline: "The model says bench the starters.",
    gridCol: 3,
    gridRow: 2,
  },
  {
    missionId: "expense-pressure",
    department: "TRADE OPERATIONS",
    roomName: "Trade Desk",
    tagline: "Deadline deal — salary must match.",
    gridCol: 1,
    gridRow: 3,
  },
  {
    missionId: "matchup-adjust",
    department: "MEDICAL BAY",
    roomName: "Medical Bay",
    tagline: "Franchise player showing fatigue signs.",
    gridCol: 2,
    gridRow: 3,
  },
  {
    missionId: "draft-table",
    department: "DRAFT WAR ROOM",
    roomName: "Draft Table",
    tagline: "10 minutes on the clock at #6.",
    gridCol: 3,
    gridRow: 3,
  },
  {
    missionId: "final-gm-call",
    department: "OWNERSHIP SUITE",
    roomName: "Owner's Suite",
    tagline: "The owner wants your three-year plan.",
    gridCol: 2,
    gridRow: 4,
  },
];
