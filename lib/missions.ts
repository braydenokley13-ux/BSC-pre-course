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

const revenueMix: Mission = {
  id: "revenue-mix",
  missionNumber: 3,
  title: "Revenue Mix",
  department: "PARTNERSHIP OFFICE",
  tagline: "Largest sponsorship in franchise history.",
  scenario:
    "NovaTech, a global consumer electronics company, has submitted a formal proposal: a 5-year jersey patch deal worth $25M/year — the largest in franchise history. Conditions: they want naming rights to your practice facility, 10 mandated social media posts per month from the team account, and first right of refusal on any future arena naming rights. Under the CBA's BRI rules, ~50% of incremental local revenue flows into the shared pool. The owner wants maximum local dollars. Players are already grumbling about the social media clause.",
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
