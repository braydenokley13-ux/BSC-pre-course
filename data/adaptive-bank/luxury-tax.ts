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
      correctStatement: "Each dollar above the tax line triggers escalating penalties—the further over the threshold, the steeper the rate.",
      misconceptionDescriptions: [
        "The team pays the same flat rate on every dollar over the luxury tax line, so the penalty stays predictable.",
        "Crossing the tax line removes the salary cap, letting the team spend without further restrictions.",
        "Luxury tax penalties only apply if the team makes the playoffs with an over-limit payroll.",
      ],
    },
    {
      objectiveId: "second-apron",
      termId: "second-apron",
      focus: "how second apron restrictions remove team-building tools",
      misconceptionTags: ["apron-is-soft", "apron-blocks-only-signings", "apron-equals-hard-cap"],
      remediation: "Review specific roster tools that disappear once a team crosses the second apron.",
      correctStatement: "The second apron blocks specific roster tools—teams above it lose sign-and-trade rights, mid-level use, and future pick flexibility.",
      misconceptionDescriptions: [
        "The second apron is a soft guideline; teams can pay the fine and still use all standard roster moves.",
        "The second apron only limits free-agent signings and has no effect on trades or pick transfers.",
        "The second apron works like the hard cap—once triggered, the team cannot exceed it under any circumstance.",
      ],
    },
    {
      objectiveId: "cap-flexibility",
      termId: "cap-flexibility",
      focus: "why flexibility declines when long salary commitments stack",
      misconceptionTags: ["flexibility-only-about-cash", "short-deals-no-impact", "only-stars-matter"],
      remediation: "Connect future optionality to contract length, guaranteed money, and exceptions.",
      correctStatement: "Stacking long guaranteed deals shrinks flexibility because future options require cap space that is already committed.",
      misconceptionDescriptions: [
        "Flexibility is simply about how much cash ownership is willing to spend, unrelated to contract length or structure.",
        "Short-term deals have no real effect on future flexibility since they expire quickly.",
        "Only max-salary players affect cap flexibility; role-player contracts are small enough to ignore.",
      ],
    },
    {
      objectiveId: "cap-hold",
      termId: "cap-hold",
      focus: "how cap holds reserve space before final free-agent decisions",
      misconceptionTags: ["hold-equals-signed", "hold-does-not-count", "hold-is-trade-exception"],
      remediation: "Clarify that cap holds temporarily consume space until rights are resolved.",
      correctStatement: "A cap hold reserves space on the books for a player whose rights the team still holds, even before a deal is signed.",
      misconceptionDescriptions: [
        "A cap hold means the player is already signed; the team has locked in that salary for next season.",
        "Cap holds do not count against the salary cap, so teams can ignore them while planning free-agent spending.",
        "A cap hold works like a trade exception—it can be redirected to sign any free agent the team wants.",
      ],
    },
    {
      objectiveId: "dead-money",
      termId: "dead-money",
      focus: "why waived or stretched salary still affects cap planning",
      misconceptionTags: ["dead-money-disappears", "dead-money-not-in-tax", "dead-money-only-next-year"],
      remediation: "Use examples showing dead money stays on books and limits future moves.",
      correctStatement: "Waived salary can stay on the cap for multiple seasons through stretching, limiting the team's room for new commitments.",
      misconceptionDescriptions: [
        "Once a player is waived, his salary disappears from the cap immediately and the team gains full relief.",
        "Dead-money charges count against the cap but are excluded from luxury tax calculations.",
        "Dead money only affects the cap in the season after the waiver and clears completely after one year.",
      ],
    },
    {
      objectiveId: "soft-cap-vs-hard-cap",
      termId: "soft-cap",
      focus: "the difference between soft cap flexibility and hard cap constraints",
      misconceptionTags: ["soft-cap-no-rules", "hard-cap-always-active", "no-exceptions-anywhere"],
      remediation: "Contrast exception-driven soft cap behavior with hard cap trigger events.",
      correctStatement: "The soft cap allows teams to exceed the limit using specific exceptions, while the hard cap locks spending absolutely once triggered.",
      misconceptionDescriptions: [
        "The soft cap means there are no real spending rules—teams can sign any player for any amount at any time.",
        "The hard cap is always active for every team regardless of how they constructed their roster.",
        "Once a team is over the cap, no exceptions exist and they cannot add any new salary.",
      ],
    },
  ],
};

export default luxuryTaxSeed;
