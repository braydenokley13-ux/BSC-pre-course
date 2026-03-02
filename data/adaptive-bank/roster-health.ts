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
      correctStatement: "Planned rest during dense schedules reduces cumulative fatigue and lowers the chance of soft tissue injury later in the season.",
      misconceptionDescriptions: [
        "Resting healthy players is a sign of weakness and signals to the team that effort is optional.",
        "Load management is just a cover for tanking—teams rest players to lose games and improve draft position.",
        "Sitting players on back-to-backs is a random decision with no medical or strategic reasoning behind it.",
      ],
    },
    {
      objectiveId: "injury-risk",
      termId: "injury-risk",
      focus: "how workload and prior history inform injury probability",
      misconceptionTags: ["injury-random-only", "history-irrelevant", "risk-fixed"],
      remediation: "Explain risk factors that can be monitored and managed.",
      correctStatement: "Injury risk rises with prior soft tissue history, workload spikes, and back-to-back scheduling—all of which can be tracked and managed.",
      misconceptionDescriptions: [
        "Injuries are entirely random events with no predictable pattern; tracking workload does nothing to prevent them.",
        "A player's injury history has no bearing on his current risk level once he is cleared to return.",
        "Injury risk is fixed by genetics and cannot be reduced by managing minutes or scheduling patterns.",
      ],
    },
    {
      objectiveId: "availability",
      termId: "availability",
      focus: "why game availability is part of player value",
      misconceptionTags: ["availability-not-value", "availability-same-as-talent", "availability-only-postseason"],
      remediation: "Tie roster value to reliable game participation across season phases.",
      correctStatement: "A player who stays healthy and appears in 75-plus games creates more wins than an equal-talent player who misses 25 percent of the schedule.",
      misconceptionDescriptions: [
        "Availability has no bearing on player value—only peak talent and per-game production matter for roster decisions.",
        "Availability and talent are the same thing; a more talented player will always be available more often.",
        "Availability only matters in the postseason; regular-season games missed by stars have minimal team impact.",
      ],
    },
    {
      objectiveId: "minute-load",
      termId: "minute-load",
      focus: "how minute spikes can increase soft tissue strain risk",
      misconceptionTags: ["minutes-no-impact", "minutes-only-stars", "minutes-reset-daily"],
      remediation: "Show cumulative load effects over dense schedule stretches.",
      correctStatement: "Rapid minute increases over a short stretch raise stress on tendons and muscles faster than the body can adapt.",
      misconceptionDescriptions: [
        "Total minutes played have no measurable connection to injury risk or soft tissue stress.",
        "Only star players need minute limits; role players can handle any workload without increased risk.",
        "The body resets fully after each night of sleep, so cumulative workload over a week is not relevant.",
      ],
    },
    {
      objectiveId: "soft-tissue",
      termId: "soft-tissue",
      focus: "why soft tissue warnings need early intervention protocols",
      misconceptionTags: ["soft-tissue-minor", "warnings-ignoreable", "soft-tissue-no-recurrence"],
      remediation: "Review escalation signs and prevention workflow decisions.",
      correctStatement: "Early soft tissue warnings require immediate protocol adjustments because partial strains often escalate to full tears without intervention.",
      misconceptionDescriptions: [
        "Soft tissue tightness is a minor complaint that players can play through without meaningful injury risk.",
        "Soreness flags during practice are routine and should be ignored unless the player requests to sit out.",
        "Once a soft tissue injury heals, the player returns to baseline risk and is no more likely to re-injure.",
      ],
    },
    {
      objectiveId: "seeding-balance",
      termId: "seeding",
      focus: "how teams balance regular-season seeding goals with health preservation",
      misconceptionTags: ["seeding-over-everything", "health-over-everything", "no-tradeoff-exists"],
      remediation: "Teach the tradeoff between short-term wins and playoff readiness.",
      correctStatement: "Teams must weigh seeding gains against fatigue cost—pushing for a seed that risks key injuries can hurt playoff performance more than the seed helps.",
      misconceptionDescriptions: [
        "Winning every regular-season game is the priority regardless of player fatigue; seeding determines playoff matchups.",
        "Player health always beats seeding goals; teams should rest anyone questionable even in high-stakes games.",
        "There is no real tradeoff between health and seeding because managing both simultaneously is always achievable.",
      ],
    },
  ],
};

export default rosterHealthSeed;
