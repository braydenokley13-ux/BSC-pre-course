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
    },
    {
      objectiveId: "team-option",
      termId: "team-option",
      focus: "how option years preserve flexibility during player development",
      misconceptionTags: ["team-option-player-choice", "team-option-automatic", "team-option-no-cost"],
      remediation: "Show how option timing aligns with performance evaluation windows.",
    },
    {
      objectiveId: "draft-pick-value",
      termId: "draft-pick-value",
      focus: "how pick position and class quality affect expected return",
      misconceptionTags: ["all-picks-equal", "late-picks-useless", "pick-value-static"],
      remediation: "Teach expected value ranges by pick tier and development context.",
    },
    {
      objectiveId: "two-way-contract",
      termId: "two-way-contract",
      focus: "how two-way slots support low-cost development depth",
      misconceptionTags: ["two-way-same-as-standard", "two-way-no-limits", "two-way-only-g-league"],
      remediation: "Clarify roster limits and strategic promotion timing.",
    },
    {
      objectiveId: "market-value",
      termId: "market-value",
      focus: "how rookie surplus compares to veteran replacement costs",
      misconceptionTags: ["market-value-fixed", "market-value-only-points", "market-value-no-context"],
      remediation: "Compare production bands against contract cost alternatives.",
    },
    {
      objectiveId: "asset-timeline",
      termId: "asset-timeline",
      focus: "how rookie contracts fit competitive windows and extension timing",
      misconceptionTags: ["rookie-window-irrelevant", "extend-immediately-always", "wait-always-better"],
      remediation: "Coordinate development, contention timeline, and extension sequencing.",
    },
  ],
};

export default rookieScaleSeed;
