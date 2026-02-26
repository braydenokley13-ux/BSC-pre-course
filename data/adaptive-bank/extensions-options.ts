import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const extensionsOptionsSeed: AdaptiveConceptSeed = {
  conceptId: "extensions-options",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["extension", "player-option", "team-option"],
  objectives: [
    {
      objectiveId: "extension",
      termId: "extension",
      focus: "how early extensions change leverage and price risk",
      misconceptionTags: ["extension-always-overpay", "extension-removes-risk", "extension-no-deadlines"],
      remediation: "Highlight how timing can secure value before open market bidding.",
    },
    {
      objectiveId: "player-option",
      termId: "player-option",
      focus: "how player options shift control over the final contract year",
      misconceptionTags: ["player-option-team-control", "option-is-buyout", "option-forced-free-agency"],
      remediation: "Reinforce who controls the decision and why that affects planning.",
    },
    {
      objectiveId: "team-option",
      termId: "team-option",
      focus: "how team options create flexibility and downside protection",
      misconceptionTags: ["team-option-player-choice", "team-option-guaranteed", "team-option-no-impact"],
      remediation: "Explain when teams exercise or decline options based on role and value.",
    },
    {
      objectiveId: "supermax",
      termId: "supermax",
      focus: "what supermax eligibility means for cap and roster strategy",
      misconceptionTags: ["supermax-for-anyone", "supermax-no-tradeoffs", "supermax-short-term-only"],
      remediation: "Connect eligibility, salary share, and long-term roster constraints.",
    },
    {
      objectiveId: "qualifying-offer-rfa",
      termId: "qualifying-offer",
      focus: "how qualifying offers create restricted free agency leverage",
      misconceptionTags: ["qo-unrestricted", "qo-locks-player", "qo-is-extension"],
      remediation: "Clarify matching rights and negotiation dynamics in RFA.",
    },
    {
      objectiveId: "no-trade-clause",
      termId: "no-trade-clause",
      focus: "how no-trade terms reduce future transaction flexibility",
      misconceptionTags: ["ntc-symbolic-only", "ntc-means-no-options", "ntc-expire-immediately"],
      remediation: "Show how NTC language affects future roster pivots.",
    },
  ],
};

export default extensionsOptionsSeed;
