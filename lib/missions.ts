export const GAME_SITUATION_COUNT = 8;

export interface BranchState {
  capFlex: number;
  starPower: number;
  dataTrust: number;
  culture: number;
  riskHeat: number;
}

export type BranchDelta = Partial<Record<keyof BranchState, number>>;

export interface MissionOption {
  label: string;
  note: string;
  termIds: string[];
  tags: string[];
  effects: {
    scoreΔ: number;
    branchΔ: BranchDelta;
  };
  outcome: {
    narrative: string;
  };
  // Optional node override for extra decisions in the same situation.
  nextNodeId?: string;
}

export interface MissionNode {
  id: string;
  step: number;
  title: string;
  scenario: string;
  conceptId: string;
  termIds: string[];
  options: MissionOption[];
}

export const DEFAULT_BRANCH_STATE: BranchState = {
  capFlex: 0,
  starPower: 0,
  dataTrust: 0,
  culture: 0,
  riskHeat: 0,
};

const STEP_ENTRY_NODE_IDS: Record<number, string> = {
  1: "m1_cap_crunch",
  2: "m2_contract_balanced",
  3: "m3_revenue_balanced",
  4: "m4_trade_control",
  5: "m5_analytics_collab",
  6: "m6_load_planned",
  7: "m7_draft_scout",
  8: "m8_final_balanced",
};

export function getDefaultNodeIdForStep(step: number): string {
  return STEP_ENTRY_NODE_IDS[step] ?? STEP_ENTRY_NODE_IDS[1];
}

export function createBranchState(input?: Partial<BranchState> | null): BranchState {
  return {
    capFlex: Number(input?.capFlex ?? 0),
    starPower: Number(input?.starPower ?? 0),
    dataTrust: Number(input?.dataTrust ?? 0),
    culture: Number(input?.culture ?? 0),
    riskHeat: Number(input?.riskHeat ?? 0),
  };
}

export function applyBranchDelta(state: BranchState, delta: BranchDelta): BranchState {
  return {
    capFlex: state.capFlex + Number(delta.capFlex ?? 0),
    starPower: state.starPower + Number(delta.starPower ?? 0),
    dataTrust: state.dataTrust + Number(delta.dataTrust ?? 0),
    culture: state.culture + Number(delta.culture ?? 0),
    riskHeat: state.riskHeat + Number(delta.riskHeat ?? 0),
  };
}

