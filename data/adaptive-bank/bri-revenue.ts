import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const briRevenueSeed: AdaptiveConceptSeed = {
  conceptId: "bri-revenue",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["bri", "revenue-sharing", "local-revenue"],
  objectives: [
    {
      objectiveId: "bri",
      termId: "bri",
      focus: "how basketball-related income influences cap growth",
      misconceptionTags: ["bri-team-only", "bri-fixed-yearly", "bri-not-cap-linked"],
      remediation: "Reframe BRI as a league-wide base input tied to cap economics.",
      correctStatement: "BRI is the league-wide revenue pool shared by all teams; as it grows, the salary cap formula moves upward.",
      misconceptionDescriptions: [
        "BRI is calculated separately for each team, so a high-revenue market directly raises that team's own cap.",
        "BRI is fixed by the CBA and does not change from year to year regardless of actual league revenue.",
        "BRI is a revenue accounting tool that has no connection to how the salary cap is set each summer.",
      ],
    },
    {
      objectiveId: "revenue-sharing",
      termId: "revenue-sharing",
      focus: "how shared revenue supports competitive balance across markets",
      misconceptionTags: ["sharing-equal-every-dollar", "sharing-means-no-local-benefit", "sharing-only-playoffs"],
      remediation: "Differentiate shared pools from local income streams.",
      correctStatement: "Revenue sharing transfers funds from high-revenue markets to lower-revenue teams to preserve competitive balance, but local deals remain partly separate.",
      misconceptionDescriptions: [
        "Revenue sharing distributes every dollar equally so every franchise ends up with identical total revenue.",
        "Once revenue sharing kicks in, local broadcast deals and ticket sales no longer benefit the teams that generate them.",
        "Revenue sharing only applies during the playoffs, when gate receipts are large enough to distribute.",
      ],
    },
    {
      objectiveId: "local-revenue",
      termId: "local-revenue",
      focus: "why local deals affect spending confidence and risk tolerance",
      misconceptionTags: ["local-revenue-shared", "local-revenue-irrelevant", "local-only-ticket-sales"],
      remediation: "Connect local deal strength to long-range payroll planning.",
      correctStatement: "Strong local revenue gives a team more financial flexibility to absorb luxury tax bills and take on long-term commitments.",
      misconceptionDescriptions: [
        "All local revenue is pooled and shared, so no team benefits from a strong local TV deal or high attendance.",
        "Local revenue has no bearing on front-office strategy since spending is governed entirely by cap rules.",
        "Local revenue only refers to ticket sales; broadcast rights and sponsorships are all handled league-wide.",
      ],
    },
    {
      objectiveId: "escrow",
      termId: "escrow",
      focus: "how escrow protects owner-player split targets",
      misconceptionTags: ["escrow-is-tax", "escrow-only-rookies", "escrow-never-returned"],
      remediation: "Explain escrow as a balancing mechanism, not a team penalty.",
      correctStatement: "Escrow holds back a portion of player salaries during the season to ensure the player share of BRI stays within the agreed split.",
      misconceptionDescriptions: [
        "Escrow is an additional tax the league charges teams whose payrolls exceed the mid-level threshold.",
        "Escrow deductions only apply to rookie contracts in the first two years of a player's career.",
        "Withheld escrow funds are never returned to players; the league keeps them as a reserve regardless of revenue outcomes.",
      ],
    },
    {
      objectiveId: "salary-cap-link",
      termId: "salary-cap",
      focus: "how revenue shifts can move future cap projections up or down",
      misconceptionTags: ["cap-independent-of-revenue", "cap-linear-forever", "cap-single-team-choice"],
      remediation: "Use forecast ranges to show uncertainty in cap planning.",
      correctStatement: "Future cap levels shift with BRI projections, so a revenue downturn can flatten or even compress the cap trajectory.",
      misconceptionDescriptions: [
        "The salary cap is set independently of league revenue; it rises by a fixed percentage written into the CBA.",
        "Cap growth always follows a straight upward line and cannot plateau or drop regardless of revenue conditions.",
        "Each team sets its own internal spending cap based on local revenue and does not follow a league-wide number.",
      ],
    },
    {
      objectiveId: "budget-stability",
      termId: "cap-flexibility",
      focus: "how stable revenue planning reduces emergency roster decisions",
      misconceptionTags: ["budget-only-short-term", "budget-not-linked-to-contracts", "budget-equal-for-all-teams"],
      remediation: "Tie stable revenue assumptions to contract pacing and optionality.",
      correctStatement: "Stable multi-year revenue forecasts let teams commit to contracts with confidence that cash will be available when payments come due.",
      misconceptionDescriptions: [
        "Budget planning only matters for the current season; future revenues are too uncertain to factor into contract decisions.",
        "Budget stability is separate from contract decisions—front offices plan payroll without connecting it to revenue forecasts.",
        "All teams work from the same league-issued budget figures, so local revenue strength does not affect individual team planning.",
      ],
    },
  ],
};

export default briRevenueSeed;
