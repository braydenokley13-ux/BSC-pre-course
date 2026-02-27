export interface BranchState {
  capFlex: number;
  starPower: number;
  dataTrust: number;
  culture: number;
  riskHeat: number;
}

export interface GmTitle {
  key: string;
  title: string;
  desc: string;
  emoji: string;
}

const GM_TITLE_RULES: Array<{ test: (b: BranchState) => boolean; title: GmTitle }> = [
  {
    test: (b) => b.riskHeat >= 2 && b.starPower >= 2,
    title: {
      key: "win-now",
      title: "The Win-Now GM",
      desc: "Bold moves, high stakes — you built to win today. The fans love it.",
      emoji: "🏆",
    },
  },
  {
    test: (b) => b.dataTrust >= 2 && b.riskHeat < 2,
    title: {
      key: "analytics",
      title: "The Analytics GM",
      desc: "Data-driven every step of the way. You trust the numbers over gut feelings.",
      emoji: "📊",
    },
  },
  {
    test: (b) => b.capFlex >= 2 && b.starPower < 2,
    title: {
      key: "rebuilder",
      title: "The Rebuilder",
      desc: "Patient, cap-smart, and playing the long game. Your best moves haven't happened yet.",
      emoji: "🔄",
    },
  },
  {
    test: (b) => b.culture >= 2,
    title: {
      key: "culture",
      title: "The Culture Builder",
      desc: "Chemistry and cohesion above all else. Your team fights for each other.",
      emoji: "🤝",
    },
  },
  {
    test: (b) => b.starPower >= 2 && b.dataTrust >= 1,
    title: {
      key: "star-analyst",
      title: "The Modern GM",
      desc: "Stars and stats together. You blended old-school scouting with new-school data.",
      emoji: "⭐",
    },
  },
];

const FALLBACK_TITLE: GmTitle = {
  key: "balanced",
  title: "The All-Around GM",
  desc: "No single style defined you — you read each situation and responded. Balanced and adaptable.",
  emoji: "⚖️",
};

export function computeGmTitle(branchState: BranchState): GmTitle {
  for (const rule of GM_TITLE_RULES) {
    if (rule.test(branchState)) return rule.title;
  }
  return FALLBACK_TITLE;
}