export const MISSION_GRAPH: Record<string, MissionNode> = {
  m1_cap_crunch: {
    id: "m1_cap_crunch",
    step: 1,
    title: "Situation 1: Cap Squeeze",
    scenario:
      "Your team is near the tax line. Your starting point guard wants a new deal today. If you pay now, you may lose cash flexibility. If you wait, he could leave this summer.",
    conceptId: "luxury-tax",
    termIds: ["salary-cap", "luxury-tax-line", "cap-flexibility", "extension"],
    options: [
      {
        label: "Move a small contract to stay under the tax",
        note: "Keep a tax buffer before signing the guard.",
        termIds: ["luxury-tax-line", "dead-money"],
        tags: ["safe", "cap-discipline"],
        effects: { scoreΔ: 5, branchΔ: { capFlex: 2, culture: -1, riskHeat: -1 } },
        outcome: {
          narrative:
            "You kept room under the tax. Ownership is calm. The bench is thinner, but your books are cleaner.",
        },
      },
      {
        label: "Sign him now and accept the tax bill",
        note: "Keep your starter and pay extra this year.",
        termIds: ["extension", "luxury-tax-line"],
        tags: ["win-now", "star-retention"],
        effects: { scoreΔ: 8, branchΔ: { starPower: 2, culture: 1, riskHeat: 1 } },
        outcome: {
          narrative:
            "The player signed fast. The locker room is happy. The tax bill hurts, so future mistakes will cost more.",
        },
      },
      {
        label: "Offer a short bridge deal",
        note: "Two years, moderate money, both sides keep options.",
        termIds: ["extension", "player-option", "team-option"],
        tags: ["balanced", "risk-managed"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 1, culture: 1 } },
        outcome: {
          narrative:
            "Both sides accepted a short deal. You bought time. Next year will decide if this was smart or just delay.",
        },
      },
      {
        label: "Let him test free agency",
        note: "Bet that you can replace him later.",
        termIds: ["free-agency", "qualifying-offer"],
        tags: ["high-risk", "reset"],
        effects: { scoreΔ: 2, branchΔ: { capFlex: 3, starPower: -2, culture: -2, riskHeat: 2 } },
        outcome: {
          narrative:
            "He left for a bigger deal. You gained cap space but lost a key starter and trust inside the room.",
        },
      },
    ],
  },
  m2_contract_cap: {
    id: "m2_contract_cap",
    step: 2,
    title: "Situation 2: Value Deal Talks",
    scenario:
      "Your top young scorer is up for an extension. You want a fair deal that protects long-term cap space.",
    conceptId: "extensions-options",
    termIds: ["extension", "salary-cap", "bird-rights", "player-option"],
    options: [
      {
        label: "Offer 4 years at a team-friendly rate",
        note: "Lower yearly cost, no player option.",
        termIds: ["extension", "team-option"],
        tags: ["cost-controlled"],
        effects: { scoreΔ: 7, branchΔ: { capFlex: 2, culture: -1 } },
        outcome: { narrative: "You saved money and kept flexibility. The player signed, but his camp remembers the discount." },
      },
      {
        label: "Offer full max to remove all doubt",
        note: "Pay top dollar and lock him in.",
        termIds: ["supermax", "extension"],
        tags: ["star-retention"],
        effects: { scoreΔ: 8, branchΔ: { starPower: 2, culture: 1, capFlex: -1 } },
        outcome: { narrative: "He signed on the spot. You kept your star core, but your future cap is tighter." },
      },
      {
        label: "Use a short extension with a player option",
        note: "Cheaper now, more pressure later.",
        termIds: ["player-option", "extension"],
        tags: ["balanced"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 1, starPower: 1, riskHeat: 1 } },
        outcome: { narrative: "You reached a middle deal. It works today, but you may face a hard renegotiation soon." },
      },
      {
        label: "Delay and force restricted free agency",
        note: "Hold rights and wait for market signals.",
        termIds: ["qualifying-offer", "restricted-free-agent"],
        tags: ["hard-line"],
        effects: { scoreΔ: 4, branchΔ: { capFlex: 2, culture: -2, riskHeat: 2 } },
        outcome: { narrative: "You kept leverage, but trust dropped. The locker room sees this as a cold move." },
      },
    ],
  },
  m2_contract_star: {
    id: "m2_contract_star",
    step: 2,
    title: "Situation 2: Supermax Moment",
    scenario:
      "Your All-NBA player is eligible for a supermax. If you hesitate, trade rumors grow by the hour.",
    conceptId: "extensions-options",
    termIds: ["supermax", "extension", "player-option"],
    options: [
      {
        label: "Offer supermax now",
        note: "Clear message: this is his franchise.",
        termIds: ["supermax"],
        tags: ["win-now"],
        effects: { scoreΔ: 9, branchΔ: { starPower: 3, culture: 1, capFlex: -2 } },
        outcome: { narrative: "You locked in a superstar. Fans celebrate. Your cap sheet now needs precise moves." },
      },
      {
        label: "Offer near-max with team protections",
        note: "Strong pay, but with less long-term risk.",
        termIds: ["extension", "team-option"],
        tags: ["balanced"],
        effects: { scoreΔ: 7, branchΔ: { starPower: 2, capFlex: 1 } },
        outcome: { narrative: "The deal got done after tense talks. You kept your star and protected future space." },
      },
      {
        label: "Ask for one-week pause before final terms",
        note: "Buy time to compare future tax paths.",
        termIds: ["luxury-tax-line", "cap-flexibility"],
        tags: ["wait"],
        effects: { scoreΔ: 5, branchΔ: { capFlex: 1, culture: -1, riskHeat: 1 } },
        outcome: { narrative: "You got more info, but the player side felt disrespected. Trust dipped." },
      },
      {
        label: "Explore sign-and-trade market",
        note: "Move him for picks and youth.",
        termIds: ["sign-and-trade", "draft-pick-value"],
        tags: ["rebuild-assets"],
        effects: { scoreΔ: 3, branchΔ: { capFlex: 3, starPower: -3, culture: -2, riskHeat: 2 } },
        outcome: { narrative: "You gained assets but lost a franchise star. The city reaction is loud and split." },
      },
    ],
  },
  m2_contract_balanced: {
    id: "m2_contract_balanced",
    step: 2,
    title: "Situation 2: Smart Extension Window",
    scenario:
      "Your rising guard can sign early. If you move now, you likely save money. If you wait, price may jump.",
    conceptId: "extensions-options",
    termIds: ["extension", "market-value", "player-option"],
    options: [
      {
        label: "Sign early at fair market value",
        note: "Keep relationship strong and avoid bidding war.",
        termIds: ["market-value", "extension"],
        tags: ["balanced"],
        effects: { scoreΔ: 8, branchΔ: { capFlex: 1, culture: 2 } },
        outcome: { narrative: "You got a fair deal before prices climbed. Team morale improved." },
      },
      {
        label: "Push hard for below-market number",
        note: "Try to win the contract by pure leverage.",
        termIds: ["market-value", "restricted-free-agent"],
        tags: ["hard-negotiation"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 2, culture: -1, riskHeat: 1 } },
        outcome: { narrative: "You saved money but burned goodwill. You may pay that back later." },
      },
      {
        label: "Add player option to close quickly",
        note: "Trade control for fast agreement.",
        termIds: ["player-option"],
        tags: ["fast-close"],
        effects: { scoreΔ: 6, branchΔ: { starPower: 1, culture: 1, riskHeat: 1 } },
        outcome: { narrative: "Deal closed fast. The option gives the player future leverage." },
      },
      {
        label: "Wait for free agency and match later",
        note: "Take short-term risk for cap clarity now.",
        termIds: ["qualifying-offer", "restricted-free-agent"],
        tags: ["wait"],
        effects: { scoreΔ: 4, branchΔ: { capFlex: 1, culture: -2, riskHeat: 2 } },
        outcome: { narrative: "You delayed the decision. The room feels uncertain and rumors are rising." },
      },
    ],
  },
  m2_contract_risk: {
    id: "m2_contract_risk",
    step: 2,
    title: "Situation 2: Hardline Contract Bet",
    scenario:
      "After your last risky move, your best young player wants commitment. The team wants to know if you are all-in.",
    conceptId: "extensions-options",
    termIds: ["extension", "qualifying-offer", "team-culture"],
    options: [
      {
        label: "Give a strong 4-year deal today",
        note: "Stabilize the room and reset trust.",
        termIds: ["extension"],
        tags: ["trust-repair"],
        effects: { scoreΔ: 8, branchΔ: { culture: 2, starPower: 1 } },
        outcome: { narrative: "You sent a clear message. Players saw commitment, and tension cooled." },
      },
      {
        label: "Offer short deal with team option",
        note: "Keep control while limiting downside.",
        termIds: ["team-option"],
        tags: ["control"],
        effects: { scoreΔ: 5, branchΔ: { capFlex: 2, culture: -1 } },
        outcome: { narrative: "You gained control, but the player camp feels squeezed." },
      },
      {
        label: "Settle on 2+1 compromise",
        note: "Both sides take some risk.",
        termIds: ["player-option", "team-option"],
        tags: ["middle-ground"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 1, culture: 1, riskHeat: 1 } },
        outcome: { narrative: "The compromise works for now. Future pressure is still coming." },
      },
      {
        label: "No extension; prove-it season",
        note: "Make him earn the next contract.",
        termIds: ["restricted-free-agent"],
        tags: ["high-risk"],
        effects: { scoreΔ: 2, branchΔ: { capFlex: 2, culture: -3, riskHeat: 2 } },
        outcome: { narrative: "You kept money open, but trust dropped hard across the roster." },
      },
    ],
  },
  m3_revenue_owner: {
    id: "m3_revenue_owner",
    step: 3,
    title: "Situation 3: Owner-First Sponsor Deal",
    scenario:
      "A sponsor offers a big jersey patch package. Ownership wants max dollars, even with strict media demands on players.",
    conceptId: "bri-revenue",
    termIds: ["bri", "revenue-sharing", "luxury-tax-line", "team-culture"],
    options: [
      {
        label: "Take full cash package",
        note: "Highest money, strict sponsor rules.",
        termIds: ["bri", "local-revenue"],
        tags: ["revenue-max"],
        effects: { scoreΔ: 8, branchΔ: { starPower: 1, culture: -2 } },
        outcome: { narrative: "Revenue jumped. Players feel over-managed. You must watch chemistry closely." },
      },
      {
        label: "Negotiate fewer player obligations",
        note: "Slightly less money, better locker room fit.",
        termIds: ["local-revenue", "team-culture"],
        tags: ["balanced"],
        effects: { scoreΔ: 9, branchΔ: { culture: 2, capFlex: 1 } },
        outcome: { narrative: "Great balance. Money stayed strong and players accepted the terms." },
      },
      {
        label: "Reject deal to protect team voice",
        note: "No forced brand posts.",
        termIds: ["revenue-sharing"],
        tags: ["culture-first"],
        effects: { scoreΔ: 4, branchΔ: { culture: 2, capFlex: -1 } },
        outcome: { narrative: "Players respect the call. Ownership is upset about lost income." },
      },
      {
        label: "Use performance bonuses only",
        note: "Lower base pay with playoff upside.",
        termIds: ["local-revenue"],
        tags: ["risk"],
        effects: { scoreΔ: 6, branchΔ: { riskHeat: 1, capFlex: 1 } },
        outcome: { narrative: "The structure is clever, but budgeting becomes less predictable." },
      },
    ],
  },
  m3_revenue_culture: {
    id: "m3_revenue_culture",
    step: 3,
    title: "Situation 3: Culture-First Revenue Plan",
    scenario:
      "Your players trust you, and they want sponsor terms that do not control their voice. Ownership still wants growth.",
    conceptId: "bri-revenue",
    termIds: ["bri", "revenue-sharing", "team-culture"],
    options: [
      {
        label: "Take medium deal with clear boundaries",
        note: "Good income and strong player buy-in.",
        termIds: ["local-revenue"],
        tags: ["balanced"],
        effects: { scoreΔ: 9, branchΔ: { culture: 2, capFlex: 1 } },
        outcome: { narrative: "This landed well with everyone. You built trust and still raised revenue." },
      },
      {
        label: "Take full deal to chase bigger budget",
        note: "More money now, tougher player obligations.",
        termIds: ["local-revenue", "bri"],
        tags: ["owner-first"],
        effects: { scoreΔ: 7, branchΔ: { capFlex: 2, culture: -2 } },
        outcome: { narrative: "Cash improved quickly, but locker room trust took a hit." },
      },
      {
        label: "No sponsor this cycle",
        note: "Hold out for better terms next year.",
        termIds: ["revenue-sharing"],
        tags: ["patient"],
        effects: { scoreΔ: 5, branchΔ: { culture: 1, capFlex: -2 } },
        outcome: { narrative: "You kept control, but the budget stayed tight for roster moves." },
      },
      {
        label: "Short one-year trial deal",
        note: "Test fit before long commitment.",
        termIds: ["local-revenue"],
        tags: ["test-and-learn"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 1, culture: 1 } },
        outcome: { narrative: "A safe pilot. You get data before locking into a long contract." },
      },
    ],
  },
  m3_revenue_balanced: {
    id: "m3_revenue_balanced",
    step: 3,
    title: "Situation 3: Sponsor Structure Choice",
    scenario:
      "You have two sponsor offers: one with bigger cash and stricter terms, and one with less cash but better team fit.",
    conceptId: "bri-revenue",
    termIds: ["bri", "local-revenue", "revenue-sharing"],
    options: [
      {
        label: "Choose the larger cash deal",
        note: "Boost budget now.",
        termIds: ["local-revenue"],
        tags: ["revenue-max"],
        effects: { scoreΔ: 8, branchΔ: { capFlex: 2, culture: -1 } },
        outcome: { narrative: "Your budget got better fast. Player buy-in slipped a little." },
      },
      {
        label: "Choose the player-friendly deal",
        note: "Protect culture while still growing income.",
        termIds: ["team-culture"],
        tags: ["culture-first"],
        effects: { scoreΔ: 8, branchΔ: { culture: 2, capFlex: 1 } },
        outcome: { narrative: "You kept trust high and still added useful revenue." },
      },
      {
        label: "Blend terms with custom clauses",
        note: "Work both sides into one deal.",
        termIds: ["local-revenue", "bri"],
        tags: ["negotiation"],
        effects: { scoreΔ: 9, branchΔ: { culture: 1, capFlex: 1 } },
        outcome: { narrative: "Best mix. You avoided extreme tradeoffs and got a stable path." },
      },
      {
        label: "Delay all sponsor decisions",
        note: "Wait for market conditions.",
        termIds: ["market-value"],
        tags: ["wait"],
        effects: { scoreΔ: 4, branchΔ: { capFlex: -1, riskHeat: 1 } },
        outcome: { narrative: "You kept options open, but uncertainty now follows every budget meeting." },
      },
    ],
  },
  m4_trade_aggressive: {
    id: "m4_trade_aggressive",
    step: 4,
    title: "Situation 4: Deadline Pressure Trade",
    scenario:
      "You are pushing hard for the playoffs. A high-salary star is available, but matching salary is tight under trade rules.",
    conceptId: "trade-matching",
    termIds: ["trade-matching-rule", "salary-aggregation", "second-apron", "trade-kicker"],
    options: [
      {
        label: "Aggregate contracts and close now",
        note: "Two outgoing deals for one major piece.",
        termIds: ["salary-aggregation", "trade-matching-rule"],
        tags: ["aggressive"],
        effects: { scoreΔ: 9, branchΔ: { starPower: 2, riskHeat: 2, capFlex: -1 } },
        outcome: { narrative: "The trade worked and talent improved. You are now operating with less error room." },
      },
      {
        label: "Three-team trade to lower risk",
        note: "Use a partner team to absorb salary.",
        termIds: ["salary-aggregation", "second-apron"],
        tags: ["complex"],
        effects: { scoreΔ: 8, branchΔ: { starPower: 1, capFlex: 1, riskHeat: 1 } },
        outcome: { narrative: "Complex but clean. You upgraded while avoiding the worst cap trap." },
      },
      {
        label: "Smaller trade, keep picks",
        note: "Add depth without major salary spike.",
        termIds: ["trade-matching-rule", "draft-pick-value"],
        tags: ["controlled"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 1, culture: 1 } },
        outcome: { narrative: "Not flashy, but useful. You kept flexibility for the offseason." },
      },
      {
        label: "Pass on all deadline deals",
        note: "Trust current roster.",
        termIds: ["cap-flexibility"],
        tags: ["hold"],
        effects: { scoreΔ: 4, branchΔ: { capFlex: 2, starPower: -1 } },
        outcome: { narrative: "You protected assets. Fans wanted more action, but your future is still open." },
      },
    ],
  },
  m4_trade_control: {
    id: "m4_trade_control",
    step: 4,
    title: "Situation 4: Controlled Deadline",
    scenario:
      "You are near .500 and can choose between one big swing or two safer moves before the deadline.",
    conceptId: "trade-matching",
    termIds: ["trade-matching-rule", "second-apron", "draft-pick-value"],
    options: [
      {
        label: "Make one big star trade",
        note: "Boost ceiling, increase cap pressure.",
        termIds: ["salary-aggregation", "second-apron"],
        tags: ["star-swing"],
        effects: { scoreΔ: 8, branchΔ: { starPower: 2, riskHeat: 2, capFlex: -1 } },
        outcome: { narrative: "You raised the ceiling. Now every injury and cap rule matters more." },
      },
      {
        label: "Make two smaller depth deals",
        note: "Raise floor and keep flexibility.",
        termIds: ["trade-matching-rule"],
        tags: ["depth"],
        effects: { scoreΔ: 8, branchΔ: { culture: 1, capFlex: 2 } },
        outcome: { narrative: "Smart depth work. Your team is harder to break over a long season." },
      },
      {
        label: "Add one veteran shooter only",
        note: "Simple move, low downside.",
        termIds: ["market-value"],
        tags: ["targeted"],
        effects: { scoreΔ: 6, branchΔ: { culture: 1, capFlex: 1 } },
        outcome: { narrative: "Solid upgrade. Not huge, but it fits your system and budget." },
      },
      {
        label: "Keep roster unchanged",
        note: "Save assets and reassess later.",
        termIds: ["cap-flexibility"],
        tags: ["wait"],
        effects: { scoreΔ: 5, branchΔ: { capFlex: 2 } },
        outcome: { narrative: "You stayed patient. You have options, but short-term upside stayed limited." },
      },
    ],
  },
  m5_analytics_push: {
    id: "m5_analytics_push",
    step: 5,
    title: "Situation 5: Data-Led Rotation",
    scenario:
      "Your model shows a bench lineup that clearly wins minutes. Coaches are open but want proof and guardrails.",
    conceptId: "analytics",
    termIds: ["net-rating", "true-shooting", "bpm", "vorp", "win-shares"],
    options: [
      {
        label: "Pilot lineup for 10 games",
        note: "Track results and adjust weekly.",
        termIds: ["net-rating", "sample-size"],
        tags: ["test"],
        effects: { scoreΔ: 9, branchΔ: { dataTrust: 2, culture: 1 } },
        outcome: { narrative: "The test worked and coaches bought in. Data trust rose across the building." },
      },
      {
        label: "Mandate full rollout now",
        note: "Fast change from front office.",
        termIds: ["net-rating", "bpm"],
        tags: ["force"],
        effects: { scoreΔ: 6, branchΔ: { dataTrust: 2, culture: -2, riskHeat: 1 } },
        outcome: { narrative: "Numbers improved, but staff felt pushed aside. You won games and lost some trust." },
      },
      {
        label: "Keep data as advisory only",
        note: "Coach keeps full control.",
        termIds: ["win-shares"],
        tags: ["coach-first"],
        effects: { scoreΔ: 5, branchΔ: { dataTrust: -1, culture: 1 } },
        outcome: { narrative: "Culture stayed stable, but you left clear value on the table." },
      },
      {
        label: "Invest in bigger analytics staff",
        note: "Add tracking tools and one data coach.",
        termIds: ["market-inefficiency", "net-rating"],
        tags: ["infrastructure"],
        effects: { scoreΔ: 8, branchΔ: { dataTrust: 3, capFlex: -1 } },
        outcome: { narrative: "Your system got stronger for the long run. Short-term budget got tighter." },
      },
    ],
  },
  m5_analytics_resistance: {
    id: "m5_analytics_resistance",
    step: 5,
    title: "Situation 5: Coach vs Model",
    scenario:
      "Your coaching staff distrusts analytics after recent friction. You must decide how hard to push.",
    conceptId: "analytics",
    termIds: ["net-rating", "per", "usage-rate", "team-culture"],
    options: [
      {
        label: "Run joint coach-analyst reviews",
        note: "Shared ownership of lineup calls.",
        termIds: ["sample-size", "net-rating"],
        tags: ["collaboration"],
        effects: { scoreΔ: 8, branchΔ: { dataTrust: 2, culture: 2 } },
        outcome: { narrative: "Collaboration lowered conflict. Better decisions came from shared context." },
      },
      {
        label: "Back coach instincts only",
        note: "Pause analytics influence this month.",
        termIds: ["per"],
        tags: ["traditional"],
        effects: { scoreΔ: 4, branchΔ: { dataTrust: -2, culture: 1 } },
        outcome: { narrative: "Staff felt supported, but performance gains slowed." },
      },
      {
        label: "Set strict data targets for rotations",
        note: "Use KPI gates before playoff push.",
        termIds: ["net-rating", "usage-rate"],
        tags: ["hard-data"],
        effects: { scoreΔ: 6, branchΔ: { dataTrust: 2, culture: -1, riskHeat: 1 } },
        outcome: { narrative: "The targets improved clarity, but the tone stayed tense." },
      },
      {
        label: "Hire mediator coach with analytics background",
        note: "Bridge communication gap.",
        termIds: ["bpm", "vorp"],
        tags: ["bridge"],
        effects: { scoreΔ: 7, branchΔ: { dataTrust: 1, culture: 2, capFlex: -1 } },
        outcome: { narrative: "A bridge role helped both sides speak the same language." },
      },
    ],
  },
  m5_analytics_collab: {
    id: "m5_analytics_collab",
    step: 5,
    title: "Situation 5: Shared Analytics Plan",
    scenario:
      "Your data staff and coaches both agree the team can gain from smarter lineup usage. You choose the rollout style.",
    conceptId: "analytics",
    termIds: ["true-shooting", "net-rating", "usage-rate", "market-inefficiency"],
    options: [
      {
        label: "Use weekly lineup scorecards",
        note: "Simple metrics for every coaching meeting.",
        termIds: ["net-rating", "true-shooting"],
        tags: ["process"],
        effects: { scoreΔ: 8, branchΔ: { dataTrust: 2, culture: 1 } },
        outcome: { narrative: "Clear scorecards kept everyone aligned and improved decisions." },
      },
      {
        label: "Focus only on playoff matchups",
        note: "Save major changes for postseason prep.",
        termIds: ["sample-size"],
        tags: ["timed"],
        effects: { scoreΔ: 7, branchΔ: { dataTrust: 1, riskHeat: 1 } },
        outcome: { narrative: "You saved energy for key games, with less regular-season disruption." },
      },
      {
        label: "Run A/B rotation experiments",
        note: "Compare units in structured blocks.",
        termIds: ["sample-size", "bpm"],
        tags: ["experiment"],
        effects: { scoreΔ: 9, branchΔ: { dataTrust: 2, capFlex: 1 } },
        outcome: { narrative: "The tests found real edges. Your staff now trusts evidence-based tweaks." },
      },
      {
        label: "Keep current rotations and monitor only",
        note: "No change until clear drop appears.",
        termIds: ["net-rating"],
        tags: ["steady"],
        effects: { scoreΔ: 5, branchΔ: { dataTrust: -1, culture: 1 } },
        outcome: { narrative: "Stability helped comfort, but you moved slower than rivals." },
      },
    ],
  },
  m6_load_crisis: {
    id: "m6_load_crisis",
    step: 6,
    title: "Situation 6: Fatigue Alert",
    scenario:
      "Your star is showing fatigue signs and your risk level is already high. The medical team warns of soft-tissue danger.",
    conceptId: "roster-health",
    termIds: ["load-management", "injury-risk", "minute-load", "soft-tissue"],
    options: [
      {
        label: "Reduce minutes to 32 now",
        note: "Protect long-term health first.",
        termIds: ["load-management", "minute-load"],
        tags: ["health-first"],
        effects: { scoreΔ: 9, branchΔ: { riskHeat: -2, culture: 1 } },
        outcome: { narrative: "Health stabilized and late-game legs returned before playoffs." },
      },
      {
        label: "Use 34-minute plan with two rest games",
        note: "Balanced protection and seeding push.",
        termIds: ["load-management"],
        tags: ["balanced"],
        effects: { scoreΔ: 8, branchΔ: { riskHeat: -1, culture: 1 } },
        outcome: { narrative: "The plan kept competitiveness while lowering injury risk." },
      },
      {
        label: "Keep him at 38+ minutes",
        note: "Go all-in for standings.",
        termIds: ["injury-risk"],
        tags: ["high-risk"],
        effects: { scoreΔ: 3, branchΔ: { riskHeat: 2, starPower: -1 } },
        outcome: { narrative: "Short-term wins came, then a strain setback hit at the worst time." },
      },
      {
        label: "Sit him for five full games",
        note: "Maximum protection.",
        termIds: ["load-management", "seeding"],
        tags: ["protective"],
        effects: { scoreΔ: 6, branchΔ: { riskHeat: -2, starPower: -1, capFlex: 1 } },
        outcome: { narrative: "Health improved, but you slipped in the standings during the rest block." },
      },
    ],
  },
  m6_load_planned: {
    id: "m6_load_planned",
    step: 6,
    title: "Situation 6: Planned Load Plan",
    scenario:
      "Your health staff built a proactive rest model. You can protect players now or chase every late-season win.",
    conceptId: "roster-health",
    termIds: ["load-management", "minute-load", "availability"],
    options: [
      {
        label: "Adopt full health plan",
        note: "Use rest, minute caps, and recovery windows.",
        termIds: ["load-management"],
        tags: ["health-first"],
        effects: { scoreΔ: 9, branchΔ: { riskHeat: -2, culture: 1 } },
        outcome: { narrative: "Players entered playoffs fresh and trusted your process." },
      },
      {
        label: "Use light minute cap only",
        note: "Small reduction for top two players.",
        termIds: ["minute-load"],
        tags: ["light-touch"],
        effects: { scoreΔ: 7, branchΔ: { riskHeat: -1 } },
        outcome: { narrative: "A minor cut helped some, but fatigue still showed in tight games." },
      },
      {
        label: "No rest changes",
        note: "Push for highest seed possible.",
        termIds: ["availability"],
        tags: ["push"],
        effects: { scoreΔ: 5, branchΔ: { riskHeat: 1, starPower: 1 } },
        outcome: { narrative: "You gained short-term momentum but carried more injury risk." },
      },
      {
        label: "Individual plans by player profile",
        note: "Different limits for age, role, and injury history.",
        termIds: ["injury-risk", "minute-load"],
        tags: ["custom"],
        effects: { scoreΔ: 8, branchΔ: { riskHeat: -1, dataTrust: 1 } },
        outcome: { narrative: "Custom plans fit better and improved buy-in across the roster." },
      },
    ],
  },
  m7_draft_model: {
    id: "m7_draft_model",
    step: 7,
    title: "Situation 7: Draft by Model",
    scenario:
      "Your model rates one prospect far above consensus. Scouts agree he has upside but warn about adjustment risk.",
    conceptId: "rookie-scale",
    termIds: ["rookie-scale", "draft-pick-value", "team-option", "two-way-contract"],
    options: [
      {
        label: "Take model favorite at your pick",
        note: "Bet on long-term ceiling.",
        termIds: ["rookie-scale", "market-inefficiency"],
        tags: ["upside"],
        effects: { scoreΔ: 9, branchΔ: { dataTrust: 2, starPower: 1 } },
        outcome: { narrative: "The pick developed into high value on a cheap rookie deal." },
      },
      {
        label: "Trade down for extra first-round asset",
        note: "Lower immediate risk, gain future options.",
        termIds: ["draft-pick-value"],
        tags: ["asset-play"],
        effects: { scoreΔ: 7, branchΔ: { capFlex: 2, dataTrust: 1 } },
        outcome: { narrative: "You gained flexibility and another shot at future value." },
      },
      {
        label: "Take safer two-way projection",
        note: "High floor, lower star chance.",
        termIds: ["two-way-contract", "rookie-scale"],
        tags: ["safe"],
        effects: { scoreΔ: 6, branchΔ: { culture: 1, dataTrust: -1 } },
        outcome: { narrative: "The player became dependable, but not a franchise changer." },
      },
      {
        label: "Package pick for proven veteran",
        note: "Skip rookie development curve.",
        termIds: ["market-value", "salary-cap"],
        tags: ["win-now"],
        effects: { scoreΔ: 6, branchΔ: { starPower: 1, capFlex: -1, riskHeat: 1 } },
        outcome: { narrative: "You got instant help but gave up cheap long-term upside." },
      },
    ],
  },
  m7_draft_scout: {
    id: "m7_draft_scout",
    step: 7,
    title: "Situation 7: Draft by Scout Board",
    scenario:
      "Your scouts want a polished wing. Analytics prefers a smaller- school guard with stronger projection data.",
    conceptId: "rookie-scale",
    termIds: ["rookie-scale", "draft-pick-value", "team-option"],
    options: [
      {
        label: "Take scout consensus wing",
        note: "Reliable profile and cleaner fit.",
        termIds: ["rookie-scale"],
        tags: ["consensus"],
        effects: { scoreΔ: 7, branchΔ: { culture: 1, starPower: 1 } },
        outcome: { narrative: "The pick was steady and useful, with moderate upside." },
      },
      {
        label: "Trust model and take guard early",
        note: "Higher variance, bigger potential reward.",
        termIds: ["market-inefficiency", "draft-pick-value"],
        tags: ["analytics"],
        effects: { scoreΔ: 8, branchΔ: { dataTrust: 2, culture: -1 } },
        outcome: { narrative: "You took heat on draft night, then upside started to show." },
      },
      {
        label: "Trade down and add second-round swing",
        note: "More bites at value.",
        termIds: ["draft-pick-value", "two-way-contract"],
        tags: ["assets"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 2, dataTrust: 1 } },
        outcome: { narrative: "You spread risk across more assets and kept options open." },
      },
      {
        label: "Draft upside project",
        note: "Slow development, high ceiling.",
        termIds: ["rookie-scale", "team-option"],
        tags: ["project"],
        effects: { scoreΔ: 5, branchΔ: { starPower: 1, riskHeat: 1 } },
        outcome: { narrative: "The talent is there, but the timeline is long and uncertain." },
      },
    ],
  },
  m8_final_balanced: {
    id: "m8_final_balanced",
    step: 8,
    title: "Situation 8: Final Plan - Balanced Window",
    scenario:
      "Ownership asks for your 3-year plan. Your profile is balanced, so your message must be clear and disciplined.",
    conceptId: "front-office-philosophy",
    termIds: ["front-office-philosophy", "cap-flexibility", "market-inefficiency", "asset-timeline"],
    options: [
      {
        label: "Hybrid build: scouting + analytics",
        note: "Use both systems with one draft board.",
        termIds: ["front-office-philosophy", "market-inefficiency"],
        tags: ["hybrid"],
        effects: { scoreΔ: 9, branchΔ: { dataTrust: 1, culture: 1 } },
        outcome: { narrative: "Ownership approved your plan. Your process is clear, stable, and hard to copy." },
      },
      {
        label: "Cap-first two-year reset",
        note: "Clear books and build flexible core.",
        termIds: ["cap-flexibility", "salary-cap"],
        tags: ["reset"],
        effects: { scoreΔ: 7, branchΔ: { capFlex: 2 } },
        outcome: { narrative: "You chose patience and structure. The floor is stable, with room for a big move later." },
      },
      {
        label: "Star chase with selective risks",
        note: "Pursue one major talent while protecting picks.",
        termIds: ["asset-timeline", "luxury-tax-line"],
        tags: ["targeted-win-now"],
        effects: { scoreΔ: 7, branchΔ: { starPower: 2, riskHeat: 1 } },
        outcome: { narrative: "You pushed for upside without full chaos. Execution now matters more than theory." },
      },
      {
        label: "Full rebuild and youth runway",
        note: "Move veterans and maximize future assets.",
        termIds: ["draft-pick-value", "asset-timeline"],
        tags: ["rebuild"],
        effects: { scoreΔ: 6, branchΔ: { capFlex: 1, culture: 1 } },
        outcome: { narrative: "You chose long-term growth. Patience will be tested, but your direction is clean." },
      },
    ],
  },
  m8_final_cap: {
    id: "m8_final_cap",
    step: 8,
    title: "Situation 8: Final Plan - Cap Engine",
    scenario:
      "Your biggest edge is financial flexibility. Ownership asks how you convert cap control into wins.",
    conceptId: "front-office-philosophy",
    termIds: ["cap-flexibility", "salary-cap", "second-apron", "asset-timeline"],
    options: [
      {
        label: "Keep cap room for opportunistic trades",
        note: "Absorb contracts for picks and upside.",
        termIds: ["cap-flexibility", "trade-matching-rule"],
        tags: ["opportunistic"],
        effects: { scoreΔ: 9, branchΔ: { capFlex: 2 } },
        outcome: { narrative: "You turned flexibility into leverage. Other teams now call you first at the deadline." },
      },
      {
        label: "Use room for two mid-tier starters",
        note: "Raise team floor fast.",
        termIds: ["market-value", "salary-cap"],
        tags: ["depth-build"],
        effects: { scoreΔ: 8, branchΔ: { culture: 1, starPower: 1 } },
        outcome: { narrative: "The roster became deeper and steadier. Ceiling depends on future star growth." },
      },
      {
        label: "Spend now on one max target",
        note: "High swing with high pressure.",
        termIds: ["luxury-tax-line", "supermax"],
        tags: ["star-swing"],
        effects: { scoreΔ: 6, branchΔ: { starPower: 2, riskHeat: 2, capFlex: -2 } },
        outcome: { narrative: "You made the swing. If the fit is wrong, recovery gets expensive." },
      },
      {
        label: "Delay major spending one year",
        note: "Preserve optionality and draft position.",
        termIds: ["asset-timeline", "draft-pick-value"],
        tags: ["patient"],
        effects: { scoreΔ: 7, branchΔ: { capFlex: 1, riskHeat: -1 } },
        outcome: { narrative: "You stayed flexible and reduced risk. The room expects a major move next cycle." },
      },
    ],
  },
  m8_final_star: {
    id: "m8_final_star",
    step: 8,
    title: "Situation 8: Final Plan - Star Core",
    scenario:
      "Your team identity is star-driven. Ownership asks how you support stars without breaking depth or chemistry.",
    conceptId: "front-office-philosophy",
    termIds: ["front-office-philosophy", "luxury-tax-line", "cap-flexibility", "team-culture"],
    options: [
      {
        label: "Keep core and build cheap depth",
        note: "Retain stars, rotate value role players.",
        termIds: ["luxury-tax-line", "market-inefficiency"],
        tags: ["core-stability"],
        effects: { scoreΔ: 9, branchΔ: { starPower: 2, capFlex: 1 } },
        outcome: { narrative: "You kept your identity and improved fit around it. This is a clear contender path." },
      },
      {
        label: "Trade one star for three assets",
        note: "Rebalance risk and timeline.",
        termIds: ["asset-timeline", "draft-pick-value"],
        tags: ["rebalance"],
        effects: { scoreΔ: 7, branchΔ: { capFlex: 2, starPower: -1 } },
        outcome: { narrative: "You reduced risk and gained depth, but top-end talent dropped." },
      },
      {
        label: "Push all chips in for a superteam",
        note: "Maximum upside, maximum cost.",
        termIds: ["supermax", "second-apron"],
        tags: ["all-in"],
        effects: { scoreΔ: 6, branchΔ: { starPower: 3, riskHeat: 3, capFlex: -3 } },
        outcome: { narrative: "The ceiling is huge, but one bad break could collapse your flexibility." },
      },
      {
        label: "Stagger contracts for smoother runway",
        note: "Protect future cap windows.",
        termIds: ["extension", "cap-flexibility"],
        tags: ["structured"],
        effects: { scoreΔ: 8, branchΔ: { capFlex: 1, culture: 1 } },
        outcome: { narrative: "You made the timeline cleaner. The team can compete now and still adapt later." },
      },
    ],
  },
  m8_final_data: {
    id: "m8_final_data",
    step: 8,
    title: "Situation 8: Final Plan - Data Edge",
    scenario:
      "Your strongest edge is analytics. Ownership asks how you scale the model without losing human judgment.",
    conceptId: "front-office-philosophy",
    termIds: ["front-office-philosophy", "market-inefficiency", "net-rating", "team-culture"],
    options: [
      {
        label: "Build hybrid draft-and-trade model",
        note: "Data first, scout validation required.",
        termIds: ["market-inefficiency", "net-rating"],
        tags: ["hybrid"],
        effects: { scoreΔ: 9, branchΔ: { dataTrust: 2, culture: 1 } },
        outcome: { narrative: "You built a durable edge by combining model speed and scout context." },
      },
      {
        label: "Go full model authority",
        note: "Centralize decisions in analytics team.",
        termIds: ["bpm", "vorp"],
        tags: ["model-only"],
        effects: { scoreΔ: 6, branchΔ: { dataTrust: 3, culture: -2, riskHeat: 1 } },
        outcome: { narrative: "The model found value, but your human network weakened." },
      },
      {
        label: "Keep analytics as second opinion",
        note: "Scouting holds final call.",
        termIds: ["per", "win-shares"],
        tags: ["scout-first"],
        effects: { scoreΔ: 7, branchΔ: { culture: 1, dataTrust: -1 } },
        outcome: { narrative: "You kept room culture strong, but you moved slower than data-forward rivals." },
      },
      {
        label: "Invest in coach-facing data tools",
        note: "Turn metrics into simple game-day actions.",
        termIds: ["net-rating", "usage-rate"],
        tags: ["execution"],
        effects: { scoreΔ: 8, branchΔ: { dataTrust: 2, culture: 1, capFlex: -1 } },
        outcome: { narrative: "Your staff used data better in real games, not just in reports." },
      },
    ],
  },
};

