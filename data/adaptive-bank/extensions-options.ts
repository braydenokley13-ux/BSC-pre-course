import { AdaptiveConceptSeed } from "../../lib/adaptiveBankTypes";

const extensionsOptionsSeed: AdaptiveConceptSeed = {
  conceptId: "extensions-options",
  source: "bsc-adaptive-v1",
  coreObjectiveIds: ["extension", "player-option", "team-option"],
  objectives: [
    {
      objectiveId: "extension",
      termId: "extension",
      focus: "how early extensions change leverage and price risk",
      misconceptionTags: ["extension-always-overpay", "extension-removes-risk", "extension-no-deadlines"],
      remediation: "Highlight how timing can secure value before open market bidding.",
      correctStatement: "Extensions lock in a player before open-market bidding, shifting price risk to whichever side misjudges future value.",
      misconceptionDescriptions: [
        "Extensions always result in overpaying because the team acts before the market can set a fair price.",
        "Signing an extension eliminates all contract risk by guaranteeing the player's future performance.",
        "Extensions can be offered at any point in a player's career with no league-imposed deadlines.",
      ],
    },
    {
      objectiveId: "player-option",
      termId: "player-option",
      focus: "how player options shift control over the final contract year",
      misconceptionTags: ["player-option-team-control", "option-is-buyout", "option-forced-free-agency"],
      remediation: "Reinforce who controls the decision and why that affects planning.",
      correctStatement: "A player option gives the player—not the team—the right to accept or decline the final contract year.",
      misconceptionDescriptions: [
        "A player option works like a team option; the team decides at year-end whether to keep the contract in place.",
        "A player option is a buyout clause that pays the player to leave if the team wants to move on.",
        "If a player has an option, he is automatically forced into free agency at the end of the prior year.",
      ],
    },
    {
      objectiveId: "team-option",
      termId: "team-option",
      focus: "how team options create flexibility and downside protection",
      misconceptionTags: ["team-option-player-choice", "team-option-guaranteed", "team-option-no-impact"],
      remediation: "Explain when teams exercise or decline options based on role and value.",
      correctStatement: "A team option lets the franchise decide whether to extend the deal, giving it downside protection if the player underperforms.",
      misconceptionDescriptions: [
        "A team option is controlled by the player—he chooses whether to stay for the optional year.",
        "Team options are fully guaranteed once written into the contract and cannot be declined.",
        "Team options have no effect on roster planning because they rarely change what the team ends up doing.",
      ],
    },
    {
      objectiveId: "supermax",
      termId: "supermax",
      focus: "what supermax eligibility means for cap and roster strategy",
      misconceptionTags: ["supermax-for-anyone", "supermax-no-tradeoffs", "supermax-short-term-only"],
      remediation: "Connect eligibility, salary share, and long-term roster constraints.",
      correctStatement: "The supermax is reserved for players who meet specific award thresholds and commits a high share of the cap for several years.",
      misconceptionDescriptions: [
        "Any player who has been in the league three or more years is eligible for a supermax offer.",
        "Offering the supermax has no real roster tradeoffs; the team can still sign or trade for anyone they want.",
        "Supermax contracts are short-term deals that expire quickly, so the long-term cap commitment is minimal.",
      ],
    },
    {
      objectiveId: "qualifying-offer-rfa",
      termId: "qualifying-offer",
      focus: "how qualifying offers create restricted free agency leverage",
      misconceptionTags: ["qo-unrestricted", "qo-locks-player", "qo-is-extension"],
      remediation: "Clarify matching rights and negotiation dynamics in RFA.",
      correctStatement: "A qualifying offer makes the player a restricted free agent, giving the team the right to match any outside offer sheet.",
      misconceptionDescriptions: [
        "Once the qualifying offer is made, the player becomes an unrestricted free agent and can sign with any team.",
        "A qualifying offer locks the player to the team with no option to seek an offer sheet elsewhere.",
        "A qualifying offer functions like an extension—it keeps the player on a new multi-year deal immediately.",
      ],
    },
    {
      objectiveId: "no-trade-clause",
      termId: "no-trade-clause",
      focus: "how no-trade terms reduce future transaction flexibility",
      misconceptionTags: ["ntc-symbolic-only", "ntc-means-no-options", "ntc-expire-immediately"],
      remediation: "Show how NTC language affects future roster pivots.",
      correctStatement: "A no-trade clause requires the player's consent before any trade, reducing the team's future flexibility to reshape the roster.",
      misconceptionDescriptions: [
        "A no-trade clause is mostly symbolic; the team can still trade the player by paying a fee.",
        "Once a no-trade clause is in place, the team has no trade options at all until the contract expires.",
        "No-trade clauses expire at the end of the season they are signed and do not carry into future years.",
      ],
    },
  ],
};

export default extensionsOptionsSeed;
