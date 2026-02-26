export interface GlossaryTerm {
  id: string;
  term: string;
  def: string;
  why: string;
}

export interface GlossaryGroup {
  group: string;
  terms: GlossaryTerm[];
}

export interface ConceptCard {
  id: string;
  title: string;
  body: string;
  note: string;
  missionId: string;
  termIds: string[];
}

export const GLOSSARY_TERMS: GlossaryGroup[] = [
  {
    group: "Cap Rules",
    terms: [
      {
        id: "salary-cap",
        term: "Salary Cap",
        def: "A spending line for total player salaries.",
        why: "It sets your budget shape before you make roster moves.",
      },
      {
        id: "soft-cap",
        term: "Soft Cap",
        def: "A cap you can pass only with allowed exceptions.",
        why: "It gives teams paths to improve even when over the cap.",
      },
      {
        id: "hard-cap",
        term: "Hard Cap",
        def: "A strict spending ceiling you cannot cross.",
        why: "If you hit it, many moves become impossible.",
      },
      {
        id: "luxury-tax-line",
        term: "Luxury Tax Line",
        def: "The payroll level where tax penalties begin.",
        why: "Going over this line raises real cash costs quickly.",
      },
      {
        id: "second-apron",
        term: "Second Apron",
        def: "A higher line with strong roster-building limits.",
        why: "Above this line, trade and signing tools shrink.",
      },
      {
        id: "dead-money",
        term: "Dead Money",
        def: "Cap money paid to a player no longer on your roster.",
        why: "It blocks spending room without helping on court.",
      },
      {
        id: "cap-hold",
        term: "Cap Hold",
        def: "A placeholder number for a free agent you still control.",
        why: "Cap holds can reduce space before signings happen.",
      },
      {
        id: "cap-flexibility",
        term: "Cap Flexibility",
        def: "Your ability to react to trades, signings, and injuries.",
        why: "Flexible teams can pivot faster when markets shift.",
      },
      {
        id: "bri",
        term: "BRI",
        def: "Basketball Related Income, the league's total revenue pool.",
        why: "Cap growth comes from league revenue growth.",
      },
      {
        id: "escrow",
        term: "Escrow",
        def: "Part of player pay held back until revenue share is settled.",
        why: "It keeps owner-player income split near CBA targets.",
      },
      {
        id: "revenue-sharing",
        term: "Revenue Sharing",
        def: "League money rebalanced across teams.",
        why: "It helps smaller markets compete with larger markets.",
      },
      {
        id: "local-revenue",
        term: "Local Revenue",
        def: "Team money from arena sales and local sponsor deals.",
        why: "Local revenue often drives owner pressure and spending plans.",
      },
    ],
  },
  {
    group: "Contracts",
    terms: [
      {
        id: "bird-rights",
        term: "Bird Rights",
        def: "Rights that let a team re-sign its own player over the cap.",
        why: "This is one of the strongest ways to keep stars.",
      },
      {
        id: "mle",
        term: "Mid-Level Exception",
        def: "A signing tool for teams already over the cap.",
        why: "It is often the main path to add rotation talent.",
      },
      {
        id: "bae",
        term: "Bi-Annual Exception",
        def: "A smaller exception used every other year.",
        why: "Useful for depth if your payroll is in range.",
      },
      {
        id: "room-exception",
        term: "Room Exception",
        def: "A special signing tool for teams that used cap room.",
        why: "It helps under-cap teams add one more useful player.",
      },
      {
        id: "extension",
        term: "Contract Extension",
        def: "Extra years added before a contract expires.",
        why: "Early extensions can beat future market prices.",
      },
      {
        id: "player-option",
        term: "Player Option",
        def: "The player can choose whether to stay for the final year.",
        why: "It gives players timing power in negotiations.",
      },
      {
        id: "team-option",
        term: "Team Option",
        def: "The team can choose whether to keep the final year.",
        why: "It gives teams low-risk control on role players.",
      },
      {
        id: "mutual-option",
        term: "Mutual Option",
        def: "Both team and player must agree to continue.",
        why: "It adds flexibility but often leads to new talks.",
      },
      {
        id: "qualifying-offer",
        term: "Qualifying Offer",
        def: "One-year offer that creates restricted free agency rights.",
        why: "It lets a team match outside offers on young players.",
      },
      {
        id: "restricted-free-agent",
        term: "Restricted Free Agent",
        def: "A free agent whose current team can match offers.",
        why: "This keeps leverage with the original team.",
      },
      {
        id: "free-agency",
        term: "Free Agency",
        def: "The period when players can sign with new teams.",
        why: "Major roster swings often happen in this window.",
      },
      {
        id: "supermax",
        term: "Supermax",
        def: "A top-tier extension slot for qualifying elite players.",
        why: "It helps teams keep stars but can stress cap structure.",
      },
      {
        id: "rookie-scale",
        term: "Rookie Scale Deal",
        def: "Preset pay structure for first-round picks.",
        why: "Cheap rookie value is a big edge in team building.",
      },
      {
        id: "two-way-contract",
        term: "Two-Way Contract",
        def: "A deal that splits time between NBA and G League.",
        why: "It is a low-cost way to test and develop talent.",
      },
      {
        id: "no-trade-clause",
        term: "No-Trade Clause",
        def: "A contract rule requiring player consent for trades.",
        why: "It sharply limits team trade control.",
      },
      {
        id: "market-value",
        term: "Market Value",
        def: "What a player is likely worth in open bidding.",
        why: "Deals far from market value create future problems.",
      },
    ],
  },
  {
    group: "Trades and Assets",
    terms: [
      {
        id: "trade-matching-rule",
        term: "Trade Matching Rule",
        def: "Over-cap teams must send enough salary to receive salary.",
        why: "Most blocked trades fail this math test.",
      },
      {
        id: "salary-aggregation",
        term: "Salary Aggregation",
        def: "Combining multiple contracts in one trade package.",
        why: "It unlocks deals for larger incoming contracts.",
      },
      {
        id: "sign-and-trade",
        term: "Sign-and-Trade",
        def: "A player signs with his team, then is traded right away.",
        why: "It can recover value instead of losing a player for nothing.",
      },
      {
        id: "trade-kicker",
        term: "Trade Kicker",
        def: "Extra pay triggered when a player is traded.",
        why: "It can make a trade harder to complete.",
      },
      {
        id: "draft-pick-value",
        term: "Draft Pick Value",
        def: "How much future value a pick can create.",
        why: "Pick value is central in rebuild and trade strategy.",
      },
      {
        id: "asset-timeline",
        term: "Asset Timeline",
        def: "When your picks, players, and cap room peak together.",
        why: "Mismatched timelines cause wasted windows.",
      },
    ],
  },
  {
    group: "Analytics",
    terms: [
      {
        id: "per",
        term: "PER",
        def: "A per-minute box score productivity metric.",
        why: "Helpful for quick scans, but not complete by itself.",
      },
      {
        id: "true-shooting",
        term: "True Shooting %",
        def: "Shooting efficiency that includes 2s, 3s, and free throws.",
        why: "Better than raw field-goal percent for scoring efficiency.",
      },
      {
        id: "win-shares",
        term: "Win Shares",
        def: "Estimated wins a player adds over a season.",
        why: "It ties individual output to team results.",
      },
      {
        id: "bpm",
        term: "BPM",
        def: "Estimated impact per 100 possessions from box data.",
        why: "Useful for comparing impact across roles.",
      },
      {
        id: "vorp",
        term: "VORP",
        def: "Total value over a replacement-level player.",
        why: "Helps compare players with different minutes.",
      },
      {
        id: "net-rating",
        term: "Net Rating",
        def: "Point margin per 100 possessions.",
        why: "It reflects whether lineups actually win minutes.",
      },
      {
        id: "usage-rate",
        term: "Usage Rate",
        def: "Share of team plays a player finishes while on court.",
        why: "It shows role size and offensive load.",
      },
      {
        id: "dollar-per-win-share",
        term: "$/Win Share",
        def: "Contract dollars spent per win-share output.",
        why: "It helps grade contract efficiency.",
      },
      {
        id: "market-inefficiency",
        term: "Market Inefficiency",
        def: "A player or skill that is underpriced by the market.",
        why: "Finding these edges builds strong value rosters.",
      },
      {
        id: "sample-size",
        term: "Sample Size",
        def: "How much data is used before making a decision.",
        why: "Small samples can trick teams into bad conclusions.",
      },
    ],
  },
  {
    group: "Team Strategy",
    terms: [
      {
        id: "load-management",
        term: "Load Management",
        def: "Planned rest to lower injury risk and preserve form.",
        why: "Healthy stars in playoffs matter more than extra March wins.",
      },
      {
        id: "injury-risk",
        term: "Injury Risk",
        def: "Chance a player gets hurt due to workload or conditions.",
        why: "Risk-aware minute plans protect both season and career.",
      },
      {
        id: "minute-load",
        term: "Minute Load",
        def: "How many minutes a player carries over time.",
        why: "Minute spikes often predict fatigue and strain.",
      },
      {
        id: "soft-tissue",
        term: "Soft-Tissue Stress",
        def: "Muscle and tendon strain signs before major injury.",
        why: "Early warning lets teams prevent longer absences.",
      },
      {
        id: "availability",
        term: "Availability",
        def: "How often a player can suit up and contribute.",
        why: "Talent only helps when it is on the floor.",
      },
      {
        id: "team-culture",
        term: "Team Culture",
        def: "Shared trust, habits, and standards inside the organization.",
        why: "Strong culture improves execution in stressful moments.",
      },
      {
        id: "seeding",
        term: "Seeding",
        def: "Playoff rank based on regular-season record.",
        why: "Seeding changes matchup difficulty and home-court advantage.",
      },
      {
        id: "front-office-philosophy",
        term: "Front Office Philosophy",
        def: "The guiding strategy for roster, cap, and timeline choices.",
        why: "Clear philosophy keeps decisions consistent over years.",
      },
    ],
  },
];

