import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const rosterHealthSeed: AdaptiveConceptSeed = {
  conceptId: "roster-health",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["load-management", "injury-risk", "availability"],
  objectives: [
    {
      objectiveId: "load-management",
      termId: "load-management",
      focus: "how planned rest can preserve performance and reduce breakdown risk",
      misconceptionTags: ["rest-is-weakness", "rest-means-tanking", "rest-no-strategy"],
      remediation: "Frame load plans as proactive performance protection.",
    },
    {
      objectiveId: "injury-risk",
      termId: "injury-risk",
      focus: "how workload and prior history inform injury probability",
      misconceptionTags: ["injury-random-only", "history-irrelevant", "risk-fixed"],
      remediation: "Explain risk factors that can be monitored and managed.",
    },
    {
      objectiveId: "availability",
      termId: "availability",
      focus: "why game availability is part of player value",
      misconceptionTags: ["availability-not-value", "availability-same-as-talent", "availability-only-postseason"],
      remediation: "Tie roster value to reliable game participation across season phases.",
    },
    {
      objectiveId: "minute-load",
      termId: "minute-load",
      focus: "how minute spikes can increase soft tissue strain risk",
      misconceptionTags: ["minutes-no-impact", "minutes-only-stars", "minutes-reset-daily"],
      remediation: "Show cumulative load effects over dense schedule stretches.",
    },
    {
      objectiveId: "soft-tissue",
      termId: "soft-tissue",
      focus: "why soft tissue warnings need early intervention protocols",
      misconceptionTags: ["soft-tissue-minor", "warnings-ignoreable", "soft-tissue-no-recurrence"],
      remediation: "Review escalation signs and prevention workflow decisions.",
    },
    {
      objectiveId: "seeding-balance",
      termId: "seeding",
      focus: "how teams balance regular-season seeding goals with health preservation",
      misconceptionTags: ["seeding-over-everything", "health-over-everything", "no-tradeoff-exists"],
      remediation: "Teach the tradeoff between short-term wins and playoff readiness.",
    },
  ],
};

export default rosterHealthSeed;
