export interface MissionOption {
  label: string;
  note: string;
  tags: string[];
  outcome: { scoreΔ: number; narrative: string };
}

export interface Mission {
  id: string;
  missionNumber: number;
  title: string;
  scenario: string;
  conceptId: string;
  options: MissionOption[];
}

export const MISSIONS: Mission[] = [
  {
    id: "cap-crunch",
    missionNumber: 1,
    title: "Cap Crunch",
    scenario:
      "Your payroll sits at $168M — just $3M below the luxury tax line at $171M. Your starting point guard is demanding a 3-year, $48M extension. If you sign it, you cross the tax threshold and trigger year-one penalties. If you wait, he may walk in free agency. The agent wants an answer in 48 hours.",
    conceptId: "luxury-tax",
    options: [
      {
        label: "Dump a small contract to stay under the tax",
        note: "Trade or waive a $5M role player to create tax buffer",
        tags: ["safe", "cap-discipline"],
        outcome: {
          scoreΔ: 5,
          narrative:
            "Smart cap management. You stayed under the tax line and kept full exception access. Owner is pleased — you avoided a $6M penalty bill. Depth took a hit, but flexibility wins long-term.",
        },
      },
      {
        label: "Sign the extension — cross the tax line",
        note: "Lock up the star, accept the luxury tax bill",
        tags: ["win-now", "star-retention"],
        outcome: {
          scoreΔ: 8,
          narrative:
            "You kept your franchise cornerstone. The tax bill stings — $6M penalty on top of salary — but the team stays intact. Owner winces but understands. Now you need to stay out of repeater territory.",
        },
      },
      {
        label: "Offer a short-term bridge deal",
        note: "2 years, $28M — buys time without full commitment",
        tags: ["balanced", "risk-managed"],
        outcome: {
          scoreΔ: 6,
          narrative:
            "Bridge deal gives both sides optionality. He took it, but he's watching the market. If you're not competitive by Year 2, the relationship sours. Bought time — now use it.",
        },
      },
      {
        label: "Call the bluff — let him walk to free agency",
        note: "Gamble that he re-signs at a lower market rate",
        tags: ["high-risk", "cap-flexibility"],
        outcome: {
          scoreΔ: 2,
          narrative:
            "He walked. A rival team handed him a max deal in the first hour of free agency. You saved cap space but lost your best player. Roster rebuild begins ahead of schedule.",
        },
      },
    ],
  },
  {
    id: "contract-choice",
    missionNumber: 2,
    title: "Contract Choice",
    scenario:
      "Your young star has one year remaining on his rookie deal. He's made two All-Star teams and is eligible for a Supermax Designated Player Extension — 35% of the cap for 5 years. His agent is also leaking interest from two other teams via sign-and-trade. He has a player option in Year 4 of any extension. What do you offer?",
    conceptId: "extensions-options",
    options: [
      {
        label: "Offer the full Supermax immediately",
        note: "35% of cap, 5 years — max retention, max cost",
        tags: ["star-retention", "max-commitment"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "He signed. The locker room knows the commitment is real. You now have the most expensive contract in the league — and the most impactful player. Win window is open. Don't waste it.",
        },
      },
      {
        label: "Team-friendly extension — 30% of cap, no player option",
        note: "Saves $15M+ over term, player loses opt-out leverage",
        tags: ["cost-controlled", "negotiation"],
        outcome: {
          scoreΔ: 7,
          narrative:
            "He took the team-friendly deal after two weeks of negotiation. You saved cap space but gave up some goodwill — he knows you didn't go max. Better for the balance sheet, complicated for the relationship.",
        },
      },
      {
        label: "Wait and offer a qualifying offer",
        note: "Make him a restricted free agent — match any offer sheet",
        tags: ["restricted-FA", "matching-rights"],
        outcome: {
          scoreΔ: 5,
          narrative:
            "Risky play. He accepted the qualifying offer but spent all summer unhappy. Another team submitted a poison pill offer sheet. You matched — but the relationship is damaged. Chemistry in the locker room suffers.",
        },
      },
      {
        label: "Orchestrate a sign-and-trade to maximize return",
        note: "Trade his rights for picks + young players",
        tags: ["trade", "rebuild-assets"],
        outcome: {
          scoreΔ: 4,
          narrative:
            "The sign-and-trade netted two first-round picks and a young center. The fan base is furious. Owner is cautiously optimistic. You got value — now you have to develop it or you've wasted a franchise talent.",
        },
      },
    ],
  },
  {
    id: "revenue-mix",
    missionNumber: 3,
    title: "Revenue Mix",
    scenario:
      "A global tech company offers a 5-year jersey patch deal worth $25M/year — the largest in franchise history. The catch: they want naming rights to your practice facility and 10 social media posts per month featuring their products. The CBA's revenue sharing means 50% of this deal's incremental value flows to small-market teams via the BRI pool. Your owner wants to maximize local revenue. How do you structure the deal?",
    conceptId: "bri-revenue",
    options: [
      {
        label: "Accept the full deal — $25M guaranteed",
        note: "Maximum local revenue, all conditions accepted",
        tags: ["revenue-max", "local-deal"],
        outcome: {
          scoreΔ: 8,
          narrative:
            "Deal closed. Revenue is up, but the social media requirement burns out players who hate the forced content. Two veteran free agents cite the 'corporate feel' as a reason to look elsewhere. Money in — chemistry slightly out.",
        },
      },
      {
        label: "Negotiate down — $20M with no facility naming rights",
        note: "Balanced: good revenue, preserve team culture",
        tags: ["balanced", "culture-first"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "Best outcome. You got $20M with terms the team can live with. Players respect the boundary you drew. Sponsor is happy with the social content. Owner sees a franchise that negotiates from strength, not desperation.",
        },
      },
      {
        label: "Reject it — protect the brand at all costs",
        note: "No deal, preserve full autonomy",
        tags: ["brand-protection"],
        outcome: {
          scoreΔ: 3,
          narrative:
            "The city respects the decision. The owner does not. You left $100M+ on the table over five years. That's roster money. Other franchises used their patch deals to sign two All-Stars. Sometimes principle is expensive.",
        },
      },
      {
        label: "Performance bonuses only — $12M base + upside",
        note: "Low guaranteed, high upside tied to wins and viewership",
        tags: ["risk-tolerance", "performance-linked"],
        outcome: {
          scoreΔ: 6,
          narrative:
            "Creative structure. You made $15M this year — a good playoffs run. But the uncertainty made financial planning harder. The board hates unpredictable revenue. Wins matter twice as much now: for the standings AND the check.",
        },
      },
    ],
  },
  {
    id: "expense-pressure",
    missionNumber: 4,
    title: "Expense Pressure",
    scenario:
      "It's the trade deadline. You're 3 games out of a playoff spot. A contending rival wants to offload a star wing — $28M this year, one year remaining. To match salary under trade rules, you'd need to send $22M+ (125% + $2M threshold). You have a $12M small forward and a $10M backup center who could be combined. But your Second Apron exposure would trigger if you take on his contract without sending out equal value.",
    conceptId: "trade-matching",
    options: [
      {
        label: "Aggregate both contracts — salary matching via combination",
        note: "Send $22M out ($12M + $10M combined), take $28M in",
        tags: ["aggregation", "star-acquisition"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "Legal trade. Salary aggregation worked perfectly — you stayed just under the Second Apron. The wing arrives with 5 days until the deadline. Team goes on a 7-game win streak. Playoffs locked.",
        },
      },
      {
        label: "Attach a pick to make the deal work",
        note: "Add a protected 2nd-round pick to sweeten the return",
        tags: ["asset-cost", "deal-maker"],
        outcome: {
          scoreΔ: 7,
          narrative:
            "The pick sweetened the deal and the trade closed. You gave up a future asset, but you're in the playoffs now. First-round exits don't justify the pick cost. Deep run required.",
        },
      },
      {
        label: "Counter: take back $22M and keep both your players",
        note: "Propose a different target — request their cheaper backup",
        tags: ["cap-discipline", "alternative"],
        outcome: {
          scoreΔ: 5,
          narrative:
            "Counter rejected. They wanted the star wing deal or nothing. You stood pat. Missed the playoffs by 1.5 games. The two players you kept both had solid second halves. Was patience right? The offseason will tell.",
        },
      },
      {
        label: "Three-team trade — find a third partner to absorb salary",
        note: "Involve a third team to split the salary load creatively",
        tags: ["complex-trade", "three-team"],
        outcome: {
          scoreΔ: 8,
          narrative:
            "Three-team structure worked but took 72 hours to close. The third team got a future first in exchange for absorbing $8M. You got the wing and stayed off the Second Apron. Complex, but clean.",
        },
      },
    ],
  },
  {
    id: "stats-lineup",
    missionNumber: 5,
    title: "Stats Lineup",
    scenario:
      "Your analytics team flags a five-man bench lineup with a +12 net rating over 200 possessions — far outperforming your starting five. The data is clear: this lineup creates mismatches and makes your opponents' defensive schemes irrelevant. But your head coach doesn't trust it. He calls advanced metrics 'box score fiction' and refuses to adjust rotations. You have to decide whose authority holds.",
    conceptId: "analytics",
    options: [
      {
        label: "Trust the coach — keep traditional rotations",
        note: "Preserve staff relationship, ignore the data",
        tags: ["culture", "coach-deference"],
        outcome: {
          scoreΔ: 4,
          narrative:
            "You backed the coach. The team finished 3 games below .500. Post-season review showed the lineup data was accurate — the bench five won 68% of their minutes. The coach retired. The model sat unused for a year.",
        },
      },
      {
        label: "Show the coach the data — let him decide",
        note: "Present analytics transparently, empower the coaching staff",
        tags: ["data-transparency", "coach-collaboration"],
        outcome: {
          scoreΔ: 8,
          narrative:
            "The coach studied the data over two weeks. He piloted the lineup for 5 minutes per game. By February, it was a core rotation. Trust built gradually. Best of both worlds: data-informed, coach-executed.",
        },
      },
      {
        label: "Override the coach — mandate lineup changes from the front office",
        note: "Front office dictates rotations directly",
        tags: ["analytics-first", "friction"],
        outcome: {
          scoreΔ: 5,
          narrative:
            "The lineup worked — win rate improved. But the coach felt undermined in front of his staff. He resigned mid-season. The locker room fractured over 'front office interference.' Data won the battle, culture lost the war.",
        },
      },
      {
        label: "All-in analytics overhaul — rebuild systems around the model",
        note: "Build full analytics infrastructure around data-driven rotation logic",
        tags: ["systemic-change", "analytics-investment"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "Hired a data-forward coach, built an analytics integration team. Full buy-in from ownership. Two years later: the most efficient offense in the league and a new coach who codes his own models. Process beats intuition at scale.",
        },
      },
    ],
  },
  {
    id: "matchup-adjust",
    missionNumber: 6,
    title: "Matchup Adjust",
    scenario:
      "Your franchise player — 24 years old, averaging 31 points on 38 minutes per game — is showing early fatigue signs. He's shooting 4% below his season average in the fourth quarter over the last 10 games. The medical team flags 'soft tissue stress' but not injury. The fanbase wants him on the floor. Playoffs are 11 games away. How do you manage his load?",
    conceptId: "roster-health",
    options: [
      {
        label: "Reduce to 32 minutes — protect the playoff body",
        note: "Prioritize long-term health over short-term wins",
        tags: ["load-management", "player-health"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "Smart call. He arrived in the playoffs at 97% health. His 4th-quarter numbers returned to season average. The team went 6-4 in those 10 games — just enough. Fresh legs in April matter more than 3 extra regular season wins.",
        },
      },
      {
        label: "Balanced plan — 34 minutes with strategic rest games",
        note: "Sit out 2 road back-to-backs, play all home games",
        tags: ["balanced", "win-now"],
        outcome: {
          scoreΔ: 8,
          narrative:
            "The compromise worked. Fans accepted the rest nights with advance notice. He entered the playoffs healthy and grateful for the communication. Trust built between player and front office — that matters for the extension conversation.",
        },
      },
      {
        label: "Push him — 38+ minutes, playoffs need him at full effort",
        note: "Compete for seeding and ignore the fatigue data",
        tags: ["high-risk", "win-now"],
        outcome: {
          scoreΔ: 3,
          narrative:
            "He played through it — then strained a hamstring in Game 2 of the playoffs. Out for 3-4 weeks. The team lost in the first round without him. The medical team had flagged the risk. Sometimes the data tells you exactly what will happen.",
        },
      },
      {
        label: "Aggressive rest protocol — sit him for 5 full games",
        note: "Maximum protection, significant record risk",
        tags: ["protective", "long-term"],
        outcome: {
          scoreΔ: 6,
          narrative:
            "Five games off — the team went 2-3 without him, dropping two seeds in the standings. He entered the playoffs fully healthy. Was the seeding drop worth it? With a tough first-round opponent, it's unclear. Results pending.",
        },
      },
    ],
  },
  {
    id: "draft-table",
    missionNumber: 7,
    title: "Draft Table",
    scenario:
      "You hold the #6 pick in the draft. Your scouting department loves a 19-year-old overseas wing — polished, safe, NBA-ready. Your analytics model projects a 20-year-old guard from a mid-major as a top-15 player by Year 3, based on shot quality, movement patterns, and off-ball activity. Scouts rate him #14. The model rates him #4. You have 10 minutes on the clock.",
    conceptId: "rookie-scale",
    options: [
      {
        label: "Trust the scouts — take the consensus #6 wing",
        note: "Safe pick with clear NBA skill set",
        tags: ["scout-consensus", "safe-pick"],
        outcome: {
          scoreΔ: 7,
          narrative:
            "The wing is exactly what scouts projected — solid starter by Year 2, never a star. He signed his team option extension, provides reliable production, and earns a B+ contract grade. Safe pick. Not transformative.",
        },
      },
      {
        label: "Trade down — swap #6 for #12 plus a future first",
        note: "More assets, still competitive range",
        tags: ["asset-accumulation", "trade-down"],
        outcome: {
          scoreΔ: 6,
          narrative:
            "Traded down. The future first became a Top 10 pick two years later. At #12 you took a backup center who became league-average. The pick you acquired is your real prize now — stored future value.",
        },
      },
      {
        label: "Trust the model — take the analytics darling at #6",
        note: "High variance: projected top-15 player or bust",
        tags: ["analytics-pick", "high-upside"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "The model was right. He struggled Year 1 (scouts said so), but Year 3 he made the All-Star team. His shot quality and off-ball movement translated exactly as predicted. Best pick in the draft. The analytics department gets a budget increase.",
        },
      },
      {
        label: "Swing on a raw project — 18-year-old international flier",
        note: "Lowest probability, highest upside ceiling",
        tags: ["project-pick", "high-ceiling"],
        outcome: {
          scoreΔ: 4,
          narrative:
            "The project needed two more years overseas. He joined Year 3 — still raw, but flashing brilliance. His development arc is real but slow. By Year 5, you'll know if the patience was justified. Patience has a cost: three years of a weaker roster.",
        },
      },
    ],
  },
  {
    id: "final-gm-call",
    missionNumber: 8,
    title: "Final GM Call",
    scenario:
      "End of the season. Your owner sits across from you and asks the question that defines your tenure: 'What's the plan for the next three years?' You have one All-Star under contract, two first-round picks, and a roster that narrowly missed the playoffs. The league is in transition — younger teams are winning with analytics-forward rosters. What do you tell the owner?",
    conceptId: "front-office-philosophy",
    options: [
      {
        label: "Controlled rebuild — cap discipline over the next two years",
        note: "Accumulate picks, clear bad contracts, let the young players lead",
        tags: ["rebuild", "cap-flexibility"],
        outcome: {
          scoreΔ: 7,
          narrative:
            "The rebuild plan worked. Two years of discipline — no splash moves, no panic trades. By Year 3, you had three cost-controlled young players, two first-round picks, and the cap space to land a free agent. The window is now open the right way.",
        },
      },
      {
        label: "Blend scouting and data — build a hybrid front office model",
        note: "Invest in analytics while retaining elite scout relationships",
        tags: ["balanced-philosophy", "process-driven"],
        outcome: {
          scoreΔ: 9,
          narrative:
            "Best answer. You hired a head of research and retained the top scouts. Draft decisions became data-informed but scout-validated. Three years later: two analytically-sourced All-Stars, zero wasted contracts. Process beats instinct at scale.",
        },
      },
      {
        label: "Win now — star talent over system and structure",
        note: "Pursue a max free agent immediately, trade picks for veterans",
        tags: ["win-now", "star-chasing"],
        outcome: {
          scoreΔ: 5,
          narrative:
            "You swung for a max free agent. He chose another team. The veterans traded for underperformed. Year 3: you have a mediocre roster, no picks, and a contract structure with no escape. Stars don't fix broken systems.",
        },
      },
      {
        label: "Full analytics transformation — rebuild around model-driven decisions",
        note: "Replace traditional scouting with data-first processes entirely",
        tags: ["analytics-first", "organizational-change"],
        outcome: {
          scoreΔ: 7,
          narrative:
            "Polarizing decision. Half the scouts resigned. The model found three undervalued players. Year 3: the model is working, but you've lost institutional knowledge that takes years to rebuild. Pure analytics without human context is fragile — you'll learn this the hard way in one specific evaluation failure.",
        },
      },
    ],
  },
];

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function getMissionByIndex(index: number): Mission | undefined {
  return MISSIONS[index];
}
