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
    },
    {
      objectiveId: "revenue-sharing",
      termId: "revenue-sharing",
      focus: "how shared revenue supports competitive balance across markets",
      misconceptionTags: ["sharing-equal-every-dollar", "sharing-means-no-local-benefit", "sharing-only-playoffs"],
      remediation: "Differentiate shared pools from local income streams.",
    },
    {
      objectiveId: "local-revenue",
      termId: "local-revenue",
      focus: "why local deals affect spending confidence and risk tolerance",
      misconceptionTags: ["local-revenue-shared", "local-revenue-irrelevant", "local-only-ticket-sales"],
      remediation: "Connect local deal strength to long-range payroll planning.",
    },
    {
      objectiveId: "escrow",
      termId: "escrow",
      focus: "how escrow protects owner-player split targets",
      misconceptionTags: ["escrow-is-tax", "escrow-only-rookies", "escrow-never-returned"],
      remediation: "Explain escrow as a balancing mechanism, not a team penalty.",
    },
    {
      objectiveId: "salary-cap-link",
      termId: "salary-cap",
      focus: "how revenue shifts can move future cap projections up or down",
      misconceptionTags: ["cap-independent-of-revenue", "cap-linear-forever", "cap-single-team-choice"],
      remediation: "Use forecast ranges to show uncertainty in cap planning.",
    },
    {
      objectiveId: "budget-stability",
      termId: "cap-flexibility",
      focus: "how stable revenue planning reduces emergency roster decisions",
      misconceptionTags: ["budget-only-short-term", "budget-not-linked-to-contracts", "budget-equal-for-all-teams"],
      remediation: "Tie stable revenue assumptions to contract pacing and optionality.",
    },
  ],
};

export default briRevenueSeed;
