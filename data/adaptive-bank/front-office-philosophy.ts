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
      correctStatement: "A clear philosophy acts as a filter—when hard calls arise, the front office can measure options against a consistent standard.",
      misconceptionDescriptions: [
        "Philosophy is a marketing slogan used publicly; it has no real effect on day-to-day roster or contract decisions.",
        "A strong philosophy means every decision is obvious and easy; real tradeoffs only happen when philosophy is missing.",
        "Philosophy belongs to the owner alone; coaches and front-office staff just execute orders without strategic input.",
      ],
    },
    {
      objectiveId: "asset-timeline",
      termId: "asset-timeline",
      focus: "how stars, picks, and cap room should peak in aligned windows",
      misconceptionTags: ["timeline-irrelevant", "all-assets-same-clock", "timeline-only-rebuild"],
      remediation: "Map short-, medium-, and long-term asset timing together.",
      correctStatement: "Stars, picks, and cap room should reach their peak potential in the same window so the team can convert opportunity into wins.",
      misconceptionDescriptions: [
        "Asset timelines are management jargon; competent teams do not need to coordinate different assets around a single window.",
        "All assets follow the same internal clock, so there is no need to sequence picks differently from veteran contracts.",
        "Timeline planning only applies during rebuilds; contending teams do not need to worry about future asset coordination.",
      ],
    },
    {
      objectiveId: "team-culture",
      termId: "team-culture",
      focus: "how culture standards influence execution and retention",
      misconceptionTags: ["culture-not-measurable", "culture-separate-from-results", "culture-only-coach-role"],
      remediation: "Connect behavioral standards to on-court and front-office outcomes.",
      correctStatement: "Culture standards shape how players respond to adversity and whether key contributors re-sign with the franchise long-term.",
      misconceptionDescriptions: [
        "Culture is not measurable in any meaningful way and should not factor into personnel or contract decisions.",
        "Culture is completely separate from on-court results; teams can have poor culture and still win championships.",
        "Building team culture is entirely the head coach's job; the front office has no role in shaping it.",
      ],
    },
    {
      objectiveId: "cap-flexibility",
      termId: "cap-flexibility",
      focus: "how philosophy affects spending pace and optionality preservation",
      misconceptionTags: ["flexibility-never-needed", "max-now-always-best", "flexibility-equals-tanking"],
      remediation: "Show why preserving optionality can support future contention.",
      correctStatement: "Preserving cap flexibility keeps future options open so the team can respond when a trade opportunity or free-agent target emerges.",
      misconceptionDescriptions: [
        "Cap flexibility is never needed because teams can always find ways to move money when they want to make a deal.",
        "Spending to the maximum now is always better than holding room; flexibility is just wasted opportunity.",
        "Any team that preserves cap space is secretly tanking; real contenders spend to the limit every season.",
      ],
    },
    {
      objectiveId: "market-value",
      termId: "market-value",
      focus: "how disciplined valuation avoids emotional over-commitment",
      misconceptionTags: ["pay-anything-for-stars", "value-fixed-no-context", "value-only-media-hype"],
      remediation: "Use objective valuation ranges to support consistent deal decisions.",
      correctStatement: "Disciplined valuation sets a ceiling for each deal type so emotional or media pressure does not drive the team into overpaying.",
      misconceptionDescriptions: [
        "Teams should pay whatever it takes for star players regardless of salary-cap consequences.",
        "Player value is a fixed number that every team calculates the same way, independent of role or roster context.",
        "A player's market value is determined by media exposure and jersey sales rather than on-court performance metrics.",
      ],
    },
    {
      objectiveId: "decision-coherence",
      termId: "decision-coherence",
      focus: "how repeated aligned decisions build credibility with players and staff",
      misconceptionTags: ["consistency-no-benefit", "frequent-pivots-better", "coherence-only-pr"],
      remediation: "Explain that coherent decisions improve trust and long-term execution.",
      correctStatement: "Repeated aligned decisions build trust with players and staff, making it easier to attract and retain talent over multiple cycles.",
      misconceptionDescriptions: [
        "Decision consistency has no strategic benefit; each choice should be made in isolation based only on that moment.",
        "Front offices that change direction frequently are more adaptable and consistently outperform teams with stable philosophies.",
        "Coherent decision-making only matters for public relations; internally, it has no effect on player or staff behavior.",
      ],
    },
  ],
};

export default frontOfficePhilosophySeed;
