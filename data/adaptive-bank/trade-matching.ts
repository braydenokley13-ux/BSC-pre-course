import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const tradeMatchingSeed: AdaptiveConceptSeed = {
  conceptId: "trade-matching",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["trade-matching-rule", "salary-aggregation", "sign-and-trade"],
  objectives: [
    {
      objectiveId: "trade-matching-rule",
      termId: "trade-matching-rule",
      focus: "how outgoing salary constrains incoming salary for over-cap teams",
      misconceptionTags: ["matching-not-needed", "matching-only-deadline", "matching-only-stars"],
      remediation: "Walk through legal incoming ranges and common matching mistakes.",
    },
    {
      objectiveId: "salary-aggregation",
      termId: "salary-aggregation",
      focus: "when combining contracts can unlock legal trade structures",
      misconceptionTags: ["aggregation-always-banned", "aggregation-equals-sign-and-trade", "aggregation-ignores-apron"],
      remediation: "Clarify where aggregation is allowed and where apron rules restrict it.",
    },
    {
      objectiveId: "sign-and-trade",
      termId: "sign-and-trade",
      focus: "how sign-and-trade structures differ from direct cap-space signings",
      misconceptionTags: ["sat-same-as-trade", "sat-no-hard-cap", "sat-never-useful"],
      remediation: "Highlight hard cap triggers and strategic use cases.",
    },
    {
      objectiveId: "trade-kicker",
      termId: "trade-kicker",
      focus: "how trade kickers alter outgoing salary and matching math",
      misconceptionTags: ["kicker-paid-by-old-team", "kicker-not-in-matching", "kicker-only-playoff"],
      remediation: "Show that kickers can change math and feasibility instantly.",
    },
    {
      objectiveId: "draft-pick-value",
      termId: "draft-pick-value",
      focus: "how pick value should be weighed against salary and timeline fit",
      misconceptionTags: ["all-firsts-equal", "picks-always-better", "picks-never-matter-now"],
      remediation: "Balance pick quality, protections, and roster timeline context.",
    },
    {
      objectiveId: "asset-timeline",
      termId: "asset-timeline",
      focus: "how trade packages should match the team competitive window",
      misconceptionTags: ["timeline-irrelevant", "all-in-every-year", "rebuild-means-no-veterans"],
      remediation: "Tie transaction choices to clear three-year strategic windows.",
    },
  ],
};

export default tradeMatchingSeed;
