export interface CheckQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  termIds: string[];
}

export interface ConceptCheck {
  conceptId: string;
  questions: [CheckQuestion, CheckQuestion];
}

export const CONCEPT_CHECKS: ConceptCheck[] = [
  {
    conceptId: "luxury-tax",
    questions: [
      {
        question: "What happens first when a team goes over the luxury tax line?",
        options: [
          "The team pays extra money on the amount above the line.",
          "All long contracts become non-guaranteed.",
          "The team must cut one player right away.",
          "The team loses all draft picks for the year.",
        ],
        correctIndex: 0,
        termIds: ["luxury-tax-line", "salary-cap"],
      },
      {
        question: "Why do teams try to avoid repeat tax years?",
        options: [
          "Because penalties get harsher when tax years repeat.",
          "Because repeat tax years block all trades.",
          "Because repeat tax years void Bird Rights.",
          "Because repeat tax years remove rookie contracts.",
        ],
        correctIndex: 0,
        termIds: ["luxury-tax-line", "second-apron"],
      },
    ],
  },
  {
    conceptId: "extensions-options",
    questions: [
      {
        question: "Why can an early extension help a team?",
        options: [
          "It can lock value before open bidding raises price.",
          "It removes the salary cap for that player.",
          "It guarantees the player cannot request a trade.",
          "It prevents all luxury tax penalties.",
        ],
        correctIndex: 0,
        termIds: ["extension", "market-value"],
      },
      {
        question: "What does a player option do?",
        options: [
          "The player decides on the final year.",
          "The team decides on the final year.",
          "Both sides must agree to any contract year.",
          "The player can cancel the full contract anytime.",
        ],
        correctIndex: 0,
        termIds: ["player-option", "team-option"],
      },
    ],
  },
  {
    conceptId: "bri-revenue",
    questions: [
      {
        question: "What is BRI in simple terms?",
        options: [
          "League-wide basketball revenue used in cap setting.",
          "A team-only media bonus paid in playoffs.",
          "A tax fee charged to small-market teams.",
          "A draft formula for rookie salaries.",
        ],
        correctIndex: 0,
        termIds: ["bri", "salary-cap"],
      },
      {
        question: "Which money is usually local, not shared equally?",
        options: [
          "Arena ticket and local sponsor revenue.",
          "National TV deal money.",
          "League-wide merch revenue.",
          "League pass digital revenue pool.",
        ],
        correctIndex: 0,
        termIds: ["local-revenue", "revenue-sharing"],
      },
    ],
  },
  {
    conceptId: "trade-matching",
    questions: [
      {
        question: "Why do trade matching rules matter?",
        options: [
          "They limit how much salary over-cap teams can take back.",
          "They force every trade to include draft picks.",
          "They make all two-team trades illegal.",
          "They only apply in the offseason.",
        ],
        correctIndex: 0,
        termIds: ["trade-matching-rule", "salary-cap"],
      },
      {
        question: "What is salary aggregation?",
        options: [
          "Combining contracts to match a larger salary.",
          "Adding bonus money after a trade is done.",
          "Splitting one player salary across two teams.",
          "Converting salary into draft pick points.",
        ],
        correctIndex: 0,
        termIds: ["salary-aggregation", "trade-matching-rule"],
      },
    ],
  },
  {
    conceptId: "analytics",
    questions: [
      {
        question: "What does net rating tell you?",
        options: [
          "How much a lineup wins or loses by per 100 possessions.",
          "How many points a player scores in clutch time only.",
          "How often a player shoots from deep.",
          "How many assists a team averages at home.",
        ],
        correctIndex: 0,
        termIds: ["net-rating"],
      },
      {
        question: "Why should teams care about sample size?",
        options: [
          "Small samples can create fake trends.",
          "Large samples remove all injury risk.",
          "Small samples are required by CBA rules.",
          "Large samples make scouting unnecessary.",
        ],
        correctIndex: 0,
        termIds: ["sample-size"],
      },
    ],
  },
  {
    conceptId: "roster-health",
    questions: [
      {
        question: "What is load management?",
        options: [
          "Planned rest and minute control to protect players.",
          "A rule that caps minutes by law.",
          "A way to bench all rookies in back-to-backs.",
          "A type of conditioning test only for centers.",
        ],
        correctIndex: 0,
        termIds: ["load-management", "minute-load"],
      },
      {
        question: "What is the main goal of managing minute load?",
        options: [
          "Lower injury risk while keeping playoff readiness high.",
          "Make sure every player gets equal minutes.",
          "Increase usage rate for top scorers only.",
          "Avoid using two-way contracts.",
        ],
        correctIndex: 0,
        termIds: ["injury-risk", "availability"],
      },
    ],
  },
  {
    conceptId: "rookie-scale",
    questions: [
      {
        question: "Why are rookie scale deals valuable?",
        options: [
          "They can provide strong play at below veteran cost.",
          "They are always shorter than two years.",
          "They are exempt from all cap rules.",
          "They guarantee All-Star growth by year three.",
        ],
        correctIndex: 0,
        termIds: ["rookie-scale", "market-value"],
      },
      {
        question: "What do team options on rookie deals do?",
        options: [
          "They let the team choose later years within set rules.",
          "They let players choose any team in year three.",
          "They remove the draft pick from team control.",
          "They convert the deal into a two-way contract.",
        ],
        correctIndex: 0,
        termIds: ["team-option", "rookie-scale"],
      },
    ],
  },
  {
    conceptId: "front-office-philosophy",
    questions: [
      {
        question: "What is a front office philosophy?",
        options: [
          "A clear strategy that guides team-building choices.",
          "A public slogan used only for marketing.",
          "A list of players to trade each season.",
          "A draft-only scouting report.",
        ],
        correctIndex: 0,
        termIds: ["front-office-philosophy"],
      },
      {
        question: "Why does timeline planning matter?",
        options: [
          "Because cap room, picks, and stars should peak together.",
          "Because all teams must rebuild every two years.",
          "Because timeline rules replace trade rules.",
          "Because timelines decide lottery order.",
        ],
        correctIndex: 0,
        termIds: ["asset-timeline", "cap-flexibility"],
      },
    ],
  },
];

export function getCheck(conceptId: string): ConceptCheck | undefined {
  return CONCEPT_CHECKS.find((c) => c.conceptId === conceptId);
}
