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

export interface RoundOption {
  id: string;
  label: string;
  description: string;
  tags: string[];
  blockedByStatus?: string;
  requiresStatus?: string;
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
        },
        {
          id: "team-friendly",
          label: "Propose a team-friendly extension",
          description: "30% of cap, 5 years. Saves $34M. You'll need to sell Cole on the 'team-first' framing.",
          tags: ["team-friendly", "cost-controlled"],
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

const revenueMix: LegacyMission = {
  id: "revenue-mix",
  missionNumber: 3,
  title: "Revenue Mix",
  department: "PARTNERSHIP OFFICE",
  tagline: "Largest sponsorship in franchise history.",
  scenario:
    "A global tech company offers a 5-year jersey patch deal worth $25M/year — the largest in franchise history. The catch: they want naming rights to your practice facility and 10 social media posts per month featuring their products. The CBA's revenue sharing means 50% of this deal's incremental value flows to small-market teams via the BRI pool. Your owner wants to maximize local revenue. How do you structure the deal?",
  conceptId: "bri-revenue",
  legacy: true,
  options: [
    {
      label: "Accept the full deal — $25M guaranteed",
      note: "Maximum local revenue, all conditions accepted",
      tags: ["revenue-max", "local-deal"],
      outcome: { scoreΔ: 8, narrative: "Deal closed. Revenue is up, but the social media requirement burns out players who hate the forced content. Two veteran free agents cite the 'corporate feel' as a reason to look elsewhere. Money in — chemistry slightly out." },
    },
    {
      label: "Negotiate down — $20M with no facility naming rights",
      note: "Balanced: good revenue, preserve team culture",
      tags: ["balanced", "culture-first"],
      outcome: { scoreΔ: 9, narrative: "Best outcome. You got $20M with terms the team can live with. Players respect the boundary you drew. Sponsor is happy with the social content. Owner sees a franchise that negotiates from strength, not desperation." },
    },
    {
      label: "Reject it — protect the brand at all costs",
      note: "No deal, preserve full autonomy",
      tags: ["brand-protection"],
      outcome: { scoreΔ: 3, narrative: "The city respects the decision. The owner does not. You left $100M+ on the table over five years. Other franchises used their patch deals to sign two All-Stars." },
    },
    {
      label: "Performance bonuses only — $12M base + upside",
      note: "Low guaranteed, high upside tied to wins and viewership",
      tags: ["risk-tolerance", "performance-linked"],
      outcome: { scoreΔ: 6, narrative: "Creative structure. You made $15M this year — a good playoffs run. But the uncertainty made financial planning harder. The board hates unpredictable revenue." },
    },
  ],
};

const expensePressure: LegacyMission = {
  id: "expense-pressure",
  missionNumber: 4,
  title: "Expense Pressure",
  department: "TRADE OPERATIONS",
  tagline: "Trade deadline — salary must match.",
  scenario:
    "It's the trade deadline. You're 3 games out of a playoff spot. A contending rival wants to offload a star wing — $28M this year, one year remaining. To match salary under trade rules, you'd need to send $22M+ (125% + $2M threshold). You have a $12M small forward and a $10M backup center who could be combined. But your Second Apron exposure would trigger if you take on his contract without sending out equal value.",
  conceptId: "trade-matching",
  legacy: true,
  options: [
    {
      label: "Aggregate both contracts — salary matching via combination",
      note: "Send $22M out ($12M + $10M combined), take $28M in",
      tags: ["aggregation", "star-acquisition"],
      outcome: { scoreΔ: 9, narrative: "Legal trade. Salary aggregation worked perfectly — you stayed just under the Second Apron. The wing arrives with 5 days until the deadline. Team goes on a 7-game win streak. Playoffs locked." },
    },
    {
      label: "Attach a pick to make the deal work",
      note: "Add a protected 2nd-round pick to sweeten the return",
      tags: ["asset-cost", "deal-maker"],
      outcome: { scoreΔ: 7, narrative: "The pick sweetened the deal and the trade closed. You gave up a future asset, but you're in the playoffs now." },
    },
    {
      label: "Counter: take back $22M and keep both your players",
      note: "Propose a different target — request their cheaper backup",
      tags: ["cap-discipline", "alternative"],
      outcome: { scoreΔ: 5, narrative: "Counter rejected. They wanted the star wing deal or nothing. You stood pat. Missed the playoffs by 1.5 games." },
    },
    {
      label: "Three-team trade — find a third partner to absorb salary",
      note: "Involve a third team to split the salary load creatively",
      tags: ["complex-trade", "three-team"],
      outcome: { scoreΔ: 8, narrative: "Three-team structure worked but took 72 hours to close. The third team got a future first. You got the wing and stayed off the Second Apron." },
    },
  ],
};

const statsLineup: LegacyMission = {
  id: "stats-lineup",
  missionNumber: 5,
  title: "Stats Lineup",
  department: "ANALYTICS LAB",
  tagline: "The model says bench the starters.",
  scenario:
    "Your analytics team flags a five-man bench lineup with a +12 net rating over 200 possessions — far outperforming your starting five. The data is clear: this lineup creates mismatches and makes your opponents' defensive schemes irrelevant. But your head coach doesn't trust it. He calls advanced metrics 'box score fiction' and refuses to adjust rotations. You have to decide whose authority holds.",
  conceptId: "analytics",
  legacy: true,
  options: [
    {
      label: "Trust the coach — keep traditional rotations",
      note: "Preserve staff relationship, ignore the data",
      tags: ["culture", "coach-deference"],
      outcome: { scoreΔ: 4, narrative: "You backed the coach. The team finished 3 games below .500. Post-season review showed the lineup data was accurate." },
    },
    {
      label: "Show the coach the data — let him decide",
      note: "Present analytics transparently, empower the coaching staff",
      tags: ["data-transparency", "coach-collaboration"],
      outcome: { scoreΔ: 8, narrative: "The coach studied the data over two weeks. He piloted the lineup for 5 minutes per game. By February, it was a core rotation. Best of both worlds." },
    },
    {
      label: "Override the coach — mandate lineup changes from the front office",
      note: "Front office dictates rotations directly",
      tags: ["analytics-first", "friction"],
      outcome: { scoreΔ: 5, narrative: "The lineup worked — win rate improved. But the coach felt undermined in front of his staff. He resigned mid-season." },
    },
    {
      label: "All-in analytics overhaul — rebuild systems around the model",
      note: "Build full analytics infrastructure around data-driven rotation logic",
      tags: ["systemic-change", "analytics-investment"],
      outcome: { scoreΔ: 9, narrative: "Hired a data-forward coach, built an analytics integration team. Two years later: the most efficient offense in the league." },
    },
  ],
};

const matchupAdjust: LegacyMission = {
  id: "matchup-adjust",
  missionNumber: 6,
  title: "Matchup Adjust",
  department: "MEDICAL BAY",
  tagline: "Franchise player showing fatigue signs.",
  scenario:
    "Your franchise player — 24 years old, averaging 31 points on 38 minutes per game — is showing early fatigue signs. He's shooting 4% below his season average in the fourth quarter over the last 10 games. The medical team flags 'soft tissue stress' but not injury. The fanbase wants him on the floor. Playoffs are 11 games away. How do you manage his load?",
  conceptId: "roster-health",
  legacy: true,
  options: [
    {
      label: "Reduce to 32 minutes — protect the playoff body",
      note: "Prioritize long-term health over short-term wins",
      tags: ["load-management", "player-health"],
      outcome: { scoreΔ: 9, narrative: "Smart call. He arrived in the playoffs at 97% health. Fresh legs in April matter more than 3 extra regular season wins." },
    },
    {
      label: "Balanced plan — 34 minutes with strategic rest games",
      note: "Sit out 2 road back-to-backs, play all home games",
      tags: ["balanced", "win-now"],
      outcome: { scoreΔ: 8, narrative: "The compromise worked. He entered the playoffs healthy and grateful for the communication." },
    },
    {
      label: "Push him — 38+ minutes, playoffs need him at full effort",
      note: "Compete for seeding and ignore the fatigue data",
      tags: ["high-risk", "win-now"],
      outcome: { scoreΔ: 3, narrative: "He played through it — then strained a hamstring in Game 2 of the playoffs. Out for 3-4 weeks." },
    },
    {
      label: "Aggressive rest protocol — sit him for 5 full games",
      note: "Maximum protection, significant record risk",
      tags: ["protective", "long-term"],
      outcome: { scoreΔ: 6, narrative: "Five games off — the team went 2-3 without him, dropping two seeds in the standings. He entered the playoffs fully healthy." },
    },
  ],
};

const draftTable: LegacyMission = {
  id: "draft-table",
  missionNumber: 7,
  title: "Draft Table",
  department: "DRAFT WAR ROOM",
  tagline: "10 minutes on the clock at #6.",
  scenario:
    "You hold the #6 pick in the draft. Your scouting department loves a 19-year-old overseas wing — polished, safe, NBA-ready. Your analytics model projects a 20-year-old guard from a mid-major as a top-15 player by Year 3, based on shot quality, movement patterns, and off-ball activity. Scouts rate him #14. The model rates him #4. You have 10 minutes on the clock.",
  conceptId: "rookie-scale",
  legacy: true,
  options: [
    {
      label: "Trust the scouts — take the consensus #6 wing",
      note: "Safe pick with clear NBA skill set",
      tags: ["scout-consensus", "safe-pick"],
      outcome: { scoreΔ: 7, narrative: "The wing is exactly what scouts projected — solid starter by Year 2, never a star." },
    },
    {
      label: "Trade down — swap #6 for #12 plus a future first",
      note: "More assets, still competitive range",
      tags: ["asset-accumulation", "trade-down"],
      outcome: { scoreΔ: 6, narrative: "Traded down. The future first became a Top 10 pick two years later. The rebuild has real momentum." },
    },
    {
      label: "Trust the model — take the analytics darling at #6",
      note: "High variance: projected top-15 player or bust",
      tags: ["analytics-pick", "high-upside"],
      outcome: { scoreΔ: 9, narrative: "The model was right. Year 3: All-Star. His shot quality and off-ball movement translated exactly as predicted." },
    },
    {
      label: "Swing on a raw project — 18-year-old international flier",
      note: "Lowest probability, highest upside ceiling",
      tags: ["project-pick", "high-ceiling"],
      outcome: { scoreΔ: 4, narrative: "The project needed two more years overseas. By Year 5, you'll know if the patience was justified." },
    },
  ],
};

const finalGmCall: LegacyMission = {
  id: "final-gm-call",
  missionNumber: 8,
  title: "Final GM Call",
  department: "OWNERSHIP SUITE",
  tagline: "The owner wants your three-year plan.",
  scenario:
    "End of the season. Your owner sits across from you and asks the question that defines your tenure: 'What's the plan for the next three years?' You have one All-Star under contract, two first-round picks, and a roster that narrowly missed the playoffs. The league is in transition — younger teams are winning with analytics-forward rosters. What do you tell the owner?",
  conceptId: "front-office-philosophy",
  legacy: true,
  options: [
    {
      label: "Controlled rebuild — cap discipline over the next two years",
      note: "Accumulate picks, clear bad contracts, let the young players lead",
      tags: ["rebuild", "cap-flexibility"],
      outcome: { scoreΔ: 7, narrative: "The rebuild plan worked. Three years of discipline. By Year 3: three cost-controlled players, two firsts, and cap space to land a free agent." },
    },
    {
      label: "Blend scouting and data — build a hybrid front office model",
      note: "Invest in analytics while retaining elite scout relationships",
      tags: ["balanced-philosophy", "process-driven"],
      outcome: { scoreΔ: 9, narrative: "Best answer. Hired a head of research, retained top scouts. Three years later: two analytically-sourced All-Stars, zero wasted contracts." },
    },
    {
      label: "Win now — star talent over system and structure",
      note: "Pursue a max free agent immediately, trade picks for veterans",
      tags: ["win-now", "star-chasing"],
      outcome: { scoreΔ: 5, narrative: "You swung for a max free agent. He chose another team. Year 3: mediocre roster, no picks, no exit." },
    },
    {
      label: "Full analytics transformation — rebuild around model-driven decisions",
      note: "Replace traditional scouting with data-first processes entirely",
      tags: ["analytics-first", "organizational-change"],
      outcome: { scoreΔ: 7, narrative: "Polarizing decision. Half the scouts resigned. The model found three undervalued players. Year 3: working, but fragile without human context." },
    },
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

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
