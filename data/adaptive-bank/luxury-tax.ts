import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const luxuryTaxSeed: AdaptiveConceptSeed = {
  conceptId: "luxury-tax",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["luxury-tax-line", "second-apron", "cap-flexibility"],
  objectives: [
    {
      objectiveId: "luxury-tax-line",
      termId: "luxury-tax-line",
      focus: "how tax payments scale above the tax line",
      misconceptionTags: ["flat-tax-myth", "tax-removes-cap", "tax-only-playoff"],
      remediation: "Re-teach that each extra dollar above the line carries escalating penalties.",
    },
    {
      objectiveId: "second-apron",
      termId: "second-apron",
      focus: "how second apron restrictions remove team-building tools",
      misconceptionTags: ["apron-is-soft", "apron-blocks-only-signings", "apron-equals-hard-cap"],
      remediation: "Review specific roster tools that disappear once a team crosses the second apron.",
    },
    {
      objectiveId: "cap-flexibility",
      termId: "cap-flexibility",
      focus: "why flexibility declines when long salary commitments stack",
      misconceptionTags: ["flexibility-only-about-cash", "short-deals-no-impact", "only-stars-matter"],
      remediation: "Connect future optionality to contract length, guaranteed money, and exceptions.",
    },
    {
      objectiveId: "cap-hold",
      termId: "cap-hold",
      focus: "how cap holds reserve space before final free-agent decisions",
      misconceptionTags: ["hold-equals-signed", "hold-does-not-count", "hold-is-trade-exception"],
      remediation: "Clarify that cap holds temporarily consume space until rights are resolved.",
    },
    {
      objectiveId: "dead-money",
      termId: "dead-money",
      focus: "why waived or stretched salary still affects cap planning",
      misconceptionTags: ["dead-money-disappears", "dead-money-not-in-tax", "dead-money-only-next-year"],
      remediation: "Use examples showing dead money stays on books and limits future moves.",
    },
    {
      objectiveId: "soft-cap-vs-hard-cap",
      termId: "soft-cap",
      focus: "the difference between soft cap flexibility and hard cap constraints",
      misconceptionTags: ["soft-cap-no-rules", "hard-cap-always-active", "no-exceptions-anywhere"],
      remediation: "Contrast exception-driven soft cap behavior with hard cap trigger events.",
    },
  ],
};

export default luxuryTaxSeed;