export const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: "luxury-tax",
    missionId: "m1_cap_crunch",
    title: "Luxury Tax and Cap Pressure",
    termIds: [
      "luxury-tax-line",
      "second-apron",
      "cap-flexibility",
      "salary-cap",
      "soft-cap",
      "hard-cap",
      "cap-hold",
      "escrow",
      "dead-money",
    ],
    body: "When payroll goes over the tax line, each extra dollar costs more than one dollar. If a team keeps doing this, the bill gets even larger. Teams near the second apron also lose major roster tools.",
    note: "Simple rule: cap room is optionality. Tax pressure shrinks optionality.",
  },
  {
    id: "extensions-options",
    missionId: "m2_contract_balanced",
    title: "Extensions and Contract Options",
    termIds: [
      "extension",
      "player-option",
      "team-option",
      "supermax",
      "mle",
      "bae",
      "room-exception",
      "mutual-option",
      "no-trade-clause",
      "bird-rights",
      "qualifying-offer",
      "restricted-free-agent",
      "free-agency",
    ],
    body: "An extension is a deal added before free agency. A player option gives the player choice on the final year. A team option gives the team that choice. These details decide who has leverage later.",
    note: "Simple rule: early, fair extensions often cost less than late panic deals.",
  },
  {
    id: "bri-revenue",
    missionId: "m3_revenue_balanced",
    title: "League Revenue and Team Budget",
    termIds: ["bri", "revenue-sharing", "local-revenue"],
    body: "League revenue helps set cap growth. National money is shared widely, while local arena and sponsor income is mostly team specific. That is why local deals matter to team spending plans.",
    note: "Simple rule: stable revenue planning creates cleaner roster decisions.",
  },
  {
    id: "trade-matching",
    missionId: "m4_trade_control",
    title: "Trade Matching Basics",
    termIds: ["trade-matching-rule", "salary-aggregation", "second-apron", "sign-and-trade", "trade-kicker"],
    body: "Most over-cap teams must send out enough salary before they can take salary back. Combining contracts can make a legal trade, but apron rules can remove that tool.",
    note: "Simple rule: if a trade seems impossible, check the salary math first.",
  },
  {
    id: "analytics",
    missionId: "m5_analytics_collab",
    title: "Analytics for Better Decisions",
    termIds: [
      "net-rating",
      "true-shooting",
      "bpm",
      "sample-size",
      "dollar-per-win-share",
      "per",
      "win-shares",
      "vorp",
      "usage-rate",
      "market-inefficiency",
    ],
    body: "Good front offices use metrics in bundles, not one number alone. Net rating shows lineup results. Shooting efficiency shows scoring quality. Larger samples make choices safer.",
    note: "Simple rule: use data to guide decisions, then test in real rotation context.",
  },
  {
    id: "roster-health",
    missionId: "m6_load_planned",
    title: "Roster Health and Workload",
    termIds: ["load-management", "minute-load", "injury-risk", "availability", "soft-tissue", "seeding"],
    body: "Workload management is a strategy, not weakness. Planned rest and minute control can reduce injury risk and keep players stronger for playoff games.",
    note: "Simple rule: availability is part of player value.",
  },
  {
    id: "rookie-scale",
    missionId: "m7_draft_scout",
    title: "Draft Contracts and Cost Control",
    termIds: ["rookie-scale", "team-option", "draft-pick-value", "two-way-contract"],
    body: "First-round rookies are usually cost-controlled compared with veteran market prices. If development goes well, that value gap becomes a major team advantage.",
    note: "Simple rule: good drafting creates performance above payroll cost.",
  },
  {
    id: "front-office-philosophy",
    missionId: "m8_final_balanced",
    title: "Your Front Office Philosophy",
    termIds: ["front-office-philosophy", "cap-flexibility", "asset-timeline", "team-culture"],
    body: "A philosophy is your decision filter. It tells you when to push, when to wait, and how to line up stars, picks, and cap room over time.",
    note: "Simple rule: clear direction beats random short-term reactions.",
  },
];

export function getConceptCard(id: string): ConceptCard | undefined {
  return CONCEPT_CARDS.find((c) => c.id === id);
}

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return GLOSSARY_TERMS.flatMap((group) => group.terms);
}

export function getGlossaryTermById(id: string): GlossaryTerm | undefined {
  return getAllGlossaryTerms().find((term) => term.id === id);
}