export function getMissionNode(id: string): MissionNode | undefined {
  return MISSION_GRAPH[id];
}

export function getAllMissionNodes(): MissionNode[] {
  return Object.values(MISSION_GRAPH);
}

export function getTopBranchIdentity(
  state: BranchState
): { key: "capFlex" | "starPower" | "dataTrust"; top: number; second: number } {
  const ranked = [
    { key: "capFlex" as const, value: state.capFlex },
    { key: "starPower" as const, value: state.starPower },
    { key: "dataTrust" as const, value: state.dataTrust },
  ].sort((a, b) => b.value - a.value);

  return {
    key: ranked[0].key,
    top: ranked[0].value,
    second: ranked[1].value,
  };
}

export function getNextNodeId(
  step: number,
  state: BranchState,
  winningOption: number
): string | null {
  if (step === 1) {
    const map = ["m2_contract_cap", "m2_contract_star", "m2_contract_balanced", "m2_contract_risk"];
    return map[winningOption] ?? "m2_contract_balanced";
  }

  if (step === 2) {
    if (state.starPower - state.culture >= 2) return "m3_revenue_owner";
    if (state.culture - state.starPower >= 2) return "m3_revenue_culture";
    return "m3_revenue_balanced";
  }

  if (step === 3) {
    return state.riskHeat >= 3 ? "m4_trade_aggressive" : "m4_trade_control";
  }

  if (step === 4) {
    if (state.dataTrust >= 3) return "m5_analytics_push";
    if (state.dataTrust <= -1) return "m5_analytics_resistance";
    return "m5_analytics_collab";
  }

  if (step === 5) {
    return state.riskHeat >= 4 ? "m6_load_crisis" : "m6_load_planned";
  }

  if (step === 6) {
    return state.capFlex + state.dataTrust >= 4 ? "m7_draft_model" : "m7_draft_scout";
  }

  if (step === 7) {
    const top = getTopBranchIdentity(state);
    if (top.top - top.second < 2) return "m8_final_balanced";
    if (top.key === "capFlex") return "m8_final_cap";
    if (top.key === "starPower") return "m8_final_star";
    return "m8_final_data";
  }

  return null;
}

