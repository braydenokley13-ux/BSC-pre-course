export interface CheckQuestion {
  question: string;
  options: string[];
  correctIndex: number;
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
        question: "What happens the FIRST time a team's payroll crosses the Luxury Tax Line ($171M)?",
        options: [
          "They pay an escalating per-dollar penalty on every dollar over the line",
          "Their player contracts are automatically voided",
          "They must immediately release one player",
          "They lose access to the MLE and BAE for the season",
        ],
        correctIndex: 0,
      },
      {
        question: "What is the 'Repeater Tax' and when does it apply?",
        options: [
          "A higher tax multiplier for teams in the luxury tax 3 or more of 4 consecutive years",
          "A second tax charged for signing international players",
          "A fee for re-signing previously released players",
          "A penalty applied to teams that sign players over age 32",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "extensions-options",
    questions: [
      {
        question: "Why do teams typically offer contract extensions before a player hits free agency?",
        options: [
          "To lock in talent at a below-market price before the player can test open-market free agency",
          "It is required by CBA rules for any player with more than 2 years of service",
          "Extensions always pay more than free agency deals",
          "To avoid triggering the luxury tax line",
        ],
        correctIndex: 0,
      },
      {
        question: "What does a 'Player Option' clause mean in an NBA contract?",
        options: [
          "The player can choose to opt out of the final contract year and become a free agent",
          "The team decides whether to keep the player for the final year",
          "Both the player and team must agree to continue the contract",
          "The player can demand a trade to a preferred destination",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "bri-revenue",
    questions: [
      {
        question: "What does BRI stand for and how does it connect to the NBA salary cap?",
        options: [
          "Basketball Related Income — the cap is set at ~49–51% of BRI, so when revenue grows, the cap rises",
          "Basketball Roster Incentive — teams with higher BRI receive additional cap space",
          "Base Revenue Index — a fixed benchmark reviewed every 5 years",
          "Budget Reserve Instrument — a safety fund for teams in financial distress",
        ],
        correctIndex: 0,
      },
      {
        question: "Which type of NBA revenue is NOT distributed equally among all 30 teams?",
        options: [
          "Arena revenue and local gate receipts",
          "National TV deal money",
          "League-wide merchandise sales",
          "Digital streaming rights revenue",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "trade-matching",
    questions: [
      {
        question:
          "If your team is over the cap and sends out $20M in a trade, what is the maximum salary you can receive in return?",
        options: [
          "$27M (125% × $20M + $2M)",
          "$25M (exactly 125% of $20M)",
          "$20M — it must be exactly equal",
          "Any amount — there is no incoming salary limit",
        ],
        correctIndex: 0,
      },
      {
        question: "What is 'salary aggregation' in the context of NBA trades?",
        options: [
          "Combining multiple smaller contracts on one side to match a single large salary on the other side",
          "Adding salary to a contract as a performance incentive for being traded",
          "The combined total of all contracts on both sides of a trade",
          "Splitting one player's contract across two roster spots",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "analytics",
    questions: [
      {
        question: "What does PER (Player Efficiency Rating) measure?",
        options: [
          "A per-minute efficiency score summarizing all statistical contributions — league average is 15",
          "A player's efficiency only in clutch situations (last 5 minutes, within 5 points)",
          "Points per game divided by turnovers committed",
          "The ratio of a player's wins to their salary cost",
        ],
        correctIndex: 0,
      },
      {
        question:
          "A player averages 20 points and 8 assists per game, but his team has a -6 Net Rating when he plays. What does the Net Rating tell you?",
        options: [
          "The team actually performs worse when he is on the court — his box score stats may mask other problems",
          "He needs 6 more points per game to be considered above average",
          "His defensive rating is too low to calculate correctly",
          "He has played in fewer than 6 games this season",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "roster-health",
    questions: [
      {
        question: "What is 'load management' in the NBA?",
        options: [
          "Strategically resting players to reduce injury risk and preserve peak performance for high-leverage games",
          "A CBA rule setting a maximum number of minutes a player can play per season",
          "The process of distributing playing time evenly across all roster members",
          "A physical conditioning program run during preseason training camp",
        ],
        correctIndex: 0,
      },
      {
        question: "Which factor is MOST critical when deciding whether to increase a young player's minutes?",
        options: [
          "Development curve versus injury risk — overloading a young player can permanently stunt long-term growth",
          "Whether the team's upcoming schedule is considered easy",
          "What the player's contract says about minute restrictions",
          "The head coach's personal preference for specific lineup combinations",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "rookie-scale",
    questions: [
      {
        question: "What is a 'Rookie Scale Contract' in the NBA?",
        options: [
          "A preset 4-year contract for first-round picks, with salary determined by draft slot and two team options on years 3 and 4",
          "A contract offered only to players under 20 years old at the time of signing",
          "A performance-based contract with salary increases each year tied to statistics",
          "A minimum salary contract offered to undrafted free agents",
        ],
        correctIndex: 0,
      },
      {
        question: "Why are rookie scale contracts considered the most valuable asset in the NBA?",
        options: [
          "They provide 4 years of cost-controlled play — if the player develops into a star, the team pays far below market rate",
          "They guarantee the highest annual salaries in the entire league",
          "They include automatic contract extensions after Year 2 if the player makes the All-Star team",
          "They are fully exempt from luxury tax calculations",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    conceptId: "front-office-philosophy",
    questions: [
      {
        question: "What does 'tanking' mean in NBA front office strategy?",
        options: [
          "Intentionally fielding a weak team to finish with a poor record and improve draft lottery odds",
          "Trading for large, physical players to dominate the paint on both ends",
          "Refusing to sign any free agents during the offseason to preserve cap space",
          "Spending up to the luxury tax cap every year to maximize roster quality",
        ],
        correctIndex: 0,
      },
      {
        question: "What is the 'cap flexibility' strategy in NBA team building?",
        options: [
          "Keeping payroll below the cap line to maintain the ability to sign free agents or absorb contracts in trades",
          "Using every available cap exception during each offseason to add roster depth",
          "Signing players exclusively to short one-year deals to avoid long-term commitments",
          "Having the team's star player personally negotiate all contract decisions",
        ],
        correctIndex: 0,
      },
    ],
  },
];

export function getCheck(conceptId: string): ConceptCheck | undefined {
  return CONCEPT_CHECKS.find((c) => c.conceptId === conceptId);
}
