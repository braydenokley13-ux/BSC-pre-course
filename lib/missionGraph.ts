export const MISSION_ORDER = [
  "cap-crunch",
  "contract-choice",
  "revenue-mix",
  "expense-pressure",
  "stats-lineup",
  "matchup-adjust",
  "draft-table",
  "final-gm-call",
] as const;

export function getUnlockedMissions(completed: string[]): string[] {
  const completedSet = new Set(completed);

  for (let i = 0; i < MISSION_ORDER.length; i += 1) {
    const missionId = MISSION_ORDER[i];
    if (completedSet.has(missionId)) continue;

    const prereqs = MISSION_ORDER.slice(0, i);
    const ready = prereqs.every((prereqId) => completedSet.has(prereqId));
    return ready ? [missionId] : [];
  }

  return [];
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
