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
      correctStatement: "Over-cap teams must send out enough salary so the incoming amount fits within the allowed percentage of outgoing salary.",
      misconceptionDescriptions: [
        "Teams do not need to match salaries in trades; any deal that both front offices agree to is automatically legal.",
        "Matching rules only apply at the trade deadline, not during the rest of the season.",
        "Salary matching is only required when trading a max-contract player; role-player deals are exempt.",
      ],
    },
    {
      objectiveId: "salary-aggregation",
      termId: "salary-aggregation",
      focus: "when combining contracts can unlock legal trade structures",
      misconceptionTags: ["aggregation-always-banned", "aggregation-equals-sign-and-trade", "aggregation-ignores-apron"],
      remediation: "Clarify where aggregation is allowed and where apron rules restrict it.",
      correctStatement: "Aggregation lets teams combine multiple outgoing contracts into one matching pool, unlocking trades that no single contract would clear.",
      misconceptionDescriptions: [
        "Aggregating salaries in a trade is never allowed; each contract must be matched individually.",
        "Aggregating contracts to match salary is the same as a sign-and-trade and triggers the hard cap.",
        "Aggregation works regardless of apron status; no spending tier restricts a team from combining contracts.",
      ],
    },
    {
      objectiveId: "sign-and-trade",
      termId: "sign-and-trade",
      focus: "how sign-and-trade structures differ from direct cap-space signings",
      misconceptionTags: ["sat-same-as-trade", "sat-no-hard-cap", "sat-never-useful"],
      remediation: "Highlight hard cap triggers and strategic use cases.",
      correctStatement: "A sign-and-trade lets a player get a larger deal than cap space permits, but it triggers the hard cap for the acquiring team.",
      misconceptionDescriptions: [
        "A sign-and-trade is identical to a standard trade; no additional rules or cap consequences apply.",
        "Sign-and-trades do not trigger the hard cap, so teams can continue using exceptions after completing one.",
        "Sign-and-trades are almost never useful because teams with cap space can accomplish the same result more easily.",
      ],
    },
    {
      objectiveId: "trade-kicker",
      termId: "trade-kicker",
      focus: "how trade kickers alter outgoing salary and matching math",
      misconceptionTags: ["kicker-paid-by-old-team", "kicker-not-in-matching", "kicker-only-playoff"],
      remediation: "Show that kickers can change math and feasibility instantly.",
      correctStatement: "A trade kicker increases the player's salary when traded, raising the incoming number and making the deal harder to match.",
      misconceptionDescriptions: [
        "The trade kicker is paid by the team that originally signed the player and does not affect the acquiring team's books.",
        "Kicker payments are separate from the contract and excluded from salary matching calculations.",
        "Trade kickers only activate if the team receiving the player qualifies for the playoffs that season.",
      ],
    },
    {
      objectiveId: "draft-pick-value",
      termId: "draft-pick-value",
      focus: "how pick value should be weighed against salary and timeline fit",
      misconceptionTags: ["all-firsts-equal", "picks-always-better", "picks-never-matter-now"],
      remediation: "Balance pick quality, protections, and roster timeline context.",
      correctStatement: "Pick value depends on likely draft position and class strength; protected top picks from a struggling team are worth far less than unprotected ones.",
      misconceptionDescriptions: [
        "All first-round picks carry the same expected value regardless of which team they come from.",
        "Draft picks are always more valuable than established players because they carry long-term upside.",
        "Picks have no value for contending teams because winning now requires proven contributors, not future assets.",
      ],
    },
    {
      objectiveId: "asset-timeline",
      termId: "asset-timeline",
      focus: "how trade packages should match the team competitive window",
      misconceptionTags: ["timeline-irrelevant", "all-in-every-year", "rebuild-means-no-veterans"],
      remediation: "Tie transaction choices to clear three-year strategic windows.",
      correctStatement: "Trade packages should be built around the team's competitive window so key assets peak when the roster is ready to contend.",
      misconceptionDescriptions: [
        "Asset timelines are irrelevant in trades; teams should just acquire the best available player regardless of fit.",
        "Every team should go all-in every year, so timeline concerns should never slow down a deal.",
        "Teams in a rebuild must avoid veteran players entirely and only accumulate draft picks and young contracts.",
      ],
    },
  ],
};

export default tradeMatchingSeed;
