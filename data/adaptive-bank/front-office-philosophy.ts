import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const frontOfficePhilosophySeed: AdaptiveConceptSeed = {
  conceptId: "front-office-philosophy",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["front-office-philosophy", "asset-timeline", "team-culture"],
  objectives: [
    {
      objectiveId: "front-office-philosophy",
      termId: "front-office-philosophy",
      focus: "how guiding principles keep decisions consistent over multiple seasons",
      misconceptionTags: ["philosophy-is-slogan", "philosophy-no-tradeoffs", "philosophy-only-owner"],
      remediation: "Frame philosophy as a repeatable filter for hard decisions.",
    },
    {
      objectiveId: "asset-timeline",
      termId: "asset-timeline",
      focus: "how stars, picks, and cap room should peak in aligned windows",
      misconceptionTags: ["timeline-irrelevant", "all-assets-same-clock", "timeline-only-rebuild"],
      remediation: "Map short-, medium-, and long-term asset timing together.",
    },
    {
      objectiveId: "team-culture",
      termId: "team-culture",
      focus: "how culture standards influence execution and retention",
      misconceptionTags: ["culture-not-measurable", "culture-separate-from-results", "culture-only-coach-role"],
      remediation: "Connect behavioral standards to on-court and front-office outcomes.",
    },
    {
      objectiveId: "cap-flexibility",
      termId: "cap-flexibility",
      focus: "how philosophy affects spending pace and optionality preservation",
      misconceptionTags: ["flexibility-never-needed", "max-now-always-best", "flexibility-equals-tanking"],
      remediation: "Show why preserving optionality can support future contention.",
    },
    {
      objectiveId: "market-value",
      termId: "market-value",
      focus: "how disciplined valuation avoids emotional over-commitment",
      misconceptionTags: ["pay-anything-for-stars", "value-fixed-no-context", "value-only-media-hype"],
      remediation: "Use objective valuation ranges to support consistent deal decisions.",
    },
    {
      objectiveId: "decision-coherence",
      termId: "team-culture",
      focus: "how repeated aligned decisions build credibility with players and staff",
      misconceptionTags: ["consistency-no-benefit", "frequent-pivots-better", "coherence-only-pr"],
      remediation: "Explain that coherent decisions improve trust and long-term execution.",
    },
  ],
};

export default frontOfficePhilosophySeed;
