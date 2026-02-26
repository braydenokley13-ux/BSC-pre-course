// ─── Types ────────────────────────────────────────────────────────────────────

export interface InfoCard {
  title: string;
  content: string;
  revealDelay: number; // seconds from phase start
  roleOnly?: string;   // role ID — only this player sees this card
}

export interface Role {
  id: string;
  title: string;
  description: string;
  privateInfo: string;
}

export interface OptionMutation {
  ifStatus: string;           // apply when team has this status
  labelSuffix?: string;       // appended to label e.g. "⚠ REPEATER RISK"
  descriptionPrefix?: string; // prepended to description with context
  blocksThis?: boolean;       // hide this option entirely
}

export interface ScenarioInjection {
  requiredStatus: string; // apply when team has this status
  prependText: string;    // prepended to mission scenario
}

export interface RoundOption {
  id: string;
  label: string;
  description: string;
  tags: string[];
  blockedByStatus?: string;
  requiresStatus?: string;
  mutations?: OptionMutation[]; // status-driven patches applied server-side
}

export interface MissionRound {
  id: string;
  prompt: string;
  context?: string;
  options: RoundOption[];
  dependsOnRoundId?: string;
  dependsOnTag?: string;
}

export interface RivalCounter {
  triggerTags: string[];
  message: string;
  responseRound: MissionRound;
}

export interface OutcomeVariant {
  probability: number;
  label: string;
  scoreΔ: number;
  narrative: string;
  applyStatus: string[];
  removeStatus?: string[];
}

export interface FinalOutcome {
  roundTagCombo: string[]; // tags from all rounds that match this path
  variants: OutcomeVariant[];
}

export interface Mission {
  id: string;
  missionNumber: number;
  title: string;
  department: string;
  tagline: string;
  scenario: string;
  scenarioInjections?: ScenarioInjection[]; // status-driven context prepended to scenario
  infoCards: InfoCard[];
  roles: Role[];
  rounds: MissionRound[];
  rivalCounter?: RivalCounter;
  outcomes: FinalOutcome[];
  defaultOutcome: FinalOutcome;
  conceptId: string;
}

// ─── Mission 1: Cap Crunch ────────────────────────────────────────────────────

