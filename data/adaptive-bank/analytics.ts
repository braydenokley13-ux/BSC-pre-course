import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const analyticsSeed: AdaptiveConceptSeed = {
  conceptId: "analytics",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["net-rating", "sample-size", "true-shooting"],
  objectives: [
    {
      objectiveId: "net-rating",
      termId: "net-rating",
      focus: "how net rating compares lineup impact per 100 possessions",
      misconceptionTags: ["net-rating-total-points", "net-rating-single-game-proof", "net-rating-ignores-defense"],
      remediation: "Reinforce net rating as possession-normalized team impact.",
    },
    {
      objectiveId: "sample-size",
      termId: "sample-size",
      focus: "why larger samples produce more reliable decision signals",
      misconceptionTags: ["small-sample-proof", "large-sample-no-context", "sample-size-only-playoffs"],
      remediation: "Explain variance and why small streaks can mislead strategy.",
    },
    {
      objectiveId: "true-shooting",
      termId: "true-shooting",
      focus: "how shooting efficiency combines twos, threes, and free throws",
      misconceptionTags: ["ts-equals-fg", "ts-ignores-free-throws", "ts-only-for-guards"],
      remediation: "Contrast TS% with FG% to show efficiency differences.",
    },
    {
      objectiveId: "bpm-vorp",
      termId: "bpm",
      focus: "how impact metrics estimate player contribution beyond box score totals",
      misconceptionTags: ["bpm-perfect-truth", "vorp-salary-metric", "impact-metrics-lineup-free"],
      remediation: "Use impact metrics as one input, not standalone verdicts.",
    },
    {
      objectiveId: "usage-rate",
      termId: "usage-rate",
      focus: "how usage context affects efficiency interpretation",
      misconceptionTags: ["usage-better-always", "usage-unrelated-to-efficiency", "usage-only-shots"],
      remediation: "Discuss role load, defensive attention, and efficiency tradeoffs.",
    },
    {
      objectiveId: "market-inefficiency",
      termId: "market-inefficiency",
      focus: "how teams can gain value by spotting underpriced skills",
      misconceptionTags: ["inefficiency-is-luck", "inefficiency-lasts-forever", "inefficiency-no-scouting"],
      remediation: "Connect analytics findings to scouting and contract timing.",
    },
  ],
};

export default analyticsSeed;
