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
      correctStatement: "Net rating measures how much a lineup outscores opponents per 100 possessions, combining both offensive and defensive output.",
      misconceptionDescriptions: [
        "Net rating is the total point margin across the entire season, not adjusted for pace or possessions.",
        "A single strong game with a high net rating proves a lineup is better than the opponent's best unit.",
        "Net rating only measures offensive production; defense is tracked with a separate metric.",
      ],
    },
    {
      objectiveId: "sample-size",
      termId: "sample-size",
      focus: "why larger samples produce more reliable decision signals",
      misconceptionTags: ["small-sample-proof", "large-sample-no-context", "sample-size-only-playoffs"],
      remediation: "Explain variance and why small streaks can mislead strategy.",
      correctStatement: "Small samples produce wide variance; decisions based on fewer than 200 possessions risk reacting to noise rather than real trends.",
      misconceptionDescriptions: [
        "A streak of five strong games is enough to confirm a player has turned a corner and can be relied on.",
        "Large samples are fully reliable on their own; once you have enough data, no additional context is needed.",
        "Sample size only matters in the playoffs; regular-season statistics are stable enough to trust at any size.",
      ],
    },
    {
      objectiveId: "true-shooting",
      termId: "true-shooting",
      focus: "how shooting efficiency combines twos, threes, and free throws",
      misconceptionTags: ["ts-equals-fg", "ts-ignores-free-throws", "ts-only-for-guards"],
      remediation: "Contrast TS% with FG% to show efficiency differences.",
      correctStatement: "True shooting percentage accounts for two-point field goals, three-pointers, and free throws in a single efficiency number.",
      misconceptionDescriptions: [
        "True shooting percentage is the same as field goal percentage—it only counts made shots divided by attempts.",
        "True shooting ignores free throws because they are not field goals and are tracked separately.",
        "True shooting is only useful for guards and wings; it does not apply to centers or big men.",
      ],
    },
    {
      objectiveId: "bpm-vorp",
      termId: "bpm",
      focus: "how impact metrics estimate player contribution beyond box score totals",
      misconceptionTags: ["bpm-perfect-truth", "vorp-salary-metric", "impact-metrics-lineup-free"],
      remediation: "Use impact metrics as one input, not standalone verdicts.",
      correctStatement: "Box plus/minus estimates per-100-possession impact relative to a league average player, using box score stats as inputs.",
      misconceptionDescriptions: [
        "BPM gives a complete and definitive read on player value with no meaningful blind spots or model limitations.",
        "VORP is primarily used to set contract value and directly translates to market-rate salary decisions.",
        "Impact metrics like BPM measure individual performance independent of lineup context or teammates.",
      ],
    },
    {
      objectiveId: "usage-rate",
      termId: "usage-rate",
      focus: "how usage context affects efficiency interpretation",
      misconceptionTags: ["usage-better-always", "usage-unrelated-to-efficiency", "usage-only-shots"],
      remediation: "Discuss role load, defensive attention, and efficiency tradeoffs.",
      correctStatement: "Higher usage often lowers efficiency because the player faces tougher defensive attention and takes lower-quality shots.",
      misconceptionDescriptions: [
        "The more possessions a player uses, the better the offense runs; higher usage always improves team scoring.",
        "Usage rate has nothing to do with shooting efficiency; they are completely independent metrics.",
        "Usage rate only counts shot attempts; it excludes turnovers and assists from the calculation.",
      ],
    },
    {
      objectiveId: "market-inefficiency",
      termId: "market-inefficiency",
      focus: "how teams can gain value by spotting underpriced skills",
      misconceptionTags: ["inefficiency-is-luck", "inefficiency-lasts-forever", "inefficiency-no-scouting"],
      remediation: "Connect analytics findings to scouting and contract timing.",
      correctStatement: "Market inefficiencies exist when skills are undervalued because they are hard to see in box scores but measurable with better tools.",
      misconceptionDescriptions: [
        "Finding an underpriced player is pure luck; no systematic approach can consistently identify value others have missed.",
        "Once identified, a market inefficiency stays available indefinitely because other teams are slow to adjust.",
        "Analytics can identify market inefficiencies on their own; traditional scouting adds no value to the process.",
      ],
    },
  ],
};

export default analyticsSeed;