const capCrunch: Mission = {
  id: "cap-crunch",
  missionNumber: 1,
  title: "Cap Crunch",
  department: "SALARY CAP DEPT",
  tagline: "Extension deadline in 48 hours.",
  scenario:
    "Your franchise point guard, Marcus Webb, has one year left on his deal and has made two All-Star teams. His agent is demanding a 3-year, $48M extension — which pushes your $168M payroll $14M over the luxury tax line. LA and Miami have cleared cap space. Webb's agent wants an answer in 48 hours.",
  conceptId: "luxury-tax",
  // Mission 1 has no injections — it's the first mission, no prior status

  infoCards: [
    {
      title: "CAP SHEET ALERT",
      content:
        "Current payroll: $168M. Luxury tax line: $171M. You're $3M under. Signing a 3yr/$48M extension moves you to $185M — $14M over. First-year penalty: ~$6.3M on top of salary. Repeater threshold applies if you're over the tax in 3 of the next 4 seasons.",
      revealDelay: 0,
    },
    {
      title: "AGENT CALL — MARCUS WEBB",
      content:
        "Webb's agent: '3 years, $48M — firm. He's got real interest from LA and Miami, both with cap space. If you can't match that level of commitment, we're listening to other offers. He wants to stay but the market is the market.'",
      revealDelay: 12,
    },
    {
      title: "OWNERSHIP MEMO — CONFIDENTIAL",
      content:
        "Owner's message: 'Luxury tax is acceptable once — I'll wear it this year. But do NOT let us slide into repeater territory. If we're over the line in 3 of the next 4 years, the penalties become existential. Stay out of repeater range no matter what.'",
      revealDelay: 24,
      roleOnly: "president",
    },
    {
      title: "MEDICAL FILE — RESTRICTED",
      content:
        "Team physician note (confidential): Webb presented with a stress reaction in his left heel 18 months ago. Not publicly disclosed. Re-injury probability over a 3-year term: 28%. Recommend monitoring workload.",
      revealDelay: 24,
      roleOnly: "scout",
    },
  ],

  roles: [
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You own the cap sheet. You know every number, every penalty, every exception.",
      privateInfo:
        "Repeater math: if you sign Webb and stay over the tax for 3 of the next 4 seasons, Year 3 penalty rate jumps from $1.50 to $2.50 per dollar over. On a $14M overage that's a $21M tax bill in Year 3 alone. The owner doesn't fully grasp this yet.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You interface with ownership. You know the real budget ceiling.",
      privateInfo:
        "The owner told you privately: the absolute hard ceiling is $180M total payroll — $9M over tax. At $185M you are $5M above what he'll actually authorize. He said 'luxury tax is fine once' but he meant under $180M. You need to negotiate Webb down.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You've seen every game film. You know what the numbers don't show.",
      privateInfo:
        "Webb's heel stress reaction 18 months ago was worse than reported. The team physician gave him a 28% re-injury probability over 3 years. He's also quietly showing early signs of over-reliance on his left hand after favoring his right foot. You're not sure he's worth $16M/year in Year 3.",
    },
    {
      id: "marketing",
      title: "MARKETING DIR",
      description: "You run the revenue side of the roster. Stars drive sponsorship dollars.",
      privateInfo:
        "Webb's jersey is #2 in the city behind only the franchise legend. Losing him projects to a 22% drop in merch revenue — approximately $4.1M annually. Our top jersey sponsor has a performance clause tied to a marquee star being on the roster. If Webb leaves, that clause triggers and we lose $2.8M in sponsor revenue.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The agent wants an answer in 48 hours. What is your initial approach?",
      options: [
        {
          id: "sign-max",
          label: "Sign Webb at full terms",
          description: "Commit fully — 3yr/$48M, lock up the franchise cornerstone. Accept the luxury tax bill.",
          tags: ["sign-max", "win-now"],
          mutations: [
            {
              ifStatus: "over-luxury-tax",
              labelSuffix: " ⚠ SECOND TAX YEAR",
              descriptionPrefix: "WARNING: You're already over the tax line. This triggers repeater territory next season. ",
            },
          ],
        },
        {
          id: "negotiate",
          label: "Negotiate aggressively",
          description: "Counter below his ask. Drive toward $13–14M/year. Make the agent work for every dollar.",
          tags: ["negotiate", "cap-discipline"],
        },
        {
          id: "explore-trade",
          label: "Explore a trade",
          description: "Gauge Webb's trade value before committing. Two contenders have expressed informal interest.",
          tags: ["explore-trade", "rebuild"],
          mutations: [
            {
              ifStatus: "rebuild-mode",
              labelSuffix: " ★ REBUILD PATH",
              descriptionPrefix: "Your rebuild mandate makes this the logical play. ",
            },
          ],
        },
        {
          id: "call-bluff",
          label: "Call the bluff",
          description: "Let him enter free agency. You'll have matching rights if he signs elsewhere. Force him to show his hand.",
          tags: ["call-bluff", "high-risk"],
        },
      ],
    },
    {
      id: "terms",
      prompt: "Webb's agent calls back with a counter. What do you do?",
      context: "Your opening counter was $13.5M/year — $40.5M total. The agent responded: 'Webb has a $15M floor. That's non-negotiable. He'll go to LA at $16M if you can't hit $15M.'",
      dependsOnRoundId: "direction",
      dependsOnTag: "negotiate",
      options: [
        {
          id: "meet-floor",
          label: "Meet him at $15M/yr — $45M total",
          description: "Close the deal now. $45M keeps you $3M under the full ask and just $3M over the tax line.",
          tags: ["meet-floor", "deal-closed"],
          blockedByStatus: "over-luxury-tax",
        },
        {
          id: "restructure-bonus",
          label: "Restructure with performance bonuses",
          description: "$13M base + $2M in annual bonuses tied to All-Star selections and games played. Averages $15M if he performs.",
          tags: ["restructure-bonus", "risk-managed"],
        },
        {
          id: "final-offer",
          label: "Hold at $13.5M — true final offer",
          description: "This is your ceiling. If he walks, he walks. The market will reset eventually.",
          tags: ["final-offer", "hardball"],
        },
      ],
    },
    {
      id: "terms-sign",
      prompt: "Webb's agent responds immediately: 'Deal. But he wants a no-trade clause and a player option in Year 3.'",
      context: "You've agreed on $48M/3 years. Now the agent is adding non-financial terms.",
      dependsOnRoundId: "direction",
      dependsOnTag: "sign-max",
      options: [
        {
          id: "full-accept",
          label: "Accept all terms — NTC + player option",
          description: "Full commitment. He controls his destiny in Year 3. You lose flexibility.",
          tags: ["full-accept", "player-friendly"],
        },
        {
          id: "ntc-only",
          label: "Accept NTC, reject player option",
          description: "Protect the star, keep contract certainty. Negotiate hard on the player option.",
          tags: ["ntc-only", "balanced"],
        },
        {
          id: "counter-both",
          label: "Counter: limited NTC (5 teams), no player option",
          description: "Restricted no-trade, no opt-out. Business-first. Agent will push back.",
          tags: ["counter-both", "leverage"],
        },
      ],
    },
    {
      id: "terms-bluff",
      prompt: "Day 1 of free agency: LA files a 4yr/$64M offer sheet. You have 72 hours to match.",
      context: "Your 'call the bluff' strategy has arrived at its moment of truth.",
      dependsOnRoundId: "direction",
      dependsOnTag: "call-bluff",
      options: [
        {
          id: "match-immediately",
          label: "Match immediately",
          description: "Don't let it breathe. Match the offer sheet hour one. Signal strength.",
          tags: ["match-immediately", "star-retained"],
        },
        {
          id: "decline-for-picks",
          label: "Decline — take the two 1st-round picks",
          description: "LA's offer includes two unprotected firsts as compensation if you decline. Rebuild from there.",
          tags: ["decline-for-picks", "rebuild"],
        },
        {
          id: "counter-90",
          label: "Counter at 90% max — wait him out",
          description: "Signal you want him but won't overpay LA's sheet. He has 72 hours to decide.",
          tags: ["counter-90", "negotiate"],
        },
      ],
    },
    {
      id: "terms-trade",
      prompt: "Two trade packages are on the table. Which do you take?",
      context: "Contender A (LA): 2 unprotected first-round picks + a young PG on a rookie deal. Contender B (Miami): 1 unprotected first + their starting center (2 years, $18M remaining).",
      dependsOnRoundId: "direction",
      dependsOnTag: "explore-trade",
      options: [
        {
          id: "accept-la",
          label: "Accept LA's offer — 2 firsts + young PG",
          description: "Maximum future value. Two lottery tickets and a developing piece. Full rebuild mode.",
          tags: ["accept-la", "rebuild"],
        },
        {
          id: "accept-miami",
          label: "Accept Miami's offer — 1 first + center",
          description: "Stay semi-competitive. Keep a playoff-caliber roster piece while shedding Webb's extension.",
          tags: ["accept-miami", "balanced"],
        },
        {
          id: "reject-trades",
          label: "Reject both — keep Webb",
          description: "Neither package is good enough. Go back to the extension negotiation.",
          tags: ["reject-trades", "win-now"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["sign-max", "call-bluff"],
    message:
      "COMMISSIONER ALERT: The NBA Board of Governors voted 24–6 to strengthen the Second Apron rules. Teams entering the repeater luxury tax threshold in Year 2+ of a new CBA cycle face an additional 15% surtax. Your current trajectory puts you in repeater range by Year 3. Does this change your approach?",
    responseRound: {
      id: "rival-response",
      prompt: "The new CBA rule changes the math on your contract. How do you respond?",
      options: [
        {
          id: "restructure-now",
          label: "Restructure a current contract to stay out of repeater",
          description: "Eat a buyout on a role player now to protect Year 3 flexibility.",
          tags: ["restructure-now", "cap-discipline"],
        },
        {
          id: "accept-risk",
          label: "Accept the risk — deal with it in Year 3",
          description: "You'll worry about the repeater when you get there. Win now, pay later.",
          tags: ["accept-risk", "win-now"],
        },
        {
          id: "renegotiate",
          label: "Call Webb's agent — propose a 2-year restructure",
          description: "Shorter term avoids repeater exposure. Harder sell to the player.",
          tags: ["renegotiate", "balanced"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["sign-max", "full-accept"],
      variants: [
        {
          probability: 0.65,
          label: "Star Signed — Full Commitment",
          scoreΔ: 8,
          narrative:
            "Webb signs. The locker room knows the front office is all-in. He posts 29 points per game and drags the team to a 6-seed. The luxury tax bill arrives — $6.3M — and the owner grimaces but pays. The NTC and player option will matter in Year 3.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.35,
          label: "Star Signed — Heel Injury Year 1",
          scoreΔ: 5,
          narrative:
            "Webb signs — then the heel goes in December. He misses 28 games. The extension still looks right philosophically, but the medical risk your scout flagged was real. Team finishes 9th, out of the play-in.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
      ],
    },
    {
      roundTagCombo: ["sign-max", "ntc-only"],
      variants: [
        {
          probability: 0.75,
          label: "Star Signed — Terms Negotiated",
          scoreΔ: 9,
          narrative:
            "You accepted the NTC but held the line on the player option. Webb signed — slight annoyance from the agent, but the deal is clean. No opt-out escape hatch in Year 3. You control the contract.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.25,
          label: "Webb Stalls — Rival Offer Filed",
          scoreΔ: 5,
          narrative:
            "He sat on it for 8 days. Then Miami filed an offer sheet at a slightly higher average. You matched, but the relationship has a crack in it. He knows you weren't fully committed on his terms.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "meet-floor"],
      variants: [
        {
          probability: 0.70,
          label: "Webb Signs — Deal Closed",
          scoreΔ: 8,
          narrative:
            "You met his floor. Webb signed before the 48-hour deadline expired. The owner winces at the luxury tax but respects the execution. You're $3M over the tax line — manageable, not repeater territory.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.30,
          label: "Webb Signs — Quietly Resentful",
          scoreΔ: 5,
          narrative:
            "He accepted — then let it slip to two teammates that the front office 'lowballed him.' The locker room notices. He's performing, but the trust gap with the organization is real.",
          applyStatus: ["star-retained", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "restructure-bonus"],
      variants: [
        {
          probability: 0.60,
          label: "Bonus Structure Accepted",
          scoreΔ: 7,
          narrative:
            "Webb's agent pushed back for two weeks, then accepted. The performance structure protects you if he regresses. He makes All-Star Year 1 and earns the full bonus. Year 2 TBD.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.40,
          label: "Bonus Structure — Webb Declines",
          scoreΔ: 3,
          narrative:
            "He rejected the bonus structure. 'I'm not being paid on performance at this stage of my career.' Free agency opened — LA signed him Day 1. You now have cap space and a rebuilding roster.",
          applyStatus: ["rebuild-mode", "cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "final-offer"],
      variants: [
        {
          probability: 1.0,
          label: "Webb Walks",
          scoreΔ: 2,
          narrative:
            "He went to LA. A max contract in the first hour of free agency. You saved $34.5M in total payroll commitment and avoided the luxury tax — but lost your best player. The rebuild starts now, whether you wanted it or not.",
          applyStatus: ["rebuild-mode", "cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["call-bluff", "match-immediately"],
      variants: [
        {
          probability: 0.80,
          label: "Matched — Star Retained",
          scoreΔ: 7,
          narrative:
            "You matched within the hour. The speed of the match sent a message. Webb stayed — but the 4-year term means you're committed through his age-31 season. Longer than ideal.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.20,
          label: "Matched — Contract Regret Year 3",
          scoreΔ: 4,
          narrative:
            "You matched. Webb stayed. Then the heel. The 4-year term turns into an albatross when he misses half of Year 3. The rushed match left no room for negotiation.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
      ],
    },
    {
      roundTagCombo: ["call-bluff", "decline-for-picks"],
      variants: [
        {
          probability: 1.0,
          label: "Picks Accepted — Full Rebuild",
          scoreΔ: 6,
          narrative:
            "Two unprotected firsts in your vault. Webb went to LA and immediately posted 31 points in his debut. The city is angry. The picks are real assets. In three years you'll know if this was genius or cowardice.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["explore-trade", "accept-la"],
      variants: [
        {
          probability: 1.0,
          label: "Trade Accepted — Full Rebuild",
          scoreΔ: 7,
          narrative:
            "Two firsts and a young PG. Clean cap space. Webb posted a goodbye to the city on social media that broke the internet. Your rebuild has maximum optionality — now you have to use it.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["explore-trade", "accept-miami"],
      variants: [
        {
          probability: 0.65,
          label: "Trade Accepted — Competitive Pivot",
          scoreΔ: 8,
          narrative:
            "The center is a legitimate upgrade at the 5. You have one first and a playoff-viable roster. Not a rebuild — a retool. The city accepted it better than expected. The first-round pick becomes top-12.",
          applyStatus: ["trade-assets-rich"],
        },
        {
          probability: 0.35,
          label: "Trade — Center Underperforms",
          scoreΔ: 4,
          narrative:
            "The center's efficiency drops in your system. He was Miami's system — not yours. The one first-round pick is pick 19. The roster is mediocre and you have no Webb.",
          applyStatus: [],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Decision Made",
        scoreΔ: 5,
        narrative:
          "The front office made a call under pressure and moved forward. Results are pending.",
        applyStatus: [],
      },
    ],
  },
};

// ─── Mission 2: Contract Choice ───────────────────────────────────────────────

const contractChoice: Mission = {
  id: "contract-choice",
  missionNumber: 2,
  title: "Contract Choice",
  department: "CONTRACT OFFICE",
  tagline: "Supermax eligibility — one week to decide.",
  scenario:
    "Your young star Darius Cole has made two All-Star teams on his rookie deal and is now eligible for a Designated Player Supermax Extension — 35% of the cap for 5 years, worth $210M+. His agent is leaking interest to two cap-space teams. He has a player option in Year 5 of any extension. What do you offer?",
  scenarioInjections: [
    {
      requiredStatus: "star-retained",
      prependText: "Webb's extension is locked in — now you need to figure out Cole's future. With Webb already under max money, the cap math is brutal. ",
    },
    {
      requiredStatus: "over-luxury-tax",
      prependText: "You're already over the luxury tax line. A supermax for Cole would push you toward repeater territory for three straight seasons. ",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're in rebuild mode. Cole is your most valuable asset — but he's also your best young player. This decision defines the rebuild's ceiling. ",
    },
    {
      requiredStatus: "high-morale",
      prependText: "Team morale is high right now — Cole is happy and wants to stay. You have leverage in this negotiation. ",
    },
  ],
  conceptId: "extensions-options",

  infoCards: [
    {
      title: "SUPERMAX ELIGIBILITY CONFIRMED",
      content:
        "Cole qualifies for the Designated Player Extension: 35% of the salary cap, 5 years, fully guaranteed. Current cap: $136M. Supermax value: $47.6M/year, $238M total. Alternative: team-friendly at 30% of cap = $40.8M/year, $204M total. Difference: $34M over the life of the deal.",
      revealDelay: 0,
    },
    {
      title: "RIVAL GM INTEL",
      content:
        "Heard from a league source: Houston and Portland are both clearing significant cap space this summer. Houston's GM privately told our contact: 'Cole is the exact profile we're building around.' This is not a bluff — they have the room to sign him outright.",
      revealDelay: 12,
    },
    {
      title: "PLAYER PRIORITIES — AGENT CALL",
      content:
        "Cole's agent says his client has three priorities in order: (1) Winning — he wants to be on a real contender. (2) Market value — he doesn't want to be underpaid vs. his peers. (3) City — he likes it here but won't sacrifice 1 and 2 for it. He has not talked to the other teams directly yet.",
      revealDelay: 24,
    },
    {
      title: "CAP ROOM PROJECTION — RESTRICTED",
      content:
        "If you sign Cole at Supermax: you are fully committed through his age-28 season with virtually no cap flexibility. If you sign team-friendly: you retain a $7M trade exception and mid-level exception access. If you let him go via sign-and-trade: you can structure return assets with salary matching.",
      revealDelay: 24,
      roleOnly: "capologist",
    },
  ],

  roles: [
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You manage extensions, cap holds, and exception access.",
      privateInfo:
        "The team-friendly deal saves $34M but here's what nobody's saying: if Cole hits his Year 3 player option and leaves, you get a mid-level exception and a trade exception — not a max slot. You'd need two full off-seasons to reset. The supermax locks him in but kills cap flexibility for 5 years. Both paths are risky — just differently.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You interface with ownership and handle long-term strategy.",
      privateInfo:
        "The owner made it clear: 'Sign Cole at whatever it takes — I'm not watching him walk to Houston on national TV.' There is no actual ceiling on this deal from ownership's perspective. But the owner also said the team must be a playoff contender every year Cole is here. That's the real constraint.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You evaluate talent and long-term player trajectories.",
      privateInfo:
        "Cole is elite. But I've scouted 12 max-contract players over 20 years and I'll tell you what the tape shows: his athletic peak is right now. He's 24 — by Year 4 of this extension he'll be 28 and on the back half of his prime. His game relies on first-step quickness more than most realize. The supermax pays him peak money through post-peak years.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You run player projections and contract value models.",
      privateInfo:
        "Our model has Cole at a 94th percentile RAPTOR projection through age 27, dropping to 80th percentile by 29. The model values him at $43.2M/year through his prime and $31M/year in post-prime. The supermax pays him $47.6M/year. By our calculation, you're paying $4.4M/year above market from Day 1 and $16.6M/year above market by Year 5.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "Cole's agent is waiting. What is your extension strategy?",
      options: [
        {
          id: "offer-supermax",
          label: "Offer the full Supermax immediately",
          description: "35% of cap, 5 years, fully guaranteed. Maximum commitment to your franchise cornerstone.",
          tags: ["offer-supermax", "star-retention"],
          mutations: [
            {
              ifStatus: "over-luxury-tax",
              labelSuffix: " ⚠ REPEATER RISK",
              descriptionPrefix: "WARNING: You're already over the tax line. A supermax pushes you into repeater territory for 3+ seasons — penalties escalate to $2.50/$1. ",
            },
            {
              ifStatus: "star-retained",
              descriptionPrefix: "Webb is already locked up at $16M/year. Adding a Cole supermax gives you two max players and very little roster flexibility. ",
            },
          ],
        },
        {
          id: "team-friendly",
          label: "Propose a team-friendly extension",
          description: "30% of cap, 5 years. Saves $34M. You'll need to sell Cole on the 'team-first' framing.",
          tags: ["team-friendly", "cost-controlled"],
          mutations: [
            {
              ifStatus: "cap-space-limited",
              labelSuffix: " ★ CAP RELIEF OPTION",
              descriptionPrefix: "With your cap already strained, the $34M in savings is the difference between competing and being stuck. ",
            },
          ],
        },
        {
          id: "qualifying-offer",
          label: "Issue a qualifying offer — make him RFA",
          description: "Retain matching rights. He can test the market but you can match any offer. High-risk play.",
          tags: ["qualifying-offer", "rfa"],
        },
        {
          id: "sign-and-trade",
          label: "Orchestrate a sign-and-trade",
          description: "Maximize return assets. Cole signs with a new team through you. You get picks + players.",
          tags: ["sign-and-trade", "rebuild"],
          mutations: [
            {
              ifStatus: "rebuild-mode",
              labelSuffix: " ★ REBUILD ACCELERATOR",
              descriptionPrefix: "Your rebuild mandate makes this the logical choice — assets now over commitment. ",
            },
            {
              ifStatus: "trade-assets-rich",
              descriptionPrefix: "You already have pick capital. Adding Cole's return could give you the best asset base in the league. ",
            },
          ],
        },
      ],
    },
    {
      id: "terms-supermax",
      prompt: "Cole's agent calls back with an addition: he wants a player option in Year 4 (not Year 5) and a no-trade clause covering 28 teams.",
      context: "The supermax offer is on the table. Now the agent is pushing on non-financial terms.",
      dependsOnRoundId: "direction",
      dependsOnTag: "offer-supermax",
      options: [
        {
          id: "accept-all-terms",
          label: "Accept everything — Year 4 option + NTC",
          description: "Full commitment. He controls the relationship. You get his best years.",
          tags: ["accept-all-terms", "player-friendly"],
        },
        {
          id: "year5-option-only",
          label: "Counter: Year 5 option only, no NTC",
          description: "Push the opt-out back a year and remove the trade restriction. He gets security, you get flexibility.",
          tags: ["year5-option-only", "leverage"],
        },
        {
          id: "no-extras",
          label: "Full supermax but no extras — take it or leave it",
          description: "The money is the commitment. Non-financial terms are off the table.",
          tags: ["no-extras", "hardball"],
        },
      ],
    },
    {
      id: "terms-friendly",
      prompt: "The agent calls. Cole is 'disappointed' by the team-friendly framing. His counter: $43M/year or he will test free agency.",
      context: "You offered 30% of cap. Cole expected the supermax. The gap is $4.8M/year.",
      dependsOnRoundId: "direction",
      dependsOnTag: "team-friendly",
      options: [
        {
          id: "split-difference",
          label: "Split the difference — $43M/yr, 5 years",
          description: "Meet him between team-friendly and supermax. Both sides give something.",
          tags: ["split-difference", "balanced"],
        },
        {
          id: "add-incentives",
          label: "Hold at 30% base — add performance incentives",
          description: "Base stays team-friendly. Add $3M/year in achievable incentive triggers. He earns it if he performs.",
          tags: ["add-incentives", "risk-managed"],
        },
        {
          id: "hold-line",
          label: "Hold at 30% — call it your final offer",
          description: "This is the deal. Market discipline matters more than this one player.",
          tags: ["hold-line", "hardball"],
        },
      ],
    },
    {
      id: "terms-rfa",
      prompt: "Houston submits a 5yr/$230M offer sheet on Day 1 of free agency. You have 48 hours to match.",
      context: "Your qualifying offer strategy has arrived at its critical moment.",
      dependsOnRoundId: "direction",
      dependsOnTag: "qualifying-offer",
      options: [
        {
          id: "match-offer-sheet",
          label: "Match the offer sheet — retain Cole",
          description: "$230M over 5 years. More than your original supermax offer. This is what the market said he's worth.",
          tags: ["match-offer-sheet", "star-retained"],
        },
        {
          id: "decline-offer-sheet",
          label: "Decline — let him sign with Houston",
          description: "You get two first-round picks as compensation. Full rebuild.",
          tags: ["decline-offer-sheet", "rebuild"],
        },
      ],
    },
    {
      id: "terms-sat",
      prompt: "Two teams want Cole via sign-and-trade. Choose your return.",
      context: "Houston offers 3 unprotected firsts + a young center. Portland offers 2 unprotected firsts + their starting wing (1 year, $14M) + a future first.",
      dependsOnRoundId: "direction",
      dependsOnTag: "sign-and-trade",
      options: [
        {
          id: "houston-package",
          label: "Accept Houston — 3 unprotected firsts + young center",
          description: "Maximum future picks. Long rebuild runway.",
          tags: ["houston-package", "rebuild"],
        },
        {
          id: "portland-package",
          label: "Accept Portland — 2 firsts + wing + future first",
          description: "Stay semi-competitive. Four draft assets total and an immediate-impact player.",
          tags: ["portland-package", "balanced"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["offer-supermax", "match-offer-sheet"],
    message:
      "RIVAL GM ALERT: Boston just gave their star a 5yr/$250M extension — $10M more per year than Cole's current offer. Cole's agent just texted you: 'Boston just set a new market. We need to revisit terms.' How do you respond?",
    responseRound: {
      id: "rival-response",
      prompt: "The Boston deal just reset the market. Cole's agent is asking for more. What do you do?",
      options: [
        {
          id: "hold-current",
          label: "Hold your current offer — Boston's deal isn't precedent",
          description: "Different market, different player profile. Your offer stands.",
          tags: ["hold-current", "discipline"],
        },
        {
          id: "match-market",
          label: "Adjust upward to match new market rate",
          description: "Add $2M/year to the deal to close at competitive market value.",
          tags: ["match-market", "player-friendly"],
        },
        {
          id: "accelerate-closing",
          label: "Offer a signing bonus to close now before the market moves further",
          description: "$5M signing bonus in exchange for Cole agreeing to the current terms immediately.",
          tags: ["accelerate-closing", "creative"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["offer-supermax", "accept-all-terms"],
      variants: [
        {
          probability: 0.70,
          label: "Franchise Locked In — Full Commitment",
          scoreΔ: 9,
          narrative:
            "Cole signs. The locker room exhales. He gets the Year 4 opt-out and the NTC. The city celebrates. The win window is open — five years of elite talent under contract. Now build the roster around him.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.30,
          label: "Cole Signs — Uses Year 4 Option",
          scoreΔ: 6,
          narrative:
            "He signed. Then exercised the Year 4 player option — leaving $47M on the table to join a super team. You got three great years from him. The opt-out clause cost you the long-term relationship.",
          applyStatus: ["rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["offer-supermax", "year5-option-only"],
      variants: [
        {
          probability: 0.75,
          label: "Star Signed — Balanced Terms",
          scoreΔ: 9,
          narrative:
            "Cole signed. The Year 5 option is cosmetic — he'll be 29 and you'll likely negotiate a new deal by then anyway. You got the star, the commitment, and reasonable flexibility. Best outcome.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.25,
          label: "Cole Delays — Signs Late",
          scoreΔ: 6,
          narrative:
            "He took 3 weeks to accept the modified terms. Camp opened with uncertainty hanging over the roster. He signed but the relationship cooled. He performs at an All-Star level — the deal works on the court.",
          applyStatus: ["star-retained"],
        },
      ],
    },
    {
      roundTagCombo: ["team-friendly", "split-difference"],
      variants: [
        {
          probability: 0.65,
          label: "Deal Closed — Fair Market",
          scoreΔ: 8,
          narrative:
            "Both sides gave something. Cole gets $43M/year — above team-friendly, below supermax. He's satisfied. You saved $24M in total commitment vs. the full supermax. The locker room sees a franchise willing to invest.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.35,
          label: "Cole Signs — Publicly Grumbles",
          scoreΔ: 5,
          narrative:
            "He signed but told a reporter the front office 'prioritized the budget over the player.' It's a distraction. He performs but the organizational trust is fractured.",
          applyStatus: ["star-retained", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["team-friendly", "hold-line"],
      variants: [
        {
          probability: 1.0,
          label: "Cole Tests Free Agency",
          scoreΔ: 2,
          narrative:
            "He went to free agency on principle. Houston signed him at the full supermax. You kept the $34M difference — and lost your franchise player. The city is furious. The rebuild is now mandatory.",
          applyStatus: ["rebuild-mode", "cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["qualifying-offer", "match-offer-sheet"],
      variants: [
        {
          probability: 0.70,
          label: "Matched — Star Retained at Full Price",
          scoreΔ: 7,
          narrative:
            "You matched Houston's $230M offer. Cole stayed. But the relationship is awkward — he knows you didn't voluntarily offer the supermax. He performs but watches the exit door every summer.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.30,
          label: "Matched — Locker Room Damage",
          scoreΔ: 4,
          narrative:
            "You matched. Teammates saw the whole saga — the hesitation, the offer sheet drama, the forced match. The locker room respect for the front office took a hit. Cole stays but the chemistry is off.",
          applyStatus: ["star-retained", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["qualifying-offer", "decline-offer-sheet"],
      variants: [
        {
          probability: 1.0,
          label: "Cole to Houston — Two Picks In",
          scoreΔ: 6,
          narrative:
            "Two unprotected firsts. Houston celebrates, your city mourns. Cole immediately becomes the face of Houston's franchise. In 3 years, you'll know if those picks were worth it.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["sign-and-trade", "houston-package"],
      variants: [
        {
          probability: 1.0,
          label: "Three Firsts — Maximum Rebuild",
          scoreΔ: 8,
          narrative:
            "Three unprotected firsts and a young center. On paper, this is a haul. The young center averages 16 and 9 by Year 2. One of the three firsts becomes a lottery pick. The rebuild has real momentum.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["sign-and-trade", "portland-package"],
      variants: [
        {
          probability: 0.60,
          label: "Four Assets — Balanced Return",
          scoreΔ: 8,
          narrative:
            "Two firsts, a future first, and a solid wing. You stayed competitive while building for the future. The wing fits your system. This is how you thread the needle between rebuild and contention.",
          applyStatus: ["trade-assets-rich"],
        },
        {
          probability: 0.40,
          label: "Wing Underperforms — Pick Variance",
          scoreΔ: 5,
          narrative:
            "The wing was Portland's system. He's average in yours. The picks land at 14, 18, and a future lottery. Solid assets — not a windfall. The rebuild is slower than hoped.",
          applyStatus: ["trade-assets-rich"],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Decision Made",
        scoreΔ: 5,
        narrative: "A decision was reached under pressure. The organization moves forward.",
        applyStatus: [],
      },
    ],
  },
};

// ─── Missions 3–8: Legacy structure (to be replaced incrementally) ─────────────
// These keep the old format temporarily so the app continues to compile.
// Each will be upgraded to the full new structure one by one.

export interface LegacyMissionOption {
  label: string;
  note: string;
  tags: string[];
  outcome: { scoreΔ: number; narrative: string };
}

export interface LegacyMission {
  id: string;
  missionNumber: number;
  title: string;
  department: string;
  tagline: string;
  scenario: string;
  conceptId: string;
  options: LegacyMissionOption[];
  // flags it as legacy so the play page knows which renderer to use
  legacy: true;
}

const revenueMix: Mission = {
  id: "revenue-mix",
  missionNumber: 3,
  title: "Revenue Mix",
  department: "PARTNERSHIP OFFICE",
  tagline: "Largest sponsorship in franchise history.",
  scenario:
    "NovaTech, a global consumer electronics company, has submitted a formal proposal: a 5-year jersey patch deal worth $25M/year — the largest in franchise history. Conditions: they want naming rights to your practice facility, 10 mandated social media posts per month from the team account, and first right of refusal on any future arena naming rights. Under the CBA's BRI rules, ~50% of incremental local revenue flows into the shared pool. The owner wants maximum local dollars. Players are already grumbling about the social media clause.",
  scenarioInjections: [
    {
      requiredStatus: "high-morale",
      prependText: "The locker room is buzzing right now — players are happy and the culture is good. A tone-deaf sponsorship deal could undermine everything you've built. Use that goodwill as leverage. ",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're in rebuild mode. Revenue stability is now existential — your payroll is shrinking but your operating costs aren't. A bad deal here could set the franchise back years. ",
    },
    {
      requiredStatus: "cap-space-limited",
      prependText: "Your cap flexibility is already constrained. NovaTech's deal is one of the few tools you have to generate revenue without touching the roster. ",
    },
    {
      requiredStatus: "star-retained",
      prependText: "Webb's name is worth money to NovaTech — they specifically mentioned his marketability in their pitch. That's leverage you should use. ",
    },
  ],
  conceptId: "bri-revenue",

  infoCards: [
    {
      title: "BRI REVENUE BREAKDOWN",
      content:
        "BRI (Basketball-Related Income) covers gate receipts, local media, sponsorships, and merchandise. The current CBA splits BRI 50/50 between players and owners. Local sponsorship revenue above a baseline threshold is shared via the revenue distribution pool — approximately $0.50 of every incremental dollar goes to smaller-market teams. Net local value to your franchise: ~$12.5M/year of the $25M face value.",
      revealDelay: 0,
    },
    {
      title: "PLAYER SENTIMENT ALERT",
      content:
        "Three veterans spoke to our Player Relations VP off the record: the practice facility naming rights feel 'disrespectful to the culture here.' The social media mandate is the bigger issue — one All-Star said he will not post branded content and will address it publicly if required. This is not a small concern.",
      revealDelay: 12,
    },
    {
      title: "OWNER DIRECTIVE",
      content:
        "Owner memo: 'NovaTech is the right partner for where this franchise is going. Get this done. We need this revenue to stay competitive on payroll. If they walk, it's on you.' The owner has already told his board this deal is happening. He is emotionally committed to closing.",
      revealDelay: 20,
    },
    {
      title: "COMPETITOR INTELLIGENCE — RESTRICTED",
      content:
        "League source: two other franchises are in active talks with NovaTech's rivals for comparable deals. If NovaTech walks away from us and closes with a competitor, the optics are bad. However, NovaTech's VP of Partnerships told our CRO off the record that they prefer our market — this is not a pure auction. We have leverage we haven't used yet.",
      revealDelay: 24,
      roleOnly: "cro",
    },
  ],

  roles: [
    {
      id: "cro",
      title: "CHIEF REVENUE OFFICER",
      description: "You own all commercial partnerships, revenue strategy, and BRI reporting.",
      privateInfo:
        "The $25M face value sounds massive, but after BRI sharing, the net to our bottom line is closer to $12.5M/year. That's still meaningful — but it's not $25M. The owner doesn't fully understand this math. More importantly: NovaTech told me privately they have a firm $18M floor and would drop the facility naming rights for $20M+. We have real room to negotiate here.",
    },
    {
      id: "marketing",
      title: "MARKETING DIRECTOR",
      description: "You manage brand identity, player partnerships, and social media strategy.",
      privateInfo:
        "The 10-post mandate is a brand killer. Our social content currently drives $3.2M in ancillary revenue from organic brand deals — authenticity is the asset. Forced NovaTech posts will drop engagement by an estimated 35%, which actually undercuts the sponsor's own goal. There's a creative solution: 6 organic-feel posts versus 10 overt ads. NovaTech's marketing team would likely accept this — their internal research shows organic integration outperforms hard ads 4:1.",
    },
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You track the relationship between revenue and salary cap implications.",
      privateInfo:
        "Sponsorship revenue doesn't directly affect the salary cap, but it affects the owner's willingness to pay into the luxury tax. Here's the key: if we close this deal at $20M+ net, the owner has said he'll approve crossing the luxury tax line to re-sign our restricted free agent this summer. If the deal collapses or comes in under $18M, he'll demand we stay under the tax. The sponsorship decision is also the payroll decision.",
    },
    {
      id: "player-relations",
      title: "PLAYER RELATIONS VP",
      description: "You manage player-management relationships and locker room climate.",
      privateInfo:
        "Marcus Webb told me directly: 'If they put NovaTech's name on our practice facility, I'm asking to be traded.' He's not exaggerating. Three veterans echoed this. The social posts are the second issue — our starting center has a personal brand agreement with a NovaTech competitor. He would be in breach of his own deal if he posts NovaTech content. We have a legal conflict that nobody has flagged yet.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "NovaTech is waiting for your response. How do you approach the deal?",
      options: [
        {
          id: "accept-full",
          label: "Accept all terms — $25M, 5 years",
          description: "Maximum guaranteed revenue. Close fast before they look elsewhere. Deal with the player concerns internally.",
          tags: ["accept-full", "revenue-max"],
        },
        {
          id: "negotiate",
          label: "Negotiate — drop the naming rights, adjust the social mandate",
          description: "Counter with a modified deal: $20M+, no facility naming, reduce social posts to 6/month.",
          tags: ["negotiate", "balanced"],
        },
        {
          id: "reject",
          label: "Reject the deal — the terms compromise team culture",
          description: "Walk away. Protect the locker room and brand identity. Find a different partner.",
          tags: ["reject", "culture-first"],
        },
        {
          id: "performance-based",
          label: "Propose a performance-based structure — $12M base + upside",
          description: "Minimize guaranteed commitments. Upside tied to wins, viewership, and All-Star appearances.",
          tags: ["performance-based", "risk-shifted"],
        },
      ],
    },
    {
      id: "terms-negotiate",
      prompt: "NovaTech's VP calls back. They'll drop the naming rights — but they're holding at $22M and want 8 social posts instead of 10.",
      context: "Your counter for $20M and 6 posts got a partial response. The gap: $2M/year and 2 posts.",
      dependsOnRoundId: "direction",
      dependsOnTag: "negotiate",
      options: [
        {
          id: "accept-22m",
          label: "Accept $22M / 8 posts — close now",
          description: "Strong deal, no naming rights. The social post count is manageable. Don't let perfect kill good.",
          tags: ["accept-22m", "deal-closed"],
        },
        {
          id: "hold-20m",
          label: "Hold at $20M / 6 posts — final counter",
          description: "You know they have a $18M floor and prefer your market. Hold your ground.",
          tags: ["hold-20m", "hardball"],
        },
        {
          id: "creative-integration",
          label: "Propose organic integration — 6 'unbranded' posts at $21M",
          description: "Use the marketing insight: organic content outperforms hard ads 4:1. Sell NovaTech on quality over quantity.",
          tags: ["creative-integration", "analytics-forward"],
          requiresStatus: "analytics-forward",
        },
        {
          id: "escalate-to-owner",
          label: "Escalate to the owner — let him close it directly",
          description: "The owner wants this done. Let him make the call on the last $2M.",
          tags: ["escalate-to-owner", "deferred"],
        },
      ],
    },
    {
      id: "terms-accept-full",
      prompt: "Webb's agent calls. Webb is demanding a meeting about the practice facility name. Two veterans are asking the Player Relations VP for clarity on the social posts.",
      context: "You accepted the full deal. Now you need to manage the player fallout.",
      dependsOnRoundId: "direction",
      dependsOnTag: "accept-full",
      options: [
        {
          id: "stand-firm",
          label: "Stand firm — revenue commitments come first",
          description: "The deal is signed. Communicate the business reality to the players. They'll adjust.",
          tags: ["stand-firm", "revenue-first"],
        },
        {
          id: "offer-exemptions",
          label: "Negotiate player exemptions — opt-out for individual brand conflicts",
          description: "Work with the players individually. If a player has a competing brand deal, we carve them out of the social mandate.",
          tags: ["offer-exemptions", "player-friendly"],
        },
        {
          id: "renegotiate-social",
          label: "Go back to NovaTech — reduce social posts to 6, same price",
          description: "Use the conflict issue as leverage to soften the mandate. Keep the $25M.",
          tags: ["renegotiate-social", "balanced"],
        },
      ],
    },
    {
      id: "terms-performance",
      prompt: "The owner calls. He's seen the performance-based structure and is angry: 'I need predictable revenue, not a lottery ticket. Either get guaranteed money or kill it.'",
      context: "Your performance-based counter got a strong reaction from ownership.",
      dependsOnRoundId: "direction",
      dependsOnTag: "performance-based",
      options: [
        {
          id: "convert-to-base",
          label: "Convert to a guaranteed base — $15M/yr, 5 years",
          description: "Meet the owner's predictability requirement. Still $10M/yr below the original ask, but clean.",
          tags: ["convert-to-base", "owner-aligned"],
        },
        {
          id: "hybrid-structure",
          label: "Hybrid: $18M base + $5M max upside",
          description: "Compromise: guaranteed floor with meaningful upside. Pitch it as 'best of both worlds.'",
          tags: ["hybrid-structure", "balanced"],
        },
        {
          id: "walk-away",
          label: "Walk away from the deal entirely",
          description: "If the owner wants guaranteed money and NovaTech wants conditions we can't accept, the deal doesn't work.",
          tags: ["walk-away", "no-deal"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["accept-full", "accept-22m"],
    message:
      "COMPETITOR ALERT: Boston just announced a 5-year, $30M/year jersey patch deal with a rival tech company — the new league record. Your NovaTech deal, at $25M or $22M, is no longer the largest in franchise history. The owner is calling. He wants to know why you didn't push for more.",
    responseRound: {
      id: "rival-response",
      prompt: "The owner is upset the Boston deal eclipsed yours. How do you respond?",
      options: [
        {
          id: "defend-deal",
          label: "Defend the deal — Boston's market is 3× larger",
          description: "Context matters. Our deal is market-appropriate and the terms protect the culture.",
          tags: ["defend-deal", "principled"],
        },
        {
          id: "renegotiate-up",
          label: "Go back to NovaTech — push for $27M using Boston as leverage",
          description: "Use the competitor announcement as a new data point. The market just moved.",
          tags: ["renegotiate-up", "aggressive"],
        },
        {
          id: "accept-optics",
          label: "Accept the optics — focus on long-term culture value",
          description: "Tell the owner the number isn't everything. Sustainable culture drives long-term revenue better than a headline figure.",
          tags: ["accept-optics", "culture-first"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["accept-full", "stand-firm"],
      variants: [
        {
          probability: 0.50,
          label: "Deal Closed — Player Discontent",
          scoreΔ: 6,
          narrative:
            "Revenue is up — $25M flows into the balance sheet. Two veterans publicly grumble about the naming rights. Webb requests a trade meeting; you talk him down. The social media posts perform poorly — NovaTech's internal team is frustrated. Year 1 works financially. The culture cost is real.",
          applyStatus: ["over-luxury-tax", "coach-conflict"],
        },
        {
          probability: 0.50,
          label: "Deal Closed — Legal Conflict Triggered",
          scoreΔ: 4,
          narrative:
            "Your starting center's competing brand deal creates a legal dispute. His agent threatens breach-of-contract action against the franchise. It resolves in 90 days, but the distraction during the season is damaging. The BRI revenue net is $12.5M/year — not the $25M headline.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["accept-full", "offer-exemptions"],
      variants: [
        {
          probability: 0.70,
          label: "Deal Closed — Player Conflict Managed",
          scoreΔ: 8,
          narrative:
            "The exemption carve-outs resolved the legal conflict and quieted the loudest veterans. NovaTech accepted the modified social terms. Revenue is in. The locker room accepted it as a reasonable compromise. Good execution on a messy situation.",
          applyStatus: ["over-luxury-tax"],
        },
        {
          probability: 0.30,
          label: "Deal Closed — Sponsor Satisfaction Low",
          scoreΔ: 5,
          narrative:
            "NovaTech's internal team is frustrated — the exemptions reduced their social reach by 40%. They started early conversations about not renewing in Year 3. The revenue is here now; the future is uncertain.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "accept-22m"],
      variants: [
        {
          probability: 0.80,
          label: "Deal Closed — Strong Outcome",
          scoreΔ: 8,
          narrative:
            "No naming rights. $22M/year, 8 posts. Players accepted it — the facility stays ours. The social posts are manageable. Net BRI value: ~$11M/year. A genuine win on terms that don't damage the culture.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.20,
          label: "Deal Closed — Owner Disappointed",
          scoreΔ: 6,
          narrative:
            "$22M vs. $25M — the owner sees $3M/year left on the table. He signs off but makes a note. When the Boston deal headlines come out at $30M, you'll feel this gap.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "hold-20m"],
      variants: [
        {
          probability: 0.60,
          label: "NovaTech Accepts — Best Terms",
          scoreΔ: 9,
          narrative:
            "They came back at $20.5M and 6 posts. Close enough. No naming rights. Players are satisfied. Net BRI ~$10.3M/year. You negotiated from strength, got what you wanted, and protected the culture. Best outcome.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.40,
          label: "NovaTech Walks — No Deal",
          scoreΔ: 3,
          narrative:
            "They took their budget to a rival market. The owner is furious. You held too long on a deal that had room to close. No revenue, no deal, no alternative ready.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "creative-integration"],
      variants: [
        {
          probability: 1.0,
          label: "Organic Integration Deal — Best-in-Class",
          scoreΔ: 10,
          narrative:
            "NovaTech's VP of Marketing loved it. '6 premium organic integrations beat 10 ads every time.' Closed at $21M. No naming rights. Players didn't even notice the posts. NovaTech's CMO is presenting the integration strategy at a marketing conference. This is a case study.",
          applyStatus: ["high-morale", "analytics-forward"],
        },
      ],
    },
    {
      roundTagCombo: ["reject"],
      variants: [
        {
          probability: 1.0,
          label: "No Deal — Culture Protected",
          scoreΔ: 3,
          narrative:
            "Players respected it. The owner didn't. You left $12.5M/year in net BRI revenue on the table. The following off-season, the owner declined to cross the luxury tax line to re-sign a key restricted free agent. The roster gap is directly connected to this revenue shortfall.",
          applyStatus: ["cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["performance-based", "convert-to-base"],
      variants: [
        {
          probability: 0.65,
          label: "Base Deal Closed — Owner Satisfied",
          scoreΔ: 7,
          narrative:
            "$15M/year guaranteed. No facility naming, modified social terms. The owner gets predictability. Net BRI ~$7.5M/year. Not the headline deal, but clean and durable. NovaTech renewed after Year 2.",
          applyStatus: [],
        },
        {
          probability: 0.35,
          label: "Base Deal — Sponsor Questions Value",
          scoreΔ: 5,
          narrative:
            "$15M/year — NovaTech's board flagged it as below-market within 18 months. They triggered an exit clause in Year 3. You're back to zero sponsorship revenue with one year of experience negotiating bad deal terms.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["performance-based", "hybrid-structure"],
      variants: [
        {
          probability: 0.55,
          label: "Hybrid Closes — Upside Earned",
          scoreΔ: 8,
          narrative:
            "Team made the playoffs. Triggered $4.5M of the $5M upside. Total Year 1: $22.5M. Owner loves it. NovaTech loved it more — the playoff run made their brand content go viral. Structure works when the team wins.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.45,
          label: "Hybrid — Team Misses Playoffs, Upside Not Triggered",
          scoreΔ: 5,
          narrative:
            "The base held at $18M. But the $5M upside trigger required a playoff appearance — you finished 9th. NovaTech's board circled the clause and brought it up in Year 2 negotiations. Revenue is below projection.",
          applyStatus: [],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Deal Decided",
        scoreΔ: 5,
        narrative: "A revenue decision was made under complex conditions. The franchise moves forward.",
        applyStatus: [],
      },
    ],
  },
};

const expensePressure: Mission = {
  id: "expense-pressure",
  missionNumber: 4,
  title: "Expense Pressure",
  department: "TRADE OPERATIONS",
  tagline: "Trade deadline — salary must match.",
  scenario:
    "It's 3 PM on trade deadline day. You're 2.5 games out of a playoff spot. Dallas wants to offload their star wing, Jordan Reeves — $28M this season, one year remaining. He's averaging 26 points and is exactly what your roster is missing. To match salary under CBA trade rules you must send back 125% of his salary plus $2M — meaning at least $22M outbound. You have a $12M small forward and a $10M backup center who can be combined (aggregated) to hit the threshold. But taking on Reeves without sending out equal salary triggers Second Apron exposure. The clock runs out at 3 PM.",
  scenarioInjections: [
    {
      requiredStatus: "over-luxury-tax",
      prependText: "You're already over the luxury tax line. Absorbing Reeves' $28M without matching salary moves you into Second Apron territory — you lose the right to use mid-level exceptions for three years and can't aggregate contracts in future trades. ",
    },
    {
      requiredStatus: "trade-assets-rich",
      prependText: "You have pick capital from prior trades. This is your moment to weaponize those assets — Dallas is desperate and you have what they want. ",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're rebuilding — does a one-year rental on a $28M wing make sense? Unless you see a clear playoff path, every dollar and pick you spend now delays the rebuild. ",
    },
    {
      requiredStatus: "star-retained",
      prependText: "With Webb locked in, Reeves would give you a true two-man front office story to sell to free agents. The combination could push you from fringe contender to genuine threat. ",
    },
  ],
  conceptId: "trade-matching",

  infoCards: [
    {
      title: "TRADE MATCHING RULES",
      content:
        "CBA trade matching rules: when a team is over the salary cap, incoming salary cannot exceed 125% of outgoing salary + $2M. Example: sending out $22M allows you to receive up to $29.5M. Salary aggregation allows combining multiple contracts into one outgoing package. Key restriction: teams over the Second Apron ($189M in the current CBA cycle) face additional limits — they cannot aggregate contracts to take on a player making more than them.",
      revealDelay: 0,
    },
    {
      title: "SECOND APRON STATUS",
      content:
        "Your current payroll: $186.5M. Second Apron threshold: $189M. Reeves at $28M + current payroll minus outgoing $22M = $192.5M — that puts you $3.5M over the Second Apron. Consequence: you would lose your ability to use the mid-level exception, lose the ability to aggregate in future trades, and your draft pick acquisition rights are restricted for 3 years.",
      revealDelay: 10,
    },
    {
      title: "DALLAS'S MOTIVATION",
      content:
        "Dallas wants to clear Reeves' salary to reset their payroll before the off-season. They're in a rebuild. Reeves has asked for a trade — they're complying. Their GM has told two other teams about this deal. There are 4 hours left before the deadline. They need an answer at 2 PM to file the paperwork in time.",
      revealDelay: 20,
    },
    {
      title: "REEVES MEDICAL FILE — CONFIDENTIAL",
      content:
        "Team physician note: Jordan Reeves had a labrum procedure on his left shoulder 14 months ago. Recovery was full per official reports. However, our scout's film review shows he has significantly reduced his pull-up jumper from the left side since the surgery — a shot he hit at 41% previously. Opponents will scheme for this in a playoff series. He's not the same player off the left.",
      revealDelay: 24,
      roleOnly: "scout",
    },
  ],

  roles: [
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You are the authority on CBA trade mechanics and cap exposure.",
      privateInfo:
        "Here's the number nobody's saying out loud: if we cross the Second Apron threshold, we lose aggregation rights for 3 years. That means every future trade, we can only send one contract to match salary. If we plan to be buyers at future deadlines, crossing the Second Apron today handicaps us far beyond just this deal. The short-term gain has a very long tail of restrictions.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You balance win-now pressure with long-term franchise health.",
      privateInfo:
        "The owner called me this morning. He said: 'If we miss the playoffs this year by a game or two and you had the chance to make this trade and didn't — that's a bad look. Make the call.' He also said: 'But don't blow up the team for a rental.' Reeves is a one-year rental — he's a free agent this summer. The owner's two sentences are in direct tension with each other.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You evaluate player quality and long-term value.",
      privateInfo:
        "Reeves' shoulder. I've watched 40 games this year. He's protecting it. The pull-up from the left is gone — he's steering everything right. A good defensive coordinator in a playoff series will shade him left relentlessly. He'll shoot 4-for-18 in a closeout game and everyone will say the trade was a mistake. I'm not saying don't do it — I'm saying price it accordingly. This is not the same player we saw 18 months ago.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You run win-probability and asset-value models.",
      privateInfo:
        "Our playoff probability model: current roster at 34% chance to make the play-in, 12% to advance past the first round. With Reeves added: 71% play-in, 38% first-round advance. The value is significant. But here's the model's other output: Reeves as a free agent this summer projects to receive a 4yr/$108M offer — we cannot afford that if we're over the Second Apron. We get him for 60 regular season games and a playoff run, then lose him for free to cap-space teams. Run the math on whether that's worth 3 years of restricted trade flexibility.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "It's 10 AM. Dallas wants an answer by 2 PM. What is your trade strategy?",
      options: [
        {
          id: "aggregate",
          label: "Aggregate both contracts — send $22M, take $28M",
          description: "Combine the $12M SF and $10M backup center. Legal match. Triggers Second Apron exposure. Reeves arrives.",
          tags: ["aggregate", "star-acquisition"],
        },
        {
          id: "add-pick",
          label: "Attach a protected 2nd-round pick to a single contract",
          description: "Send the $12M SF + a pick. Ask Dallas to accept without requiring the backup center. Avoids Second Apron if they take salary back.",
          tags: ["add-pick", "asset-cost"],
        },
        {
          id: "three-team",
          label: "Build a three-team trade to split the salary load",
          description: "Find a third team to absorb some incoming salary, keeping you off the Second Apron.",
          tags: ["three-team", "complex-trade"],
        },
        {
          id: "stand-pat",
          label: "Stand pat — decline the deal",
          description: "The Second Apron cost is too high for a one-year rental. Stay the course with the current roster.",
          tags: ["stand-pat", "cap-discipline"],
        },
      ],
    },
    {
      id: "terms-aggregate",
      prompt: "League office confirms the salary match is legal. But your capologist flags the Second Apron exposure. Reeves' agent calls — he wants to see a commitment from you before he waives his partial no-trade clause.",
      context: "Trade is structurally ready. Two decisions remain: accept the Second Apron consequences and confirm Reeves is willing.",
      dependsOnRoundId: "direction",
      dependsOnTag: "aggregate",
      options: [
        {
          id: "commit-and-close",
          label: "Commit to Reeves — accept the Second Apron exposure",
          description: "The playoff run matters more than 3 years of trade restrictions. Win now.",
          tags: ["commit-and-close", "win-now"],
        },
        {
          id: "conditional-commitment",
          label: "Commit — but go back to Dallas for a salary sweetener",
          description: "Ask Dallas to take back a small contract to reduce your net payroll increase and get below the Second Apron.",
          tags: ["conditional-commitment", "cap-discipline"],
        },
        {
          id: "pull-back",
          label: "Pull back — Second Apron consequences are too severe",
          description: "The capologist's numbers changed the calculus. Decline and keep the aggregation rights intact.",
          tags: ["pull-back", "long-term"],
        },
      ],
    },
    {
      id: "terms-three-team",
      prompt: "You have two potential third teams. Chicago will absorb $5M of Reeves' salary in exchange for your 2nd-round pick. Portland will absorb $8M for a swap of a future first (top-6 protected).",
      context: "The three-team structure can keep you off the Second Apron, but each option costs an asset.",
      dependsOnRoundId: "direction",
      dependsOnTag: "three-team",
      options: [
        {
          id: "chicago-partner",
          label: "Use Chicago — $5M absorbed, costs a 2nd-round pick",
          description: "Smaller absorb, cheaper cost. You still end up near the Second Apron line but under it.",
          tags: ["chicago-partner", "asset-cost"],
        },
        {
          id: "portland-partner",
          label: "Use Portland — $8M absorbed, costs a top-6 protected 1st",
          description: "Better salary relief, higher cost. The protected first is low-risk but real value if you rebuild.",
          tags: ["portland-partner", "asset-cost"],
        },
        {
          id: "abandon-three-team",
          label: "Three-team too complicated — go back to direct trade or stand pat",
          description: "The paperwork won't clear before 3 PM. Simplify.",
          tags: ["abandon-three-team", "practical"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["aggregate", "three-team"],
    message:
      "RIVAL MOVE: Boston just acquired a comparable wing at the deadline — 2 years remaining, $24M/year. They're now the betting favorites to come out of the East. Dallas's GM is texting you: 'One other team just called about Reeves. We need your final answer in 30 minutes, not 2 PM.' The clock just moved up.",
    responseRound: {
      id: "rival-response",
      prompt: "The timeline compressed — 30 minutes. Another team is bidding. Do you accelerate or hold?",
      options: [
        {
          id: "accelerate",
          label: "Accelerate — file the paperwork now",
          description: "Don't let a rival steal this. Close immediately.",
          tags: ["accelerate", "decisive"],
        },
        {
          id: "call-bluff-dallas",
          label: "Call Dallas's bluff — you don't believe the other team is real",
          description: "GMs create urgency artificially. Hold the 2 PM deadline.",
          tags: ["call-bluff-dallas", "composed"],
        },
        {
          id: "increase-offer",
          label: "Increase your offer — add a pick to beat the rival",
          description: "If there's real competition, outbid them now before you lose Reeves.",
          tags: ["increase-offer", "aggressive"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["aggregate", "commit-and-close"],
      variants: [
        {
          probability: 0.60,
          label: "Trade Closed — Playoff Run",
          scoreΔ: 9,
          narrative:
            "Reeves arrived with 5 days before the deadline. The team went 11-4 over the final stretch. Made the playoffs as the 5-seed. Lost in 6 in the second round — his shoulder showed in games 4 and 5. But you made the postseason. The Second Apron restrictions start next season.",
          applyStatus: ["over-luxury-tax"],
        },
        {
          probability: 0.40,
          label: "Trade Closed — Early Exit",
          scoreΔ: 6,
          narrative:
            "Reeves helped you squeak into the play-in — but his shoulder was a problem in a 3-game elimination. You're out in the first round. The Second Apron consequences begin, and you gave up two solid rotation players for a four-week playoff run that ended in the play-in.",
          applyStatus: ["over-luxury-tax", "cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["aggregate", "conditional-commitment"],
      variants: [
        {
          probability: 0.65,
          label: "Modified Trade — Under Second Apron",
          scoreΔ: 9,
          narrative:
            "Dallas took back a $4M expiring deal to reduce the net salary increase. You landed under the Second Apron. Reeves came, the team made the playoffs, and your trade flexibility is preserved. Best structural outcome on this path.",
          applyStatus: [],
        },
        {
          probability: 0.35,
          label: "Dallas Refused — Deal Collapsed",
          scoreΔ: 4,
          narrative:
            "Dallas wouldn't take back salary. They had no reason to complicate a simple dump. The conditional counter killed the deal. You stood pat — missed playoffs by a game.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["aggregate", "pull-back"],
      variants: [
        {
          probability: 1.0,
          label: "Stand Pat — Aggregation Rights Preserved",
          scoreΔ: 5,
          narrative:
            "You protected the long-term cap position. The current roster missed the playoffs by 1.5 games. The fanbase and owner are frustrated. The capologist was right about the Second Apron — whether the cost was worth it depends on what you do with those trade rights next summer.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["three-team", "chicago-partner"],
      variants: [
        {
          probability: 0.70,
          label: "Three-Team Closes — Under Second Apron",
          scoreΔ: 8,
          narrative:
            "Chicago absorbed the $5M. You landed $1M under the Second Apron. Reeves arrived in time. You made the playoffs. A 2nd-round pick cost you the deal — but you preserved aggregation rights for future deadlines. Smart structure.",
          applyStatus: [],
        },
        {
          probability: 0.30,
          label: "Paperwork Didn't Clear",
          scoreΔ: 3,
          narrative:
            "Three-team trades require league office review. It didn't clear before the 3 PM deadline. All three teams missed the window. Reeves stays in Dallas. You miss the playoffs.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["three-team", "portland-partner"],
      variants: [
        {
          probability: 0.75,
          label: "Three-Team Closes — Protected First Sent",
          scoreΔ: 9,
          narrative:
            "Portland took the top-6 protected first. The protection makes it low-risk — you finished 5th this year, above the trigger. Reeves arrived. Playoffs made. The protected pick conveys years from now when you're likely in full contention. Outstanding deal structure.",
          applyStatus: ["trade-assets-rich"],
        },
        {
          probability: 0.25,
          label: "Protection Triggers — Pick Conveys Early",
          scoreΔ: 6,
          narrative:
            "You finished 7th — outside top 6. The protected pick conveyed immediately to Portland. You traded a legitimate lottery pick for a rental. The trade worked on the court; the asset cost was real.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["add-pick"],
      variants: [
        {
          probability: 0.55,
          label: "Pick Attached — Dallas Accepts",
          scoreΔ: 7,
          narrative:
            "Dallas took the $12M SF + a protected 2nd-round pick. They didn't need the backup center. The pick sweetened it. You avoided Second Apron exposure. Reeves arrived. Playoffs made. One asset spent.",
          applyStatus: [],
        },
        {
          probability: 0.45,
          label: "Dallas Declined — Needs Full Match",
          scoreΔ: 4,
          narrative:
            "Dallas was trying to shed salary, not acquire picks. They needed the matching salary out, not a pick in. Counter rejected. You missed the playoffs by a game and still have both your role players.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["stand-pat"],
      variants: [
        {
          probability: 1.0,
          label: "Standing Pat — Future Preserved",
          scoreΔ: 5,
          narrative:
            "You kept the aggregation rights. Missed the playoffs by 1.5 games. The owner questioned the decision for 6 weeks, then acknowledged the Second Apron logic. Next summer, you used the aggregation rights to acquire a different star on a multi-year deal. The patience paid off — eventually.",
          applyStatus: [],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Decision Made Under Pressure",
        scoreΔ: 5,
        narrative: "The deadline passed. The front office made a call.",
        applyStatus: [],
      },
    ],
  },
};

const statsLineup: Mission = {
  id: "stats-lineup",
  missionNumber: 5,
  title: "Stats Lineup",
  department: "ANALYTICS LAB",
  tagline: "The model says bench the starters.",
  scenario:
    "Your analytics team has identified a five-man bench lineup with a +12.4 net rating over 214 possessions this season — the third-best lineup combination in the entire league by this measure. Your starting five's net rating over the same period: +3.1. The gap is not noise. But your head coach, Marcus Hill — a 22-year veteran with two championship rings — calls advanced metrics 'box score fiction invented by people who never laced up.' He has the locker room's trust. You control the front office. Someone has to give.",
  scenarioInjections: [
    {
      requiredStatus: "analytics-forward",
      prependText: "You've already committed to analytics culture in this organization. This decision will determine whether that commitment holds under pressure — or collapses when it gets hard. ",
    },
    {
      requiredStatus: "coach-conflict",
      prependText: "Your relationship with the coaching staff is already strained from a previous disagreement. Another analytics-driven push could be the breaking point. Tread carefully. ",
    },
    {
      requiredStatus: "high-morale",
      prependText: "The locker room trusts you right now. Players are bought in. That capital is your shield if you need to make an uncomfortable call. ",
    },
    {
      requiredStatus: "star-retained",
      prependText: "Webb has publicly said he 'doesn't care about the numbers as long as we win.' He's a traditionalist. Any analytics push will need to be sold carefully to the locker room. ",
    },
  ],
  conceptId: "analytics",

  infoCards: [
    {
      title: "LINEUP DATA — ANALYTICS DEPT",
      content:
        "Bench lineup: Watts / Torres / Bell / Reyes / Crawford. Net rating: +12.4 per 100 possessions over 214 possessions. Offensive rating: 119.8 (league rank: 2nd). Defensive rating: 107.4 (league rank: 8th). Starting lineup net rating same period: +3.1. Model confidence: 94%. Sample size is statistically significant — this is not a small-sample anomaly.",
      revealDelay: 0,
    },
    {
      title: "COACH HILL'S POSITION",
      content:
        "Coach Hill in today's film session: 'I've been watching basketball for 30 years. I know what a good lineup looks like and I know what wins playoff games. This is a regular season lineup against bad defensive teams. Run it in the finals and see what happens.' He's not budging on his own. He needs a different kind of conversation.",
      revealDelay: 12,
    },
    {
      title: "PLAYER PERSPECTIVE",
      content:
        "Post-practice interview (two players, anonymized): Starting PG — 'If the numbers say that, the coaches should look at it. I want to win.' Starting SF — 'If I'm getting benched because of a computer I'm going to have a serious conversation with the front office.' The locker room is split.",
      revealDelay: 20,
    },
    {
      title: "ADVANCED BREAKDOWN — RESTRICTED",
      content:
        "Why the lineup works (model explanation): the bench unit creates 34% more corner-3 opportunities through off-ball movement. Opponents are forced to hedge on the pick-and-roll, opening driving lanes. The starting lineup's weakness: two non-shooters on the floor simultaneously collapses spacing. This is a structural roster issue, not a talent issue. The fix is rotation design, not player acquisition.",
      revealDelay: 24,
      roleOnly: "analytics",
    },
  ],

  roles: [
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You built the model. You know exactly why this lineup works.",
      privateInfo:
        "The +12.4 is real but here's what the report didn't fully explain: the bench lineup's advantage is almost entirely against teams ranked 20th or worse defensively. Against top-10 defenses, the net rating drops to +4.1 — still positive, but not dominant. If we're making a playoff argument for this lineup, we need to be honest: the edge compresses against elite defenses. I haven't told Coach Hill this yet because it complicates the pitch.",
    },
    {
      id: "gm",
      title: "GENERAL MANAGER",
      description: "You're the front office decision-maker. The coach works for you — technically.",
      privateInfo:
        "Coach Hill has 2 years left on his contract at $8M/year. If you override him and he resigns, you owe him $16M. If you fire him without cause, same $16M. The relationship with this coach is also a free agent selling point — two veterans signed here specifically because Hill was the coach. The analytics decision is also a personnel decision.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You manage the owner relationship and organizational culture.",
      privateInfo:
        "The owner called me last week. He read an article about analytics-forward franchises and asked: 'Are we falling behind?' He's not asking you to fire Coach Hill — he's asking whether the organization is modern. This is also a branding opportunity: 'data-driven front office' is a free agent pitch. How you handle this publicly matters as much as the decision itself.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You evaluate talent and know how the locker room actually thinks.",
      privateInfo:
        "I've been in locker rooms for 18 years. When the front office overrides the coaching staff on rotations, players don't see it as analytics-forward — they see it as chaos. Three veterans have told me privately they'd put 'organizational stability' on a list of reasons to stay or leave in free agency. Coach Hill's credibility with the roster is a real asset. If you undermine him on something as visible as rotations, you're trading his authority for a lineup edge.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The analytics team's report is on Coach Hill's desk. He's ignored it for two weeks. What do you do?",
      options: [
        {
          id: "trust-coach",
          label: "Trust the coach — keep current rotations",
          description: "The coach has rings. Back him publicly. Let the season play out.",
          tags: ["trust-coach", "culture-first"],
        },
        {
          id: "share-data",
          label: "Meet with Coach Hill — present the data, let him decide",
          description: "Sit down together, walk through the model, answer his questions. Empower him with information.",
          tags: ["share-data", "collaborative"],
        },
        {
          id: "mandate-changes",
          label: "Mandate the lineup change from the front office",
          description: "The data is clear. Issue a directive. The coach implements or he resigns.",
          tags: ["mandate-changes", "analytics-first"],
        },
        {
          id: "hire-bridge",
          label: "Hire an analytics translator — bring in a data-literate assistant coach",
          description: "Build a bridge between the analytics department and coaching staff without creating a power conflict.",
          tags: ["hire-bridge", "systemic"],
        },
      ],
    },
    {
      id: "terms-share",
      prompt: "Coach Hill sat through the presentation. His response: 'The numbers are interesting. But I'm not changing my rotation based on a regular season sample. Show me this works against a top-5 defense and then we'll talk.'",
      context: "The coach is engaging with the data but not convinced. He wants playoff-caliber evidence.",
      dependsOnRoundId: "direction",
      dependsOnTag: "share-data",
      options: [
        {
          id: "pilot-program",
          label: "Propose a pilot — run the lineup 8 minutes per game for 2 weeks",
          description: "Give the coach a structured test. Live data against real opponents.",
          tags: ["pilot-program", "evidence-based"],
        },
        {
          id: "deeper-analysis",
          label: "Pull the playoff-defense split data — show him the top-10 defense numbers",
          description: "Be transparent about the full picture, including where the edge shrinks. Build real trust.",
          tags: ["deeper-analysis", "transparent"],
        },
        {
          id: "push-harder",
          label: "Push harder — the regular season sample is sufficient",
          description: "The evidence is there. The coach is stalling. You need him to act now.",
          tags: ["push-harder", "analytics-first"],
        },
      ],
    },
    {
      id: "terms-mandate",
      prompt: "Coach Hill hears the directive. He calls a player meeting without telling you. Three starters emerge from the meeting and ask for a conversation with the front office.",
      context: "The mandate triggered a locker room response. The players want to be heard.",
      dependsOnRoundId: "direction",
      dependsOnTag: "mandate-changes",
      options: [
        {
          id: "meet-players",
          label: "Meet with the players — explain the data and the reasoning",
          description: "Transparency over authority. Show them the numbers. Earn their buy-in.",
          tags: ["meet-players", "transparent"],
        },
        {
          id: "hold-directive",
          label: "Hold the directive — Coach Hill implements or he's reassigned",
          description: "The front office decision stands. No negotiation with the roster over rotations.",
          tags: ["hold-directive", "authority"],
        },
        {
          id: "pull-back-mandate",
          label: "Pull back the mandate — revert to collaborative approach",
          description: "The blowback is too significant. Walk it back and restart the conversation with Coach Hill.",
          tags: ["pull-back-mandate", "de-escalate"],
        },
      ],
    },
    {
      id: "terms-bridge",
      prompt: "You've hired Dr. Keisha Morgan, a data scientist with 8 years of coaching experience. She meets with Coach Hill. He accepts her — but wants her role limited to 'consultation only, no rotation authority.'",
      context: "The bridge hire is in place. Now define the authority structure.",
      dependsOnRoundId: "direction",
      dependsOnTag: "hire-bridge",
      options: [
        {
          id: "consultation-only",
          label: "Accept consultation-only — let the relationship build organically",
          description: "Trust that good data presented well will earn influence over time.",
          tags: ["consultation-only", "patient"],
        },
        {
          id: "joint-authority",
          label: "Define joint authority — Morgan + Hill sign off on lineup decisions",
          description: "Formalize the structure. Both voices required. More friction, more accountability.",
          tags: ["joint-authority", "systemic"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["mandate-changes", "hire-bridge"],
    message:
      "LEAGUE NEWS: Golden State just published a report crediting their new 'analytics-first rotation system' for their 12-game win streak. The story is everywhere. Your owner texts you: 'This is exactly what we should be doing. Are we this advanced?' Coach Hill sees the story and calls it 'a publicity stunt.' The national media starts asking your players: 'Does your front office use analytics in rotations?'",
    responseRound: {
      id: "rival-response",
      prompt: "The media narrative is now about analytics adoption. How does your organization respond publicly?",
      options: [
        {
          id: "own-the-narrative",
          label: "Lean in — position the franchise as analytics-forward in media",
          description: "Use the moment. Announce your analytics investment publicly.",
          tags: ["own-the-narrative", "brand"],
        },
        {
          id: "stay-quiet",
          label: "Stay quiet — don't create pressure on the coach mid-season",
          description: "Internal decisions stay internal. Media narratives are distractions.",
          tags: ["stay-quiet", "culture-first"],
        },
        {
          id: "coach-leads-response",
          label: "Let Coach Hill respond publicly — his voice builds trust",
          description: "If he defends the analytical approach, it lands with more credibility than you saying it.",
          tags: ["coach-leads-response", "collaborative"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["trust-coach"],
      variants: [
        {
          probability: 0.40,
          label: "Coach Right — Team Wins",
          scoreΔ: 6,
          narrative:
            "Coach Hill's instincts held. The team finished .500 and made the play-in. Post-season review: the lineup data was accurate but the timing and integration mattered. The coach wasn't wrong to need time. Relationship preserved.",
          applyStatus: [],
        },
        {
          probability: 0.60,
          label: "Data Was Right — Opportunity Missed",
          scoreΔ: 3,
          narrative:
            "Finished 3 games below .500. The analytics team ran the counterfactual: the bench lineup, used properly, projects to 5-6 additional wins. That's the difference between a lottery pick and a playoff run. The data was right. You didn't act on it.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["share-data", "pilot-program"],
      variants: [
        {
          probability: 0.75,
          label: "Pilot Works — Coach Converts",
          scoreΔ: 9,
          narrative:
            "Two weeks, 8 minutes per game. The bench lineup went +16 net rating in live action against 6 opponents. Coach Hill called a staff meeting. 'I've been coaching this wrong.' By February it was a core rotation. Best of both worlds — his buy-in made it sustainable.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.25,
          label: "Pilot Fails — Coach Entrenched",
          scoreΔ: 5,
          narrative:
            "The pilot ran against three elite defenses. The net rating dropped to +2.1. Coach Hill called it immediately: 'I told you.' He's not wrong — the sample hit bad luck and tough opponents. The data is still right structurally, but you've lost the argument for now.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["share-data", "deeper-analysis"],
      variants: [
        {
          probability: 1.0,
          label: "Full Transparency — Earned Trust",
          scoreΔ: 9,
          narrative:
            "You showed him everything — including where the edge compresses against elite defenses. Coach Hill respected the honesty. 'You're not trying to sell me something.' He integrated the lineup selectively: full deployment against weaker defenses, conditional against playoff teams. Season win rate improved 11%. Relationship intact.",
          applyStatus: ["analytics-forward", "scout-trusted"],
        },
      ],
    },
    {
      roundTagCombo: ["share-data", "push-harder"],
      variants: [
        {
          probability: 0.50,
          label: "Coach Caves — Tension Remains",
          scoreΔ: 6,
          narrative:
            "He implemented under pressure. The lineup worked. He never fully trusted it. At the end of the season he told reporters: 'I follow directions.' He didn't re-sign. You lost a championship-caliber coach because you pushed too hard too fast.",
          applyStatus: ["coach-conflict"],
        },
        {
          probability: 0.50,
          label: "Coach Resigns Mid-Season",
          scoreΔ: 2,
          narrative:
            "He walked out in February. The assistant coach finished the season. The locker room fractured. Three free agents cited 'organizational instability' as a reason to look elsewhere in the summer. The lineup numbers were right. The approach was wrong.",
          applyStatus: ["coach-conflict", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["mandate-changes", "meet-players"],
      variants: [
        {
          probability: 0.60,
          label: "Players Understand — Culture Stabilizes",
          scoreΔ: 7,
          narrative:
            "The data meeting with players went well. The starting SF said: 'I didn't know the numbers were that significant.' Rotations adjusted. Coach Hill implemented reluctantly but professionally. The lineup produced. The relationship with the coach is strained but functional.",
          applyStatus: ["analytics-forward"],
        },
        {
          probability: 0.40,
          label: "Coach Resigns — Players Destabilized",
          scoreΔ: 3,
          narrative:
            "Coach Hill resigned the week after the player meeting. He told the press: 'The front office doesn't trust its coaches.' Three veteran players requested trade conversations. You implemented the lineup without the coach who built the culture around it.",
          applyStatus: ["coach-conflict", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["mandate-changes", "hold-directive"],
      variants: [
        {
          probability: 0.35,
          label: "Directive Holds — Coach Complies",
          scoreΔ: 7,
          narrative:
            "Coach Hill implemented the rotation. Barely. The locker room saw the tension. Results were positive on the floor. Two veterans opted out of extensions citing 'front office interference in basketball decisions.' The lineup worked. The culture cost was real.",
          applyStatus: ["analytics-forward", "coach-conflict"],
        },
        {
          probability: 0.65,
          label: "Coach Resigns — Organization Disrupted",
          scoreΔ: 2,
          narrative:
            "He was gone within the week. The team went 6-14 under the interim coach while absorbing the roster disruption. The analytics were right. The execution destroyed the season.",
          applyStatus: ["coach-conflict", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["hire-bridge", "consultation-only"],
      variants: [
        {
          probability: 0.70,
          label: "Bridge Hire — Slow Progress",
          scoreΔ: 7,
          narrative:
            "Dr. Morgan spent three months earning Coach Hill's trust. By mid-season she was in every staff meeting. The bench lineup was deployed in 60% of games by February. Sustainable, collaborative, and nobody quit. Sometimes the slow path is the right path.",
          applyStatus: ["analytics-forward"],
        },
        {
          probability: 0.30,
          label: "Bridge Hire — Limited Influence",
          scoreΔ: 5,
          narrative:
            "Consultation only meant consultation ignored. Coach Hill appreciated Dr. Morgan personally but changed almost nothing. The bench lineup got 3 minutes per game. Good hire, wrong authority structure.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["hire-bridge", "joint-authority"],
      variants: [
        {
          probability: 1.0,
          label: "Joint Authority — New Organizational Model",
          scoreΔ: 9,
          narrative:
            "Coach Hill balked at first — then saw it as distributed accountability, not surveillance. Dr. Morgan and Hill co-designed a rotation framework. The bench lineup ran 12 minutes per game in a structured deployment. Team finished 6th seed. Two free agents cited 'the most thoughtful coaching process I've ever been part of' as a reason to sign.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Decision Made",
        scoreΔ: 5,
        narrative: "The front office navigated the analytics-culture tension and moved forward.",
        applyStatus: [],
      },
    ],
  },
};

const matchupAdjust: Mission = {
  id: "matchup-adjust",
  missionNumber: 6,
  title: "Matchup Adjust",
  department: "MEDICAL BAY",
  tagline: "Franchise player showing fatigue signs.",
  scenario:
    "Your franchise player, DeShawn Morris — 24 years old, averaging 31.4 points on 38.2 minutes per game — is showing measurable fatigue signs. Fourth-quarter shooting: down 4.8% over the last 12 games. The medical team has flagged 'bilateral plantar fasciitis risk and soft tissue stress indicators' — not a confirmed injury, but a clear warning. Playoffs are 11 games away. The fanbase is selling out every game. The coach wants him on the floor. Morris himself says he's fine. What do you do?",
  scenarioInjections: [
    {
      requiredStatus: "star-retained",
      prependText: "Webb's long-term contract means you've already committed to building around a cornerstone player. A soft tissue injury now doesn't just end the season — it potentially ends your title window for two years. Every minute he plays carries franchise-level risk. ",
    },
    {
      requiredStatus: "coach-conflict",
      prependText: "Your relationship with the coaching staff is already strained. The coach has been vocal about 'trusting his players' and resents front office health mandates. A load management decision will be fought at every step. ",
    },
    {
      requiredStatus: "high-morale",
      prependText: "Team morale is excellent right now. The players trust the process. That goodwill gives you political cover to make an unpopular but smart call — if you use it. ",
    },
    {
      requiredStatus: "analytics-forward",
      prependText: "Your analytics culture has built credibility with the medical team. Their injury models have 94% accuracy on soft tissue risk at this usage level. The data is clear — the question is whether you act on it. ",
    },
  ],
  conceptId: "roster-health",

  infoCards: [
    {
      title: "MEDICAL TEAM ASSESSMENT",
      content:
        "Team physician Dr. Patel report: Morris is showing grade-1 plantar fasciitis indicators in both feet — common in high-minute players at this point in the season. Not a current injury. Estimated re-injury escalation risk if minutes remain at 38+: 34% probability of soft tissue strain before the end of the regular season. Recommended: reduce to 32-34 minutes per game immediately. Alternative: full rest for 4-5 games, then managed return.",
      revealDelay: 0,
    },
    {
      title: "PERFORMANCE METRICS — LAST 12 GAMES",
      content:
        "Q4 shooting: 43.1% (season avg: 47.9%). Vertical leap measurement (weekly tracking): down 3.1 inches vs. preseason baseline. First-step quickness (GPS tracking): down 7%. Points per shot attempt: down 0.8. None of these are injuries — but all of them are measurable degradation consistent with late-season fatigue in a high-minute player.",
      revealDelay: 12,
    },
    {
      title: "SEEDING STAKES",
      content:
        "Current standing: 4th seed, 1 game ahead of 5th. Remaining schedule: 6 home games, 5 road games (including 2 back-to-backs). The difference between 4th and 5th seed changes first-round opponent: 4th faces the 5-seed (easier), 5th faces the 4-seed (harder). Estimated win differential if Morris plays 32 vs. 38 minutes over remaining 11 games: -2.1 wins projected.",
      revealDelay: 20,
    },
    {
      title: "PLAYER PERSPECTIVE — RESTRICTED",
      content:
        "Morris told team physician off the record: 'I can feel it in my left foot. It's not bad enough to worry about but it's there.' He told Coach Hill publicly: 'I feel great, give me the minutes.' He's protecting his image as an iron man. His agent has called three times this week asking about the medical situation. The contract language: if Morris misses 20+ regular season games due to non-injury-related load management, the team owes a $3M bonus payment.",
      revealDelay: 24,
      roleOnly: "president",
    },
  ],

  roles: [
    {
      id: "physician",
      title: "TEAM PHYSICIAN",
      description: "You are responsible for player health and medical risk assessment.",
      privateInfo:
        "Plantar fasciitis that progresses from grade-1 to grade-2 during a playoff run is a career-altering injury, not a game-to-game issue. I've seen two franchise players miss entire playoff runs to this exact injury pathway. My recommendation is 32 minutes max and no back-to-backs. I cannot force this — but I can tell you the medical risk with complete clarity: at 38+ minutes per game, we are rolling the dice every night.",
    },
    {
      id: "coach",
      title: "HEAD COACH",
      description: "You manage game strategy and make in-game minute decisions.",
      privateInfo:
        "I've had this conversation with DeShawn. He says he's fine. My read: he's competing through discomfort, which is what franchise players do. What I know is this — if I reduce his minutes and we drop 2 seeds, the fanbase will crucify me. If I play him and he gets hurt, they'll say I should have listened to the doctors. Either way, I need the front office to make this call officially so it doesn't land on me alone. I need air cover.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You balance organizational risk, player relations, and ownership expectations.",
      privateInfo:
        "The $3M load management bonus clause is real. Morris's agent called it out specifically — if we sit him for load management reasons (not injury) for more than 20 games total this season, we owe $3M. We're at 14 games already this season. Sitting him for 5 games this stretch triggers the clause. We'd owe the bonus. I haven't told the coach this yet.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You model win probability and playoff projections.",
      privateInfo:
        "I've run the numbers both ways. At 38 min/game: 71% playoff appearance probability, but 34% injury-before-playoffs probability. Expected playoff wins at full health: 2.8 rounds. Expected playoff wins accounting for injury risk: 1.4 rounds. At 32 min/game: 58% playoff appearance probability, 94% arrive-healthy probability. Expected playoff wins: 2.4 rounds. The math slightly favors load management — but it's close enough that it genuinely depends on values, not just probability.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The medical team's recommendation is on your desk. What is your approach to Morris's workload for the final 11 games?",
      options: [
        {
          id: "hard-limit",
          label: "Hard 32-minute limit — protect the playoff body",
          description: "Formal directive: Morris plays no more than 32 minutes per game. Sit all back-to-backs. Doctor's recommendation followed exactly.",
          tags: ["hard-limit", "health-first"],
        },
        {
          id: "flexible-plan",
          label: "Flexible plan — 34-minute target, coach manages game-to-game",
          description: "Set a target, not a hard cap. Coach adjusts based on game situation and Morris's feel.",
          tags: ["flexible-plan", "collaborative"],
        },
        {
          id: "push-through",
          label: "Play through it — Morris says he's fine, trust the player",
          description: "Full minutes. Compete for seeding. Morris is a professional who knows his body.",
          tags: ["push-through", "win-now"],
        },
        {
          id: "full-rest",
          label: "Full rest — sit Morris for 4-5 games, manage return",
          description: "Maximum protection. Absorb the record hit now, arrive at playoffs completely healthy.",
          tags: ["full-rest", "long-term"],
        },
      ],
    },
    {
      id: "terms-hard-limit",
      prompt: "Coach Hill pushes back: 'If I sit him and we drop a seed, that's on me publicly. I need you to make this official and stand behind it.' Morris's agent calls and raises the load management bonus clause.",
      context: "The hard limit decision is creating downstream complications.",
      dependsOnRoundId: "direction",
      dependsOnTag: "hard-limit",
      options: [
        {
          id: "public-announcement",
          label: "Make it official — announce the load management protocol publicly",
          description: "Take it off the coach's back. Front office owns the decision publicly.",
          tags: ["public-announcement", "transparent"],
        },
        {
          id: "pay-bonus",
          label: "Pay the $3M bonus — player wellness over contract language",
          description: "Honor the clause, protect the player, move forward without ambiguity.",
          tags: ["pay-bonus", "player-first"],
        },
        {
          id: "reclassify-rest",
          label: "Classify rest days as minor injury management — avoid bonus trigger",
          description: "Document the plantar fasciitis findings as the medical basis. Stays under the clause threshold.",
          tags: ["reclassify-rest", "strategic"],
        },
      ],
    },
    {
      id: "terms-push",
      prompt: "Game 8 of the remaining 11: Morris comes off the floor after Q3 limping. Medical staff confirms grade-2 plantar fasciitis progression. He can play — it's not a rupture — but every game increases the rupture risk.",
      context: "The injury path the medical team warned about is materializing.",
      dependsOnRoundId: "direction",
      dependsOnTag: "push-through",
      options: [
        {
          id: "shut-down-now",
          label: "Shut him down immediately — playoffs are all that matters",
          description: "Stop here. Protect him for the postseason. Accept the regular season consequences.",
          tags: ["shut-down-now", "health-first"],
        },
        {
          id: "game-time-decisions",
          label: "Game-time decisions — Morris and physician decide each night",
          description: "No blanket shutdown. Evaluate each game individually.",
          tags: ["game-time-decisions", "flexible"],
        },
        {
          id: "push-to-end",
          label: "Push through the last 3 games — playoffs start next week",
          description: "Three games left. He knows the risk. Let the franchise player make the call.",
          tags: ["push-to-end", "high-risk"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["push-through", "flexible-plan"],
    message:
      "RIVAL MOVE: The Boston Celtics just announced a league-leading load management policy — their star plays 30 minutes max for the last 10 games of every regular season, regardless of seeding stakes. Sports media is praising it. Your local beat reporter asks you directly: 'Your player is showing fatigue signs. Why isn't he being managed like Boston's star?' The question is now public.",
    responseRound: {
      id: "rival-response",
      prompt: "The load management question is now a public narrative. How do you respond?",
      options: [
        {
          id: "address-directly",
          label: "Address it directly — announce a modified plan publicly",
          description: "Take control of the narrative. Announce a plan today.",
          tags: ["address-directly", "transparent"],
        },
        {
          id: "no-comment",
          label: "No comment — player health decisions are private",
          description: "Don't engage. The media will move on.",
          tags: ["no-comment", "private"],
        },
        {
          id: "coach-statement",
          label: "Coach Hill makes a statement — 'DeShawn and I decide together'",
          description: "Let the coach handle the public question. Takes pressure off the front office.",
          tags: ["coach-statement", "delegated"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["hard-limit", "public-announcement"],
      variants: [
        {
          probability: 0.75,
          label: "Load Managed — Healthy Playoff Arrival",
          scoreΔ: 9,
          narrative:
            "The announcement landed well. Fans respected the transparency. Morris dropped from 4th to 5th seed — faced a harder first-round opponent. He arrived in the playoffs at full health and averaged 34 points over 5 games. They won the series. The decision held.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.25,
          label: "Load Managed — Seeding Cost Was Real",
          scoreΔ: 6,
          narrative:
            "Dropped to the 5th seed. Drew the 4-seed in round 1 — a team with a dominant center. Morris was healthy, but they lost in 5. The counterfactual will haunt the off-season: would the 4th seed matchup have been easier? Probably.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["hard-limit", "reclassify-rest"],
      variants: [
        {
          probability: 0.80,
          label: "Medical Classification — Smooth Execution",
          scoreΔ: 8,
          narrative:
            "The plantar fasciitis documentation was legitimate — it was a real medical finding. Classifying rest days under the medical framework was accurate and defensible. The bonus clause didn't trigger. Morris arrived healthy. No agent dispute.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.20,
          label: "Agent Disputes Classification",
          scoreΔ: 5,
          narrative:
            "Morris's agent reviewed the documentation and argued the classification was strategic, not purely medical. Filed a grievance. It resolved in the team's favor — the fasciitis was real — but the process created friction with Morris going into a contract year.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["flexible-plan"],
      variants: [
        {
          probability: 0.60,
          label: "Flexible Plan — Coach Executed Well",
          scoreΔ: 8,
          narrative:
            "Coach Hill averaged Morris at 33.4 minutes over the last 11 games. Sat him both back-to-backs. Maintained the 4th seed. Morris entered the playoffs at 96% health by physician assessment. The flexibility gave the coach authority and produced the right outcome.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.40,
          label: "Flexible Plan — Coach Played Him Too Much",
          scoreΔ: 5,
          narrative:
            "The flexible target became a floor, not a ceiling. Morris averaged 36.1 minutes because the coach couldn't bring himself to bench the star in close games. Fasciitis worsened. He played in the playoffs but was clearly limited in rounds 1 and 2.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["push-through", "shut-down-now"],
      variants: [
        {
          probability: 0.70,
          label: "Course Corrected — Playoff Arrival Safe",
          scoreΔ: 7,
          narrative:
            "The grade-2 diagnosis was the wake-up call. Three games rest before the playoffs. Morris arrived at 91% — not 100%, but stable. First-round win. The injury scare changed the organization's approach to load management permanently.",
          applyStatus: [],
        },
        {
          probability: 0.30,
          label: "Too Late — Grade-3 Risk in Round 1",
          scoreΔ: 3,
          narrative:
            "Three games rest helped but wasn't enough. The grade-2 fasciitis progressed during Game 3 of the first round. He finished the game — but missed Game 4 and 5. Out in the first round.",
          applyStatus: ["rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["push-through", "push-to-end"],
      variants: [
        {
          probability: 0.30,
          label: "Survived — Lucky",
          scoreΔ: 5,
          narrative:
            "He played through it. Grade-2 held. Made it to the playoffs. Won the first round. The medial physician was right about the risk — you got lucky. Morris knows what he put his body through. This conversation will come up in every future contract negotiation.",
          applyStatus: [],
        },
        {
          probability: 0.70,
          label: "Grade-3 Rupture — Season Over",
          scoreΔ: 1,
          narrative:
            "Game 9. Routine drive to the basket — he went down. Plantar fascia rupture. Season over. The medical team's risk assessment was accurate: 34% regular season injury probability given continued high minutes. You were in that 34%.",
          applyStatus: ["rebuild-mode", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["full-rest"],
      variants: [
        {
          probability: 0.80,
          label: "Full Rest — Playoffs at 100%",
          scoreΔ: 8,
          narrative:
            "Sat 5 games. Team went 2-3 without him — dropped to the 5th seed. Morris returned for the last 6, building rhythm. Entered the playoffs fully healthy. Averaged 36 points over 4 playoff games. The record cost was real; the playoff payoff was real too.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.20,
          label: "Full Rest — Missed Playoffs",
          scoreΔ: 3,
          narrative:
            "The 5-game absence cost more seeds than projected. Team finished 9th — out of the play-in. Morris was 100% healthy for a lottery finish. The medical decision was correct. The timing was catastrophic.",
          applyStatus: [],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Decision Made",
        scoreΔ: 5,
        narrative: "The front office made a health management call. Results follow.",
        applyStatus: [],
      },
    ],
  },
};

const draftTable: Mission = {
  id: "draft-table",
  missionNumber: 7,
  title: "Draft Table",
  department: "DRAFT WAR ROOM",
  tagline: "10 minutes on the clock at #6.",
  scenario:
    "It's draft night. You hold the #6 pick. The war room is split. Your scouting department loves Mateo Silva — a 19-year-old Brazilian wing who spent two years in the Euroleague. Polished, NBA-ready, professional, ceiling probably a 15-ppg starter. Your analytics model, with 94% confidence, projects Damien Cole — a 20-year-old guard from a mid-major — as a top-15 player by Year 3. Scouts rank Cole #14. The model ranks him #4. You have 10 minutes before you're on the clock. One bad pick at #6 can define a franchise for a decade.",
  scenarioInjections: [
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're in rebuild mode. This pick is your centerpiece — not a complement to a star, but the foundation you're building from. The wrong choice here sets the rebuild back three years. ",
    },
    {
      requiredStatus: "analytics-forward",
      prependText: "Your analytics culture has established credibility. The model's track record is strong. The question isn't whether to trust data — it's how much you trust it under Draft Night pressure. ",
    },
    {
      requiredStatus: "trade-assets-rich",
      prependText: "You have draft capital stockpiled. A trade-up or trade-down is genuinely on the table — you're not forced to stay at #6. Other teams are calling. ",
    },
    {
      requiredStatus: "star-retained",
      prependText: "With Webb locked in, this pick needs to complement an established star — not become one independently. Fit matters as much as ceiling. ",
    },
  ],
  conceptId: "rookie-scale",

  infoCards: [
    {
      title: "SCOUTING REPORT — MATEO SILVA (#6 CONSENSUS)",
      content:
        "Age: 19. Euroleague stats: 16.2 pts, 5.8 reb, 2.1 ast on 47% FG. NBA comparison: defensive-minded 3-and-D wing with legitimate All-Defense upside. Three NBA scouts independently listed him as their #5-7 prospect. Medical clearance: clean. Character: high — disciplined, team-first, professional. Ceiling: 15-17 ppg starter, defensive anchor. Floor: rotation player. Probability of becoming an All-Star: 12%. Probability of 10+ year NBA career: 88%.",
      revealDelay: 0,
    },
    {
      title: "ANALYTICS REPORT — DAMIEN COLE (MODEL RANK #4)",
      content:
        "Age: 20. Mid-major stats: 28.4 pts, 6.1 ast, 47.2% FG, 41.8% 3P on 7.4 attempts. Model inputs: shot quality (95th percentile), off-ball movement efficiency (97th percentile), pick-and-roll decision-making (91st percentile). Model output: 94% confidence in top-15 player by Year 3. Scout consensus rank: #14. Sample-size note: mid-major competition is a significant limitation — model adjusts, but uncertainty range is wide.",
      revealDelay: 12,
    },
    {
      title: "TRADE OFFER — LIVE",
      content:
        "Memphis just called: they'll give us #12 + their 2026 first-round pick (top-8 protected) for #6. That's two lottery-range assets instead of one. If we trade down to #12, both Cole and Silva will be available. If we stay at #6, we control the pick but lose the extra asset.",
      revealDelay: 20,
    },
    {
      title: "CONTRACT SCALE — FOR YOUR REFERENCE",
      content:
        "Rookie scale at #6: Year 1 base ~$9.8M (120% of scale), Years 2-3 escalate ~8%/year. Team controls Years 1-4 via standard rookie scale. Team option in Year 3 and Year 4. Max rookie extension eligibility at Year 4 completion. Cost-controlled talent for 4 years. A franchise cornerstone pick here is the most efficient salary spend in basketball.",
      revealDelay: 24,
      roleOnly: "capologist",
    },
  ],

  roles: [
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You've seen Cole and Silva play in person. You trust your eyes.",
      privateInfo:
        "I've watched Cole 12 times this year. The production is real — but mid-major competition is a legitimate concern. Three of his top 20 games came against teams that are D-League level defensively. When we arranged an elite-level workout, his quickness against NBA-caliber defenders dropped noticeably. I still think he's a good player — I just don't think he's top-5 in this draft. The analytics model didn't watch those workouts. I did.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You built the player projection model. You understand what the data says.",
      privateInfo:
        "The Cole model output is our strongest recommendation in three years. The shot quality and off-ball efficiency metrics are consistent across every level of competition we can measure — those skills transfer. The mid-major concern is real but overstated: our model adjusts for competition level. What I can't model is a prospect's response to NBA pressure, coaching systems, and injury. Those are human variables. The model says Cole — but someone in that room has to own the non-model risks.",
    },
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You manage the salary cap. Draft picks are your best cost-controlled assets.",
      privateInfo:
        "The Memphis trade offer is the most interesting part of this decision. If we trade to #12 and Cole is still there, we pick him AND keep the Memphis 2026 first. Two assets instead of one at essentially the same cost. The risk: Cole gets taken before 12. Teams with picks at 7, 9, and 11 are all potential Cole suitors if word gets out that our model likes him. The trade window closes when we're on the clock.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You interface with ownership and manage the franchise's long-term direction.",
      privateInfo:
        "The owner told me before the draft: 'I want a player the fans will love. I don't want another rotation player.' That rules out the safe ceiling of Mateo Silva in his mind. He's read about Cole — the analytics darling narrative. He wants the bold pick. But if Cole is a bust, the owner's instinct will be to blame the analytics team, not himself. That's the political reality. The bold pick needs to be the right bold pick.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "You have 10 minutes. The war room is waiting. What is your draft strategy?",
      options: [
        {
          id: "take-silva",
          label: "Take Mateo Silva at #6 — scout consensus, NBA-ready",
          description: "Trust the scouts. 88% chance of a 10-year career. Reliable, professional, proven at a high level.",
          tags: ["take-silva", "scout-consensus"],
        },
        {
          id: "take-cole",
          label: "Take Damien Cole at #6 — trust the model",
          description: "The analytics case is the strongest we've had in years. High variance but top-15 upside.",
          tags: ["take-cole", "analytics-pick"],
        },
        {
          id: "trade-down",
          label: "Accept Memphis's trade — #12 + protected 2026 first",
          description: "Two assets instead of one. Gamble that Cole or Silva will still be there at 12.",
          tags: ["trade-down", "asset-accumulation"],
        },
        {
          id: "trade-up",
          label: "Call teams 1-5 — try to move up for Cole",
          description: "If the model is right, Cole at #6 is already a steal. Moving up to #3-4 locks him in.",
          tags: ["trade-up", "aggressive"],
        },
      ],
    },
    {
      id: "terms-cole",
      prompt: "The analytics team presents one more data point: Cole's 3-point percentage this year came almost entirely from the left corner — 89 of his 143 made threes. His shot chart shows a weak right-wing number (31%). Is this a flaw or a fixable habit?",
      context: "Your analytics lead has flagged a shot chart pattern just before the pick.",
      dependsOnRoundId: "direction",
      dependsOnTag: "take-cole",
      options: [
        {
          id: "proceed-cole",
          label: "Proceed — the shot chart pattern is fixable with NBA coaching",
          description: "The model accounts for this. Skill refinement is part of development. Take Cole.",
          tags: ["proceed-cole", "analytics-trust"],
        },
        {
          id: "pivot-silva",
          label: "Last-second pivot — take Silva instead",
          description: "The shot chart pattern changes your confidence. Lock in the safer pick.",
          tags: ["pivot-silva", "scout-deference"],
        },
        {
          id: "call-trade-now",
          label: "Call Memphis now — trade to #12 with this new info",
          description: "New information changes the calculus. Take the two assets, evaluate at 12.",
          tags: ["call-trade-now", "asset-accumulation"],
        },
      ],
    },
    {
      id: "terms-trade",
      prompt: "Memphis accepts. You're now at #12. Cole is still on the board — but so are two other teams between you and Cole (picks 10 and 11). Both teams are reportedly interested in guards.",
      context: "You traded down. Cole is available but potentially not for long.",
      dependsOnRoundId: "direction",
      dependsOnTag: "trade-down",
      options: [
        {
          id: "take-cole-at-12",
          label: "Take Cole at #12 — the model still says take him",
          description: "If he's there at 12, it means everyone passed. Or everyone's wrong. Take him.",
          tags: ["take-cole-at-12", "analytics-pick"],
        },
        {
          id: "take-silva-at-12",
          label: "Take Silva at #12 — he's probably still there and the value holds",
          description: "Safe pick at lower cost. Three assets in the vault (Silva + Memphis 2026 first).",
          tags: ["take-silva-at-12", "scout-consensus"],
        },
        {
          id: "best-available",
          label: "Best available at #12 — whoever the board says at that moment",
          description: "Trust the big board. Don't force either player — take the best value at that pick.",
          tags: ["best-available", "disciplined"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["take-cole", "trade-up"],
    message:
      "WAR ROOM ALERT: Golden State just moved up to #5 — one pick ahead of you. Our intel: they're targeting Cole. You have 6 minutes left on the clock and Golden State is filing the trade paperwork now. If Cole is their target, he's gone before you pick.",
    responseRound: {
      id: "rival-response",
      prompt: "Golden State is at #5 and may be targeting Cole. How do you respond?",
      options: [
        {
          id: "call-gs-bluff",
          label: "Call it a bluff — stay at #6, trust Cole will be there",
          description: "GMs create smoke. Golden State needed a different position. Stay calm.",
          tags: ["call-gs-bluff", "composed"],
        },
        {
          id: "emergency-trade-up",
          label: "Emergency call to #4 — offer our 2026 first to jump Golden State",
          description: "If Cole is worth #4, that's still a steal at the model's valuation.",
          tags: ["emergency-trade-up", "aggressive"],
        },
        {
          id: "pivot-silva-gs",
          label: "Pivot to Silva — Cole risk is now even higher",
          description: "If Golden State wants Cole, either they know something we don't, or the pick gets more expensive to move up for. Take Silva at 6.",
          tags: ["pivot-silva-gs", "risk-averse"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["take-silva"],
      variants: [
        {
          probability: 0.80,
          label: "Silva — Reliable Starter",
          scoreΔ: 7,
          narrative:
            "Year 1: 11 points, 4 rebounds, solid defense. Year 2: earned a starting spot. Year 3: 15 points, 2nd-team All-Defense. Exactly what the scouts projected. Cole went #9 — averaged 22 in Year 3 and made the All-Star team. The safe pick was good. The model was also right.",
          applyStatus: ["scout-trusted"],
        },
        {
          probability: 0.20,
          label: "Silva — Injury Derails Trajectory",
          scoreΔ: 4,
          narrative:
            "ACL in Year 2. He came back in Year 3 but wasn't the same player. The scouts were right about his profile — the injury risk they couldn't project was the variable that mattered. Cole, taken at #9, averaged 24 in Year 3.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["take-cole", "proceed-cole"],
      variants: [
        {
          probability: 0.60,
          label: "Model Right — Cole Becomes a Star",
          scoreΔ: 10,
          narrative:
            "Year 1: 16 points, learning the system. Year 2: 22 points, 7 assists, first All-Star selection. The shot chart flaw was corrected by November. The model was right. The scouts will recalibrate. This pick defines the franchise for a decade.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.40,
          label: "Model Miss — Cole Averages Out",
          scoreΔ: 4,
          narrative:
            "The shot chart issue wasn't fixable. The right-wing jumper never developed. He's a solid 16-ppg player — not a bust, not a star. The scouts' range of outcomes was more accurate than the model's top-15 projection. Silva, taken at #9 by Memphis, made his first All-Star game in Year 3.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["take-cole", "pivot-silva"],
      variants: [
        {
          probability: 0.75,
          label: "Silva — Last-Second Wisdom",
          scoreΔ: 7,
          narrative:
            "You pivoted at the last second. Silva went out and proved the scouts right. Cole, taken at #11, developed into a very good player — but the shot chart concern proved real, and his ceiling was 18 ppg, not top-15. Your pivot may have been right.",
          applyStatus: ["scout-trusted"],
        },
        {
          probability: 0.25,
          label: "Model Was Right — Regret Follows",
          scoreΔ: 3,
          narrative:
            "Cole became an All-Star at #11. The shot chart concern that triggered the pivot was fixed by his NBA shooting coach in October. You watched him develop every year from the bench. The model had it right.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["trade-down", "take-cole-at-12"],
      variants: [
        {
          probability: 0.55,
          label: "Cole at #12 — Two Assets Plus a Star",
          scoreΔ: 10,
          narrative:
            "Cole fell to 12. The model was validated. Year 3 All-Star. You also have the Memphis 2026 first, which landed top 8 and hit the protection. Two real assets in the vault. This is how you build a dynasty.",
          applyStatus: ["analytics-forward", "trade-assets-rich"],
        },
        {
          probability: 0.45,
          label: "Cole Gone Before #12",
          scoreΔ: 5,
          narrative:
            "Portland took Cole at #10. You ended up with your best available at 12 — a solid pick, not a star. Memphis first is still in the vault. You got two solid assets for the price of giving up a potential franchise pick.",
          applyStatus: ["trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["trade-down", "take-silva-at-12"],
      variants: [
        {
          probability: 1.0,
          label: "Silva at #12 — Three Assets Total",
          scoreΔ: 8,
          narrative:
            "Silva was still there at 12. You got him at a discount and kept the Memphis future first. Three assets total (Silva + Memphis 2026 first that you already had). A solid rebuilding haul. Silva becomes a starter. The future first hits at pick 7.",
          applyStatus: ["trade-assets-rich", "scout-trusted"],
        },
      ],
    },
    {
      roundTagCombo: ["trade-up", "emergency-trade-up"],
      variants: [
        {
          probability: 0.70,
          label: "Moved Up — Secured Cole",
          scoreΔ: 9,
          narrative:
            "The move to #4 worked. Cole went to you. Golden State had been targeting a center at #5 — the Cole bluff was real. You gave up a future first but secured the model's top target. Year 3 All-Star. The cost was real but proportionate.",
          applyStatus: ["analytics-forward"],
        },
        {
          probability: 0.30,
          label: "Moved Up — Cole Wasn't Golden State's Target",
          scoreΔ: 6,
          narrative:
            "Golden State took a center. Cole would have been there at #6. You paid a future first to jump one spot unnecessarily. Cole became a star — the pick was right, the execution cost extra.",
          applyStatus: ["analytics-forward"],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Pick Made",
        scoreΔ: 6,
        narrative: "The clock ran out. The pick was filed. The draft room waits for the result.",
        applyStatus: [],
      },
    ],
  },
};

const finalGmCall: Mission = {
  id: "final-gm-call",
  missionNumber: 8,
  title: "Final GM Call",
  department: "OWNERSHIP SUITE",
  tagline: "The owner wants your three-year plan.",
  scenario:
    "End of season. The owner has called a private meeting in the Ownership Suite. Your team narrowly missed the playoffs — lost the final play-in game by 4 points. You have one All-Star under contract (2 years remaining), two first-round picks in your vault, and a 14-man roster with 4 rotation-caliber players. The league is in transition — 7 of the last 10 finalists were built through analytics-forward drafting, not star free agency. The owner asks: 'Give me your three-year vision. What does this franchise look like in Year 3?' Your answer defines everything — staff, philosophy, budget, and your own job security.",
  scenarioInjections: [
    {
      requiredStatus: "star-retained",
      prependText: "Webb's contract — the deal you made in the Cap Room — is the north star of your three-year plan. Every decision flows from protecting and building around him. The owner knows what you have. Now he wants to know what you do with it. ",
    },
    {
      requiredStatus: "analytics-forward",
      prependText: "You've built an analytics culture inside this organization. Your data infrastructure, your model-driven decisions, your coaching philosophy — it's all on the line in this room. Defend it or evolve it. ",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You gave up stars for assets. You traded short-term performance for long-term equity. Now you have to show the owner the rebuild is working — and that you have a clear path to the other side. ",
    },
    {
      requiredStatus: "over-luxury-tax",
      prependText: "The luxury tax bills have been real. The owner has paid them. Now he's asking whether it was worth it — and whether you have a plan to avoid the repeater penalties that loom. ",
    },
    {
      requiredStatus: "coach-conflict",
      prependText: "The friction with the coaching staff has leaked into the press. The owner is aware of it. He's going to ask about it, directly or indirectly. You need a position on leadership stability. ",
    },
    {
      requiredStatus: "high-morale",
      prependText: "Player morale has been a strength under your tenure. The locker room trusts you. That culture is a real asset the owner can see in practice — use it as evidence of your leadership. ",
    },
  ],
  conceptId: "front-office-philosophy",

  infoCards: [
    {
      title: "FRANCHISE ASSET INVENTORY",
      content:
        "Under contract: Marcus Webb (All-Star PG, 2 years/$48M remaining). Picks: own 2026 first (top-4 protected) + Memphis 2026 first (unprotected). Cap space: $8M available below the tax line. Young players on rookie deals: 2 rotation-caliber, 2 developmental. Current payroll: $148M. Luxury tax line: $171M. You have $23M of tax headroom for free agent additions.",
      revealDelay: 0,
    },
    {
      title: "LEAGUE LANDSCAPE",
      content:
        "Last 10 Finals participants — how they were built: 7 via analytics-forward drafting and development; 2 via superstar free agency (both required 3+ years of prior rebuilding to have cap space); 1 via trade (assets accumulated over 4 years of rebuild). The era of 'star free agency as primary strategy' has a 20% success rate in the current CBA. The era of 'draft and develop' has a 70% Finals appearance rate when executed with patience.",
      revealDelay: 12,
    },
    {
      title: "OWNER'S STATED PRIORITIES",
      content:
        "Owner's opening statement: '1. I want a playoff team every year Webb is here — that's the non-negotiable. 2. I want to understand how decisions are made in this building — analytics, scouting, both? 3. I want a plan that doesn't blow up if one thing goes wrong.' He did not mention a spending ceiling in this meeting. That's notable.",
      revealDelay: 20,
    },
    {
      title: "COMPETITIVE INTELLIGENCE — RESTRICTED",
      content:
        "Two rival GMs have been given permission to pursue Webb in a sign-and-trade when his contract expires. One has a war chest of 3 future firsts. Our leverage: we're the only team that can offer him a supermax extension — $47.6M/year — before he hits free agency. If we extend Webb now at supermax, we control his career for 5 more years. If we let him reach free agency, we lose that leverage permanently. The owner doesn't know the extension window closes in 60 days.",
      revealDelay: 24,
      roleOnly: "president",
    },
  ],

  roles: [
    {
      id: "gm",
      title: "GENERAL MANAGER",
      description: "This is your vision. You're presenting to the owner.",
      privateInfo:
        "Here's what I know that the owner doesn't: my job security is directly tied to Year 1 performance, not Year 3. If I pitch a rebuild, I'm likely gone in Year 2 when we're at the bottom of the standings — even if the rebuild is the right call. My incentive is to pitch 'win now' even if the long-term answer is patience. I need to be honest with myself about whether my plan serves the franchise or my contract.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You have the owner's long-term trust. You're in this meeting to support or challenge the GM.",
      privateInfo:
        "The Webb supermax window closes in 60 days. If the GM's three-year plan involves Webb leaving or being traded, we need to have that conversation with the owner today — not in 61 days when the option is gone. Whatever vision the GM pitches, the Webb extension question has to be answered as part of this meeting.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You model long-term competitive outcomes.",
      privateInfo:
        "I've run three-year playoff probability models for each strategic path. Rebuild path (trade Webb, accumulate assets): 18% Year 1 playoff, 45% Year 2, 72% Year 3. Hybrid path (extend Webb, add analytics-sourced players): 62% Year 1, 68% Year 2, 71% Year 3. Win-now path (trade picks for veterans): 74% Year 1, 52% Year 2, 31% Year 3. The hybrid path has the most consistent floor. The win-now path wins the first year and deteriorates. The rebuild path is painful but lands in the same place as hybrid by Year 3.",
    },
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You model the financial implications of each path.",
      privateInfo:
        "The rebuild path generates $40M+ in cap flexibility by Year 2 — enough to pursue any free agent in the league. The hybrid path keeps us in the luxury tax vicinity but preserves Webb's prime years. The win-now path crosses the Second Apron in Year 1 if we pursue veterans with our picks — which eliminates our ability to aggregate future trades. Financially, win-now is the most expensive path and the least recoverable if it fails.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The owner is waiting for your three-year vision. What is your answer?",
      options: [
        {
          id: "controlled-rebuild",
          label: "Controlled rebuild — accumulate assets, compete in Year 3",
          description: "Trade picks for veterans? No. Build through the draft, clear bad contracts, let the young core lead. Competitive by Year 3.",
          tags: ["controlled-rebuild", "patient"],
          mutations: [
            {
              ifStatus: "rebuild-mode",
              labelSuffix: " ★ HONOR YOUR PATH",
              descriptionPrefix: "You've already made the hard trades to get here. Staying the course is the honest answer. ",
            },
            {
              ifStatus: "star-retained",
              descriptionPrefix: "NOTE: A rebuild vision is hard to square with Webb's prime years still on the books. You'll need to address the contradiction. ",
            },
          ],
        },
        {
          id: "hybrid-build",
          label: "Hybrid — extend Webb, add analytics-sourced players via draft",
          description: "Keep Webb, use the picks intelligently, invest in a modern analytics infrastructure. Compete every year.",
          tags: ["hybrid-build", "balanced"],
          mutations: [
            {
              ifStatus: "star-retained",
              labelSuffix: " ★ CONTINUITY PLAY",
              descriptionPrefix: "You built around Webb in the Cap Room. Now you complete the picture around him. This is the natural continuation of that bet. ",
            },
            {
              ifStatus: "analytics-forward",
              descriptionPrefix: "Your analytics culture is already in place. This path is the fullest expression of everything you've built. ",
            },
          ],
        },
        {
          id: "win-now",
          label: "Win now — max free agent pursuit, trade picks for veterans",
          description: "Go all-in while Webb is in his prime. Trade the picks. Sign a max free agent. Year 1 contention.",
          tags: ["win-now", "aggressive"],
          mutations: [
            {
              ifStatus: "over-luxury-tax",
              labelSuffix: " ⚠ CAP CONSTRAINTS",
              descriptionPrefix: "WARNING: You're already over the luxury tax. Going all-in means crossing into Second Apron territory — you lose future trade flexibility permanently. ",
            },
            {
              ifStatus: "star-retained",
              labelSuffix: " ★ STRIKE WHILE WEBB IS PRIME",
              descriptionPrefix: "Webb's window is open. This is the case for urgency. Use his prime years now. ",
            },
            {
              ifStatus: "trade-assets-rich",
              descriptionPrefix: "You have pick capital to spend. The win-now path has actual fuel behind it this time. ",
            },
          ],
        },
        {
          id: "analytics-transformation",
          label: "Full analytics transformation — rebuild decision-making from the ground up",
          description: "Invest in analytics infrastructure as the primary competitive advantage. Fewer emotions, more models.",
          tags: ["analytics-transformation", "systemic"],
          mutations: [
            {
              ifStatus: "analytics-forward",
              labelSuffix: " ★ DOUBLE DOWN",
              descriptionPrefix: "You've already been moving in this direction. This is the full commitment — no hedging. ",
            },
            {
              ifStatus: "coach-conflict",
              descriptionPrefix: "NOTE: A full analytics transformation will require resolving the coaching friction first. The two visions are incompatible. ",
            },
          ],
        },
      ],
    },
    {
      id: "terms-rebuild",
      prompt: "The owner responds: 'A rebuild means Webb walks when his contract is up. He's the face of this franchise. How do you retain him or replace him?' The president flags: the supermax extension window closes in 60 days.",
      context: "The rebuild vision has a Webb-shaped problem.",
      dependsOnRoundId: "direction",
      dependsOnTag: "controlled-rebuild",
      options: [
        {
          id: "extend-webb-rebuild",
          label: "Extend Webb now — rebuild around him as the core",
          description: "Supermax extension before the window closes. He's the rebuild anchor. Build the roster around him.",
          tags: ["extend-webb-rebuild", "star-anchor"],
        },
        {
          id: "trade-webb",
          label: "Trade Webb — maximum asset return, full rebuild",
          description: "If you're rebuilding, get assets for Webb before he hits free agency and walks for nothing.",
          tags: ["trade-webb", "full-rebuild"],
        },
        {
          id: "let-window-close",
          label: "Let the extension window close — negotiate as a free agent",
          description: "No supermax. Negotiate a market deal when he's a free agent. Retain cap flexibility.",
          tags: ["let-window-close", "cap-flexibility"],
        },
      ],
    },
    {
      id: "terms-hybrid",
      prompt: "The owner asks: 'What does the analytics investment look like specifically? Are we replacing scouts or adding to them?' You need to define the model.",
      context: "The hybrid vision requires defining the organizational structure.",
      dependsOnRoundId: "direction",
      dependsOnTag: "hybrid-build",
      options: [
        {
          id: "analytics-plus-scouts",
          label: "Analytics and scouting together — parallel tracks, equal authority",
          description: "Two inputs, no hierarchy. Both have veto power on major decisions. Conflict is productive.",
          tags: ["analytics-plus-scouts", "dual-model"],
        },
        {
          id: "analytics-primary",
          label: "Analytics as primary — scouts as context layer",
          description: "Model makes the call. Scouts add qualitative nuance. Analytics leads all major decisions.",
          tags: ["analytics-primary", "data-driven"],
        },
        {
          id: "scouts-primary",
          label: "Scouts as primary — analytics as verification",
          description: "Traditional evaluation leads. Analytics validates or challenges. Human judgement at the center.",
          tags: ["scouts-primary", "traditional"],
        },
      ],
    },
    {
      id: "terms-win-now",
      prompt: "The capologist flags: trading both picks + pursuing a max free agent puts you over the Second Apron in Year 1. You lose aggregation rights for 3 years. The analytics lead's model shows a 31% playoff probability by Year 3 on this path.",
      context: "The win-now vision has serious long-term structural costs.",
      dependsOnRoundId: "direction",
      dependsOnTag: "win-now",
      options: [
        {
          id: "accept-second-apron",
          label: "Accept the Second Apron — win now is the mandate",
          description: "The owner said playoffs every year Webb is here. That's the priority. Execute the plan.",
          tags: ["accept-second-apron", "short-term"],
        },
        {
          id: "modify-win-now",
          label: "Modify the plan — trade one pick, keep the other",
          description: "Half-measure. Stay off the Second Apron. Less immediate firepower but some future preserved.",
          tags: ["modify-win-now", "balanced"],
        },
        {
          id: "pivot-from-win-now",
          label: "Pivot — the capologist's math changed your mind",
          description: "You present a modified hybrid vision. The win-now path is too expensive for too short a window.",
          tags: ["pivot-from-win-now", "analytical"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["win-now", "hybrid-build"],
    message:
      "LEAGUE NEWS: Boston just completed a blockbuster sign-and-trade, landing a second max player — their core is locked for 5 years. Three other top-8 teams have made significant off-season moves. Your local beat reporter publishes: 'While rivals improve, [Your Franchise] is still searching for a three-year direction.' The owner forwards you the article with one word: 'Respond.'",
    responseRound: {
      id: "rival-response",
      prompt: "Rival moves are accelerating the timeline. The owner wants a response to the media narrative. What do you do?",
      options: [
        {
          id: "accelerate-plan",
          label: "Accelerate the plan — announce a major move to change the narrative",
          description: "Trade the unprotected Memphis first for a win-now piece. Show the market you're moving.",
          tags: ["accelerate-plan", "reactive"],
        },
        {
          id: "stay-the-course",
          label: "Stay the course — communicate the plan clearly and resist pressure",
          description: "Reactive decisions are how you end up with bad contracts. Trust the three-year vision.",
          tags: ["stay-the-course", "disciplined"],
        },
        {
          id: "owner-press-conference",
          label: "Have the owner speak — organizational stability message",
          description: "The owner publicly endorses the plan. Front office credibility is re-established via his authority.",
          tags: ["owner-press-conference", "aligned"],
        },
      ],
    },
  },

  outcomes: [
    {
      roundTagCombo: ["controlled-rebuild", "trade-webb"],
      variants: [
        {
          probability: 0.65,
          label: "Full Rebuild — Hits by Year 3",
          scoreΔ: 8,
          narrative:
            "Webb went to LA via sign-and-trade — three unprotected firsts back. Two seasons of pain. Year 3: you have 4 cost-controlled players, cap space, and three lottery picks in the vault. A free agent max target chose you because of the clarity of the vision. The city forgave the rebuild. The plan worked.",
          applyStatus: ["trade-assets-rich", "rebuild-mode"],
        },
        {
          probability: 0.35,
          label: "Rebuild — Slower Than Projected",
          scoreΔ: 4,
          narrative:
            "Webb left. The picks underperformed. Year 3: still rebuilding. The GM who pitched this vision was let go after Year 2. His successor inherited the assets and eventually made it work — in Year 5, not Year 3.",
          applyStatus: ["rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["controlled-rebuild", "extend-webb-rebuild"],
      variants: [
        {
          probability: 0.70,
          label: "Webb Extended — Rebuilding With a Star",
          scoreΔ: 8,
          narrative:
            "Extended Webb before the window closed. Built around him — analytics-sourced picks, cost-controlled talent. Year 3: playoff team with Webb as the veteran anchor and two young stars around him. Best of both worlds.",
          applyStatus: ["star-retained", "high-morale"],
        },
        {
          probability: 0.30,
          label: "Webb Extended — Rebuilding Stalls",
          scoreΔ: 5,
          narrative:
            "Extended Webb but the picks didn't hit. He's unhappy playing on a non-competitive team. Year 3: he's requesting a trade. The supermax extension becomes a trade asset, not a cornerstone.",
          applyStatus: ["star-retained", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["hybrid-build", "analytics-plus-scouts"],
      variants: [
        {
          probability: 0.75,
          label: "Hybrid Model — Sustainable Contention",
          scoreΔ: 10,
          narrative:
            "The dual-authority structure created productive friction. Analytics found two undervalued players. Scouts validated them. Webb was extended and anchored the system. Year 3: 2nd seed in the conference. Two analytically-sourced All-Stars. Zero wasted contracts. This is what a well-run franchise looks like.",
          applyStatus: ["analytics-forward", "scout-trusted", "high-morale"],
        },
        {
          probability: 0.25,
          label: "Hybrid Model — Decision Paralysis",
          scoreΔ: 6,
          narrative:
            "Parallel authority created paralysis on two key decisions — both scouts and analytics disagreed on the same player, and no one had the authority to decide. Missed a deadline. Lost a free agent. Year 3: competitive but underachieving for the talent assembled.",
          applyStatus: ["analytics-forward"],
        },
      ],
    },
    {
      roundTagCombo: ["hybrid-build", "analytics-primary"],
      variants: [
        {
          probability: 0.70,
          label: "Analytics-Primary — Clear Decision Structure",
          scoreΔ: 9,
          narrative:
            "Clear authority made decisions fast. The model identified two All-Star caliber players that scouts had underrated. Year 3: most efficient offense in the league. Webb extended. Young core flourishing. The scouts who stayed became the model's best critics — the tension made both sides better.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.30,
          label: "Analytics-Primary — Scouts Resign",
          scoreΔ: 5,
          narrative:
            "The primary designation felt like a demotion to the scouting staff. Three elite scouts left within 6 months. The model performed — but lost the qualitative layer that caught non-model risks. One analytics-sourced pick was a character issue that pure metrics couldn't flag.",
          applyStatus: ["analytics-forward", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["win-now", "accept-second-apron"],
      variants: [
        {
          probability: 0.40,
          label: "Win Now — Championship Run",
          scoreΔ: 9,
          narrative:
            "Year 1: traded both picks, signed a max free agent. Made the Finals. Lost in 6. The city forgave the second-apron restrictions because of the run. Year 3: rebuilding with no picks and restricted trade rights. The window was real — you used it.",
          applyStatus: ["over-luxury-tax"],
        },
        {
          probability: 0.60,
          label: "Win Now — No Ring, No Assets",
          scoreΔ: 2,
          narrative:
            "Year 1: picked up, got to the second round, lost. Year 2: Webb aged, the max free agent regressed, and you had no picks to retool. Year 3: lottery team with a $180M payroll and Second Apron restrictions. No exit.",
          applyStatus: ["over-luxury-tax", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["win-now", "modify-win-now"],
      variants: [
        {
          probability: 0.60,
          label: "Modified Win-Now — Sustainable Pressure",
          scoreΔ: 7,
          narrative:
            "Traded one pick, kept the other. Stayed off the Second Apron. Missed on the max free agent but signed a quality $20M player. Year 1: 5th seed. Year 3: still competitive with one pick remaining and manageable cap. Not a championship run — a durable playoff team.",
          applyStatus: [],
        },
        {
          probability: 0.40,
          label: "Half Measure — No Championship, Less Assets",
          scoreΔ: 4,
          narrative:
            "Not aggressive enough for a real run, not disciplined enough for a true rebuild. Year 3: mediocre roster in the middle of nothing. The worst outcome: neither vision executed.",
          applyStatus: ["cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["analytics-transformation"],
      variants: [
        {
          probability: 0.55,
          label: "Analytics-Forward — Three-Year Build",
          scoreΔ: 8,
          narrative:
            "Invested $4M in analytics infrastructure. Replaced two traditional scouts with data scientists. The model found three undervalued players other teams passed on. Year 3: most efficient offense in the league. Webb happy, young core thriving. The scouts who remained became the model's best critics.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.45,
          label: "Analytics-Forward — Cultural Fracture",
          scoreΔ: 4,
          narrative:
            "The transformation was too fast. Half the scouting staff resigned in protest. The model performed — but lost the qualitative layer that scouts provide. Two analytically-sourced picks had undisclosed character concerns that the model couldn't flag. Year 3: rebuilding again.",
          applyStatus: ["analytics-forward", "coach-conflict"],
        },
      ],
    },
  ],

  defaultOutcome: {
    roundTagCombo: [],
    variants: [
      {
        probability: 1.0,
        label: "Vision Delivered",
        scoreΔ: 6,
        narrative:
          "The three-year plan was presented. The owner approved. The franchise moves forward with a defined philosophy.",
        applyStatus: [],
      },
    ],
  },
};

// ─── Exports ──────────────────────────────────────────────────────────────────
// All 8 missions are now fully upgraded — LegacyMission type is retained
// only for backward-compat shims in legacy API routes.

export type AnyMission = Mission | LegacyMission;

export const MISSIONS: AnyMission[] = [
  capCrunch,
  contractChoice,
  revenueMix,
  expensePressure,
  statsLineup,
  matchupAdjust,
  draftTable,
  finalGmCall,
];

export function getMissionById(id: string): AnyMission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function isLegacyMission(m: AnyMission): m is LegacyMission {
  return (m as LegacyMission).legacy === true;
}
