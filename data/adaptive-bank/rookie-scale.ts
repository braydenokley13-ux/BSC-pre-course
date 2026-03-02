import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const rookieScaleSeed: AdaptiveConceptSeed = {
  conceptId: "rookie-scale",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["rookie-scale", "team-option", "draft-pick-value"],
  objectives: [
    {
      objectiveId: "rookie-scale",
      termId: "rookie-scale",
      focus: "how fixed rookie deals can create surplus value",
      misconceptionTags: ["rookie-deals-expensive", "rookie-scale-no-rules", "rookie-scale-equals-two-way"],
      remediation: "Link rookie contract slots to expected market value spread.",
      correctStatement: "Rookie scale contracts pay below-market rates for the first four years, creating surplus value when the player produces at a higher level.",
      misconceptionDescriptions: [
        "Rookie contracts are expensive because teams must include incentive clauses that match whatever the player earns elsewhere.",
        "Rookie-scale pay is set by the team and the agent in negotiation; there are no league-mandated slot amounts.",
        "Rookie scale deals and two-way contracts are the same structure; both limit where and how much a player can earn.",
      ],
    },
    {
      objectiveId: "team-option",
      termId: "team-option",
      focus: "how option years preserve flexibility during player development",
      misconceptionTags: ["team-option-player-choice", "team-option-automatic", "team-option-no-cost"],
      remediation: "Show how option timing aligns with performance evaluation windows.",
      correctStatement: "Rookie team options let the team evaluate development before committing to a full contract; exercising or declining aligns cost with performance.",
      misconceptionDescriptions: [
        "The player chooses whether the team option is exercised based on whether he wants to stay with the franchise.",
        "Team options on rookie deals automatically extend the contract without any active decision from the front office.",
        "Declining a team option has no cost; the player just walks away with no cap or financial consequence.",
      ],
    },
    {
      objectiveId: "draft-pick-value",
      termId: "draft-pick-value",
      focus: "how pick position and class quality affect expected return",
      misconceptionTags: ["all-picks-equal", "late-picks-useless", "pick-value-static"],
      remediation: "Teach expected value ranges by pick tier and development context.",
      correctStatement: "Earlier picks have higher expected value because they select from a larger talent pool, though class strength and team development affect outcomes.",
      misconceptionDescriptions: [
        "Every draft pick carries the same probability of producing a useful rotation player regardless of where it falls.",
        "Picks outside the lottery have so little value that teams should always prefer expiring contracts over second-round assets.",
        "The value of a pick does not change over time; a pick traded today is worth the same as when it was originally acquired.",
      ],
    },
    {
      objectiveId: "two-way-contract",
      termId: "two-way-contract",
      focus: "how two-way slots support low-cost development depth",
      misconceptionTags: ["two-way-same-as-standard", "two-way-no-limits", "two-way-only-g-league"],
      remediation: "Clarify roster limits and strategic promotion timing.",
      correctStatement: "Two-way contracts allow limited NBA days, keeping development players available without counting against the standard roster.",
      misconceptionDescriptions: [
        "Two-way contracts are identical to standard deals; the player can appear in any game without restriction.",
        "Two-way players face no limits on their NBA appearances—the team can use them whenever needed throughout the season.",
        "Two-way players are permanently assigned to the G League and cannot be promoted to the main roster during the season.",
      ],
    },
    {
      objectiveId: "market-value",
      termId: "market-value",
      focus: "how rookie surplus compares to veteran replacement costs",
      misconceptionTags: ["market-value-fixed", "market-value-only-points", "market-value-no-context"],
      remediation: "Compare production bands against contract cost alternatives.",
      correctStatement: "Rookie surplus comes from paying a developing player scale wages while he produces at a value the open market would price much higher.",
      misconceptionDescriptions: [
        "Market value for players is a fixed number set by the league and does not change with supply, demand, or role.",
        "A player's market value is determined entirely by his points-per-game average, with no other statistical factors.",
        "Market value is absolute; the same player would command the same contract on any team in any situation.",
      ],
    },
    {
      objectiveId: "asset-timeline",
      termId: "asset-timeline",
      focus: "how rookie contracts fit competitive windows and extension timing",
      misconceptionTags: ["rookie-window-irrelevant", "extend-immediately-always", "wait-always-better"],
      remediation: "Coordinate development, contention timeline, and extension sequencing.",
      correctStatement: "Rookie contracts should be synced with the contention window—extending at the right moment captures value without overcommitting too early.",
      misconceptionDescriptions: [
        "The rookie contract window is irrelevant to team building; front offices should sign extensions whenever the player asks.",
        "Teams should always extend young players immediately after year two to lock them in before performance increases price.",
        "Waiting until free agency is always better than extending; players always value the open market over early security.",
      ],
    },
  ],
};

export default rookieScaleSeed;