// Compatibility exports for legacy rich-mission API routes.
export interface MissionRole {
  id: string;
  name: string;
  privateBrief?: string;
}

export interface MissionInfoCard {
  id: string;
  title: string;
  body: string;
  roleIds?: string[];
}

export interface MissionRoundOption {
  id: string;
  label: string;
  note: string;
  tags: string[];
}

export interface MissionRound {
  id: string;
  prompt: string;
  dependsOnRoundId?: string;
  dependsOnTag?: string;
  options: MissionRoundOption[];
}

export interface MissionRivalCounter {
  triggerTags: string[];
  message: string;
  responseRound: MissionRound;
}

export interface OutcomeVariant {
  label: string;
  narrative: string;
  scoreΔ: number;
  probability: number;
  applyStatus: string[];
  removeStatus?: string[];
}

export interface FinalOutcome {
  roundTagCombo: string[];
  variants: OutcomeVariant[];
}

export interface Mission {
  id: string;
  conceptId: string;
  roles: MissionRole[];
  infoCards: MissionInfoCard[];
  rounds: MissionRound[];
  rivalCounter?: MissionRivalCounter;
  outcomes: FinalOutcome[];
  defaultOutcome: FinalOutcome;
}

const RICH_MISSIONS: Record<string, Mission> = {};

export function getMissionById(id: string): Mission | MissionNode | undefined {
  return RICH_MISSIONS[id] ?? MISSION_GRAPH[id];
}

export function isLegacyMission(mission: Mission | MissionNode): mission is MissionNode {
  return !("rounds" in mission);
}
