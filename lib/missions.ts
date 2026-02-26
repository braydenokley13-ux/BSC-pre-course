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
  tagline: "New deal time limit in 48 hours.",
  scenario:
    "Your team point guard, Marcus Webb, has one year left on his deal and has made two All-Star teams. His agent is demanding a 3-year, $48M new deal. which pushes your $168M payroll $14M over the luxury tax line. LA and Miami have cleared cap space. Webb's agent wants an answer in 48 hours.",
  conceptId: "luxury-tax",
  // Mission 1 has no injections — it's the first mission, no prior status

  infoCards: [
    {
      title: "CAP SHEET ALERT",
      content:
        "Current payroll. $168M. Luxury tax line. $171M. You're $3M under. Signing a 3yr/$48M new deal moves you to $185M. $14M over. First-year penalty. ~$6.3M on top of salary. Repeater line applies if you're over the tax in 3 of the next 4 seasons.",
      revealDelay: 0,
    },
    {
      title: "AGENT CALL — MARCUS WEBB",
      content:
        "Webb's agent. '3 years, $48M. firm. He's got real pull from LA and Miami, both with cap space. If you can't match that level of promise, we're listening to other offers. He wants to stay but the market is the market.'",
      revealDelay: 12,
    },
    {
      title: "OWNER MEMO — PRIVATE",
      content:
        "Owner's message. 'Luxury tax is acceptable once. I'll wear it this year. But do NOT let us slide into repeater zone. If we're over the line in 3 of the next 4 years, the costs become very serious. Stay out of repeater range no matter what.'",
      revealDelay: 24,
      roleOnly: "president",
    },
    {
      title: "MEDICAL FILE — LIMITED",
      content:
        "Team doctor note (private). Webb came in with a stress issue in his left heel 18 months ago. Not in public disclosed. Re-injury chance over a 3-year term. 28%. Recommend monitoring workload.",
      revealDelay: 24,
      roleOnly: "scout",
    },
  ],

  roles: [
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You own the cap sheet. You know every number, every penalty, every cap tool.",
      privateInfo:
        "Repeater math. if you sign Webb and stay over the tax for 3 of the next 4 seasons, Year 3 penalty rate jumps from $1.50 to $2.50 per dollar over. On a $14M overage that's a $21M tax bill in Year 3 alone. The owner doesn't fully grasp this yet.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You work with with owner. You know the real budget ceiling.",
      privateInfo:
        "The owner told you in private. the absolute hard ceiling is $180M total payroll. $9M over tax. At $185M you are $5M above what he'll really authorize. He said 'luxury tax is fine once' but he meant under $180M. You need to talk Webb down.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You've seen every game film. You know what the numbers don't show.",
      privateInfo:
        "Webb's heel stress issue 18 months ago was worse than reported. The team doctor gave him a 28% re-injury chance over 3 years. He's also quietly showing early signs of over-reliance on his left hand after favoring his right foot. You're not sure he's worth $16M/year in Year 3.",
    },
    {
      id: "marketing",
      title: "MARKETING DIR",
      description: "You run the revenue side of the roster. Stars drive sponsor deal dollars.",
      privateInfo:
        "Webb's jersey is #2 in the city behind only the team legend. Losing him projects to a 22% drop in merch revenue. about $4.1M annually. Our top jersey sponsor has a output clause tied to a marquee star being on the roster. If Webb leaves, that clause triggers and we lose $2.8M in sponsor revenue.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The agent wants an answer in 48 hours. What is your initial plan?",
      options: [
        {
          id: "sign-max",
          label: "Sign Webb at full terms",
          description: "Commit fully. 3yr/$48M, lock up the team core star. Accept the luxury tax bill.",
          tags: ["sign-max", "win-now"],
          mutations: [
            {
              ifStatus: "over-luxury-tax",
              labelSuffix: " ⚠ SECOND TAX YEAR",
              descriptionPrefix: "WARNING. You're already over the tax line. This triggers repeater zone next season.",
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
          description: "Gauge Webb's trade value before committing. Two contenders have expressed informal pull.",
          tags: ["explore-trade", "rebuild"],
          mutations: [
            {
              ifStatus: "rebuild-mode",
              labelSuffix: " ★ REBUILD PATH",
              descriptionPrefix: "Your rebuild order makes this the logical play.",
            },
          ],
        },
        {
          id: "call-bluff",
          label: "Call the bluff",
          description: "Let him enter open market. You'll have matching rights if he signs somewhere else. Force him to show his hand.",
          tags: ["call-bluff", "high-risk"],
        },
      ],
    },
    {
      id: "terms",
      prompt: "Webb's agent calls back with a counter. What do you do?",
      context: "Your opening counter was $13.5M/year. $40.5M total. The agent responded. 'Webb has a $15M floor. That's non-negotiable. He'll go to LA at $16M if you can't hit $15M.'",
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
          label: "Redo with output bonuses",
          description: "$13M base + $2M in annual bonuses tied to All-Star selections and games played. Averages $15M if he performs.",
          tags: ["restructure-bonus", "risk-managed"],
        },
        {
          id: "final-offer",
          label: "Hold at $13.5M — true final offer",
          description: "This is your ceiling. If he walks, he walks. The market will reset later.",
          tags: ["final-offer", "hardball"],
        },
      ],
    },
    {
      id: "terms-sign",
      prompt: "Webb's agent responds right away. 'Deal. But he wants a trade veto and a player choice year in Year 3.'",
      context: "You've agreed on $48M/3 years. Now the agent is adding non-cash terms.",
      dependsOnRoundId: "direction",
      dependsOnTag: "sign-max",
      options: [
        {
          id: "full-accept",
          label: "Accept all terms — NTC + player choice year",
          description: "Full promise. He runs his destiny in Year 3. You lose room.",
          tags: ["full-accept", "player-friendly"],
        },
        {
          id: "ntc-only",
          label: "Accept NTC, reject player choice year",
          description: "Protect the star, keep deal certainty. Talk hard on the player choice year.",
          tags: ["ntc-only", "balanced"],
        },
        {
          id: "counter-both",
          label: "Counter: limited NTC (5 teams), no player choice year",
          description: "Limited no-trade, no opt-out. Business-first. Agent will push back.",
          tags: ["counter-both", "leverage"],
        },
      ],
    },
    {
      id: "terms-bluff",
      prompt: "Day 1 of open market. LA files a 4yr/$64M offer sheet. You have 72 hours to match.",
      context: "Your 'call the bluff' plan has arrived at its moment of truth.",
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
          description: "LA's offer includes two open firsts as compensation if you decline. Rebuild from there.",
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
      context: "Playoff team A (LA). 2 open 1st-round picks + a young PG on a rookie deal. Playoff team B (Miami). 1 open first + their first center (2 years, $18M left).",
      dependsOnRoundId: "direction",
      dependsOnTag: "explore-trade",
      options: [
        {
          id: "accept-la",
          label: "Accept LA's offer — 2 firsts + young PG",
          description: "Highest future value. Two lottery tickets and a developing piece. Full rebuild mode.",
          tags: ["accept-la", "rebuild"],
        },
        {
          id: "accept-miami",
          label: "Accept Miami's offer — 1 first + center",
          description: "Stay semi-strong. Keep a playoff-caliber roster piece while shedding Webb's new deal.",
          tags: ["accept-miami", "balanced"],
        },
        {
          id: "reject-trades",
          label: "Reject both — keep Webb",
          description: "Neither package is good enough. Go back to the new deal talks.",
          tags: ["reject-trades", "win-now"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["sign-max", "call-bluff"],
    message:
      "COMMISSIONER ALERT. The NBA Board of Governors voted 24–6 to strengthen the Second Apron rules. Teams entering the repeater luxury tax line in Year 2+ of a new CBA cycle face an extra 15% surtax. Your current path puts you in repeater range by Year 3. Does this change your plan?",
    responseRound: {
      id: "rival-response",
      prompt: "The new CBA rule changes the math on your deal. How do you respond?",
      options: [
        {
          id: "restructure-now",
          label: "Redo a current deal to stay out of repeater",
          description: "Eat a buyout on a role player now to protect Year 3 room.",
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
          label: "Call Webb's agent — propose a 2-year redo",
          description: "Shorter term avoids repeater risk. Harder sell to the player.",
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
          label: "Star Signed — Full Promise",
          scoreΔ: 8,
          narrative:
            "Webb signs. The locker room knows the team office is all-in. He posts 29 points per game and drags the team to a 6-seed. The luxury tax bill arrives. $6.3M. and the owner grimaces but pays. The NTC and player choice year will matter in Year 3.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.35,
          label: "Star Signed — Heel Injury Year 1",
          scoreΔ: 5,
          narrative:
            "Webb signs. then the heel goes in December. He misses 28 games. The new deal still looks right philosophically. But the medical risk your scout flagged was real. Team finishes 9th, out of the play-in.",
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
            "You okayed the NTC but held the line on the player choice year. Webb signed. slight annoyance from the agent. But the deal is clean. No opt-out escape hatch in Year 3. You control the deal.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.25,
          label: "Webb Stalls — Rival Offer Filed",
          scoreΔ: 5,
          narrative:
            "He sat on it for 8 days. Then Miami filed an offer sheet at a slightly higher average. You matched. But the trust has a crack in it. He knows you weren't fully committed on his terms.",
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
            "You met his floor. Webb signed before the 48-hour time limit expired. The owner winces at the luxury tax but respects the follow-through. You're $3M over the tax line. okay, not repeater zone.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.30,
          label: "Webb Signs — Quietly Resentful",
          scoreΔ: 5,
          narrative:
            "He okayed. then let it slip to two teammates that the team office 'lowballed him.' The locker room notices. He's performing. But the trust gap with the team is real.",
          applyStatus: ["star-retained", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "restructure-bonus"],
      variants: [
        {
          probability: 0.60,
          label: "Bonus Setup Accepted",
          scoreΔ: 7,
          narrative:
            "Webb's agent pushed back for two weeks. Then okayed. The output setup protects you if he regresses. He makes All-Star Year 1 and earns the full bonus. Year 2 TBD.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.40,
          label: "Bonus Setup — Webb Declines",
          scoreΔ: 3,
          narrative:
            "He rejected the bonus setup. 'I'm not being paid on output at this stage of my career.' Open market opened. LA signed him Day 1. You now have cap space and a team again roster.",
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
            "He went to LA. A max deal in the first hour of open market. You saved $34.5M in total payroll promise and avoided the luxury tax. but lost your best player. The rebuild starts now, whether you wanted it or not.",
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
            "You matched within the hour. The speed of the match sent a message. Webb stayed. but the 4-year term means you're committed through his age-31 season. Longer than ideal.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.20,
          label: "Matched — Deal Regret Year 3",
          scoreΔ: 4,
          narrative:
            "You matched. Webb stayed. Then the heel. The 4-year term turns into an albatross when he misses half of Year 3. The rushed match left no room for talks.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
      ],
    },
    {
      roundTagCombo: ["call-bluff", "decline-for-picks"],
      variants: [
        {
          probability: 1.0,
          label: "Picks Okayed — Full Rebuild",
          scoreΔ: 6,
          narrative:
            "Two open firsts in your vault. Webb went to LA and right away posted 31 points in his debut. The city is angry. The picks are real assets. In three years you'll know if this was genius or cowardice.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["explore-trade", "accept-la"],
      variants: [
        {
          probability: 1.0,
          label: "Trade Okayed — Full Rebuild",
          scoreΔ: 7,
          narrative:
            "Two firsts and a young PG. Clean cap space. Webb posted a goodbye to the city on social media that broke the internet. Your rebuild has highest options. now you have to use it.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["explore-trade", "accept-miami"],
      variants: [
        {
          probability: 0.65,
          label: "Trade Okayed — Strong Pivot",
          scoreΔ: 8,
          narrative:
            "The center is a real upgrade at the 5. You have one first and a playoff-viable roster. Not a rebuild. a retool. The city okayed it better than likely. The 1st-round pick becomes top-12.",
          applyStatus: ["trade-assets-rich"],
        },
        {
          probability: 0.35,
          label: "Trade — Center Underperforms",
          scoreΔ: 4,
          narrative:
            "The center's efficiency drops in your system. He was Miami's system. not yours. The one 1st-round pick is pick 19. The roster is mediocre and you have no Webb.",
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
          "The team office made a call under stress and moved forward. Results are pending.",
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
  tagline: "Max deal rules — one week to decide.",
  scenario:
    "Your young star Darius Cole has made two All-Star teams on his rookie deal and is now eligible for a Star player Max deal New deal. 35% of the cap for 5 years, worth $210M+. His agent is leaking pull to two cap-space teams. He has a player choice year in Year 5 of any new deal. What do you offer?",
  scenarioInjections: [
    {
      requiredStatus: "star-retained",
      prependText: "Webb's new deal is locked in. now you need to figure out Cole's future. With Webb already under max money, the cap math is brutal.",
    },
    {
      requiredStatus: "over-luxury-tax",
      prependText: "You're already over the luxury tax line. A max deal for Cole would push you toward repeater zone for three straight seasons.",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're in rebuild mode. Cole is your most valuable asset. but he's also your best young player. This choice defines the rebuild's ceiling.",
    },
    {
      requiredStatus: "high-morale",
      prependText: "Team morale is high right now. Cole is happy and wants to stay. You have power in this talks.",
    },
  ],
  conceptId: "extensions-options",

  infoCards: [
    {
      title: "MAX DEAL RULES CONFIRMED",
      content:
        "Cole qualifies for the Star player New deal. 35% of the salary cap, 5 years, fully locked. Current cap. $136M. Max deal value. $47.6M/year, $238M total. Other option. lower-cost at 30% of cap = $40.8M/year, $204M total. Gap. $34M over the life of the deal.",
      revealDelay: 0,
    },
    {
      title: "RIVAL GM INTEL",
      content:
        "Heard from a league source. Houston and Portland are both clearing big cap space this summer. Houston's GM in private told our contact. 'Cole is the exact profile we're team around.' This is not a bluff. they have the room to sign him outright.",
      revealDelay: 12,
    },
    {
      title: "PLAYER TOP GOALS — AGENT CALL",
      content:
        "Cole's agent says his client has three top goals in order. (1) Winning. he wants to be on a real playoff team. (2) Market value. he doesn't want to be underpaid vs. his peers. (3) City. he likes it here but won't sacrifice 1 and 2 for it. He has not talked to the other teams right away yet.",
      revealDelay: 24,
    },
    {
      title: "CAP ROOM OUTLOOK — LIMITED",
      content:
        "If you sign Cole at Max deal. you are fully committed through his age-28 season with virtually no cap room. If you sign lower-cost. you retain a $7M trade cap tool and mid-level cap tool access. If you let him go via sign then trade. you can setup return assets with salary matching.",
      revealDelay: 24,
      roleOnly: "capologist",
    },
  ],

  roles: [
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You manage extensions, cap holds, and cap tool access.",
      privateInfo:
        "The lower-cost deal saves $34M but here's what nobody's saying. if Cole hits his Year 3 player choice year and leaves, you get a mid-level cap tool and a trade cap tool. not a max slot. You'd need two full off-seasons to reset. The max deal locks him in but kills cap room for 5 years. Both paths are risky. just differently.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You work with with owner and handle long run plan.",
      privateInfo:
        "The owner made it clear. 'Sign Cole at whatever it takes. I'm not watching him walk to Houston on national TV.' There is no actual ceiling on this deal from owner's perspective. But the owner also said the team must be a playoff playoff team every year Cole is here. That's the real limit.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You rate talent and long run player trajectories.",
      privateInfo:
        "Cole is elite. But I've scouted 12 max-deal players over 20 years and I'll tell you what the tape shows. his athletic peak is right now. He's 24. by Year 4 of this new deal he'll be 28 and on the back half of his prime. His game relies on first-step speed more than most realize. The max deal pays him peak money through post-peak years.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You run player projections and deal value models.",
      privateInfo:
        "Our model has Cole at a 94th rank level RAPTOR outlook through age 27, dropping to 80th rank level by 29. The model values him at $43.2M/year through his prime and $31M/year in post-prime. The max deal pays him $47.6M/year. By our calculation, you're paying $4.4M/year above market from Day 1 and $16.6M/year above market by Year 5.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "Cole's agent is waiting. What is your new deal plan?",
      options: [
        {
          id: "offer-supermax",
          label: "Offer the full Max deal right away",
          description: "35% of cap, 5 years, fully locked. Highest promise to your team core star.",
          tags: ["offer-supermax", "star-retention"],
          mutations: [
            {
              ifStatus: "over-luxury-tax",
              labelSuffix: " ⚠ REPEATER RISK",
              descriptionPrefix: "WARNING. You're already over the tax line. A max deal pushes you into repeater zone for 3+ seasons. costs escalate to $2.50/$1.",
            },
            {
              ifStatus: "star-retained",
              descriptionPrefix: "Webb is already locked up at $16M/year. Adding a Cole max deal gives you two max players and very little roster room.",
            },
          ],
        },
        {
          id: "team-friendly",
          label: "Propose a lower-cost new deal",
          description: "30% of cap, 5 years. Saves $34M. You'll need to sell Cole on the 'team-first' framing.",
          tags: ["team-friendly", "cost-controlled"],
          mutations: [
            {
              ifStatus: "cap-space-limited",
              labelSuffix: " ★ CAP RELIEF OPTION",
              descriptionPrefix: "With your cap already tight, the $34M in savings is the gap between trying to win and being stuck.",
            },
          ],
        },
        {
          id: "qualifying-offer",
          label: "Issue a match-rights offer — make him RFA",
          description: "Retain matching rights. He can test the market but you can match any offer. High-risk play.",
          tags: ["qualifying-offer", "rfa"],
        },
        {
          id: "sign-and-trade",
          label: "Orchestrate a sign then trade",
          description: "Get the most return assets. Cole signs with a new team through you. You get picks + players.",
          tags: ["sign-and-trade", "rebuild"],
          mutations: [
            {
              ifStatus: "rebuild-mode",
              labelSuffix: " ★ REBUILD ACCELERATOR",
              descriptionPrefix: "Your rebuild order makes this the logical choice. assets now over promise.",
            },
            {
              ifStatus: "trade-assets-rich",
              descriptionPrefix: "You already have pick capital. Adding Cole's return could give you the best asset base in the league.",
            },
          ],
        },
      ],
    },
    {
      id: "terms-supermax",
      prompt: "Cole's agent calls back with an addition. he wants a player choice year in Year 4 (not Year 5) and a trade veto covering 28 teams.",
      context: "The max deal offer is on the table. Now the agent is pushing on non-cash terms.",
      dependsOnRoundId: "direction",
      dependsOnTag: "offer-supermax",
      options: [
        {
          id: "accept-all-terms",
          label: "Accept all this — Year 4 option + NTC",
          description: "Full promise. He runs the trust. You get his best years.",
          tags: ["accept-all-terms", "player-friendly"],
        },
        {
          id: "year5-option-only",
          label: "Counter: Year 5 option only, no NTC",
          description: "Push the opt-out back a year and remove the trade restriction. He gets safety, you get room.",
          tags: ["year5-option-only", "leverage"],
        },
        {
          id: "no-extras",
          label: "Full max deal but no extras — take it or leave it",
          description: "The money is the promise. Non-cash terms are off the table.",
          tags: ["no-extras", "hardball"],
        },
      ],
    },
    {
      id: "terms-friendly",
      prompt: "The agent calls. Cole is 'disappointed' by the lower-cost framing. His counter. $43M/year or he will test open market.",
      context: "You offered 30% of cap. Cole likely the max deal. The gap is $4.8M/year.",
      dependsOnRoundId: "direction",
      dependsOnTag: "team-friendly",
      options: [
        {
          id: "split-difference",
          label: "Split the gap — $43M/yr, 5 years",
          description: "Meet him between lower-cost and max deal. Both sides give something.",
          tags: ["split-difference", "balanced"],
        },
        {
          id: "add-incentives",
          label: "Hold at 30% base — add output incentives",
          description: "Base stays lower-cost. Add $3M/year in achievable incentive triggers. He earns it if he performs.",
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
      prompt: "Houston submits a 5yr/$230M offer sheet on Day 1 of open market. You have 48 hours to match.",
      context: "Your match-rights offer plan has arrived at its critical moment.",
      dependsOnRoundId: "direction",
      dependsOnTag: "qualifying-offer",
      options: [
        {
          id: "match-offer-sheet",
          label: "Match the offer sheet — retain Cole",
          description: "$230M over 5 years. More than your original max deal offer. This is what the market said he's worth.",
          tags: ["match-offer-sheet", "star-retained"],
        },
        {
          id: "decline-offer-sheet",
          label: "Decline — let him sign with Houston",
          description: "You get two 1st-round picks as compensation. Full rebuild.",
          tags: ["decline-offer-sheet", "rebuild"],
        },
      ],
    },
    {
      id: "terms-sat",
      prompt: "Two teams want Cole via sign then trade. Choose your return.",
      context: "Houston offers 3 open firsts + a young center. Portland offers 2 open firsts + their first wing (1 year, $14M) + a future first.",
      dependsOnRoundId: "direction",
      dependsOnTag: "sign-and-trade",
      options: [
        {
          id: "houston-package",
          label: "Accept Houston — 3 open firsts + young center",
          description: "Highest future picks. Long rebuild runway.",
          tags: ["houston-package", "rebuild"],
        },
        {
          id: "portland-package",
          label: "Accept Portland — 2 firsts + wing + future first",
          description: "Stay semi-strong. Four draft assets total and an immediate-impact player.",
          tags: ["portland-package", "balanced"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["offer-supermax", "match-offer-sheet"],
    message:
      "RIVAL GM ALERT. Boston just gave their star a 5yr/$250M new deal. $10M more per year than Cole's current offer. Cole's agent just texted you. 'Boston just set a new market. We need to revisit terms.' How do you respond?",
    responseRound: {
      id: "rival-response",
      prompt: "The Boston deal just reset the market. Cole's agent is asking for more. What do you do?",
      options: [
        {
          id: "hold-current",
          label: "Hold your current offer — Boston's deal isn't precedent",
          description: "Other market, other player profile. Your offer stands.",
          tags: ["hold-current", "discipline"],
        },
        {
          id: "match-market",
          label: "Adjust upward to match new market rate",
          description: "Add $2M/year to the deal to close at strong market value.",
          tags: ["match-market", "player-friendly"],
        },
        {
          id: "accelerate-closing",
          label: "Offer a signing bonus to close now before the market moves further",
          description: "$5M signing bonus in exchange for Cole agreeing to the current terms right away.",
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
          label: "Team Locked In — Full Promise",
          scoreΔ: 9,
          narrative:
            "Cole signs. The locker room exhales. He gets the Year 4 opt-out and the NTC. The city celebrates. The win window is open. five years of elite talent under deal. Now build the roster around him.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.30,
          label: "Cole Signs — Uses Year 4 Option",
          scoreΔ: 6,
          narrative:
            "He signed. Then exercised the Year 4 player choice year. leaving $47M on the table to join a super team. You got three great years from him. The opt-out clause cost you the long run trust.",
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
            "Cole signed. The Year 5 option is cosmetic. he'll be 29 and you'll likely talk a new deal by then anyway. You got the star, the promise. reasonable room. Best outcome.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.25,
          label: "Cole Delays — Signs Late",
          scoreΔ: 6,
          narrative:
            "He took 3 weeks to accept the changed terms. Camp opened with uncertainty hanging over the roster. He signed but the trust cooled. He performs at an All-Star level. the deal works on the court.",
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
            "Both sides gave something. Cole gets $43M/year. above lower-cost, below max deal. He's happy. You saved $24M in total promise vs. the full max deal. The locker room sees a team willing to invest.",
          applyStatus: ["star-retained"],
        },
        {
          probability: 0.35,
          label: "Cole Signs — In public Grumbles",
          scoreΔ: 5,
          narrative:
            "He signed but told a writer the team office 'prioritized the budget over the player.' It's a distraction. He performs but the team trust is fractured.",
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
            "He went to open market on principle. Houston signed him at the full max deal. You kept the $34M gap. and lost your team player. The city is furious. The rebuild is now mandatory.",
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
            "You matched Houston's $230M offer. Cole stayed. But the trust is awkward. he knows you didn't voluntarily offer the max deal. He performs but watches the exit door every summer.",
          applyStatus: ["star-retained", "over-luxury-tax"],
        },
        {
          probability: 0.30,
          label: "Matched — Locker Room Damage",
          scoreΔ: 4,
          narrative:
            "You matched. Teammates saw the whole saga. the hesitation, the offer sheet drama, the forced match. The locker room respect for the team office took a hit. Cole stays but the chemistry is off.",
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
            "Two open firsts. Houston celebrates, your city mourns. Cole right away becomes the face of Houston's team. In 3 years, you'll know if those picks were worth it.",
          applyStatus: ["rebuild-mode", "trade-assets-rich"],
        },
      ],
    },
    {
      roundTagCombo: ["sign-and-trade", "houston-package"],
      variants: [
        {
          probability: 1.0,
          label: "Three Firsts — Highest Rebuild",
          scoreΔ: 8,
          narrative:
            "Three open firsts and a young center. On paper, this is a haul. The young center averages 16 and 9 by Year 2. One of the three firsts becomes a lottery pick. The rebuild has real momentum.",
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
            "Two firsts, a future first. a solid wing. You stayed strong while team for the future. The wing fits your system. This is how you thread the needle between rebuild and title chase.",
          applyStatus: ["trade-assets-rich"],
        },
        {
          probability: 0.40,
          label: "Wing Underperforms — Pick Swings",
          scoreΔ: 5,
          narrative:
            "The wing was Portland's system. He's average in yours. The picks land at 14, 18. a future lottery. Solid assets. not a windfall. The rebuild is slower than hoped.",
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
        narrative: "A choice was reached under stress. The team moves forward.",
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
  tagline: "Largest sponsor deal in team history.",
  scenario:
    "NovaTech, a global consumer electronics company, has submitted a formal proposal. a 5-year jersey patch deal worth $25M/year. the largest in team history. Terms. they want naming rights to your team gym, 10 mandated social media posts per month from the team account. first right of refusal on any future arena naming rights. Under the CBA's BRI rules, ~50% of incremental local revenue flows into the shared pool. The owner wants highest local dollars. Players are already grumbling about the social media clause.",
  scenarioInjections: [
    {
      requiredStatus: "high-morale",
      prependText: "The locker room is buzzing right now. players are happy and the culture is good. A tone-deaf sponsor deal deal could undermine all this you've built. Use that goodwill as power.",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're in rebuild mode. Revenue calm is now very serious. your payroll is shrinking but your operating costs aren't. A bad deal here could set the team back years.",
    },
    {
      requiredStatus: "cap-space-limited",
      prependText: "Your cap room is already constrained. NovaTech's deal is one of the few tools you have to generate revenue without touching the roster.",
    },
    {
      requiredStatus: "star-retained",
      prependText: "Webb's name is worth money to NovaTech. they in clear terms mentioned his marketability in their pitch. That's power you should use.",
    },
  ],
  conceptId: "bri-revenue",

  infoCards: [
    {
      title: "BRI REVENUE BREAKDOWN",
      content:
        "BRI (Basketball-Related Income) covers gate receipts, local media, sponsorships. merchandise. The current CBA splits BRI 50/50 between players and owners. Local sponsor deal revenue above a baseline line is shared via the revenue distribution pool. about $0.50 of every incremental dollar goes to smaller-market teams. Net local value to your team. ~$12.5M/year of the $25M face value.",
      revealDelay: 0,
    },
    {
      title: "PLAYER SENTIMENT ALERT",
      content:
        "Three older players spoke to our Player Ties VP off the record. the team gym naming rights feel 'disrespectful to the culture here.' The social media order is the bigger issue. one All-Star said he will not post branded content and will address it in public if needed. This is not a small concern.",
      revealDelay: 12,
    },
    {
      title: "OWNER DIRECTIVE",
      content:
        "Owner memo. 'NovaTech is the right partner for where this team is going. Get this done. We need this revenue to stay strong on payroll. If they walk, it's on you.' The owner has already told his board this deal is happening. He is emotionally committed to closing.",
      revealDelay: 20,
    },
    {
      title: "RIVAL INTELLIGENCE — LIMITED",
      content:
        "League source. two other franchises are in active talks with NovaTech's rivals for comparable deals. If NovaTech walks away from us and closes with a rival, the optics are bad. But, NovaTech's VP of Sponsor deals told our CRO off the record that they prefer our market. this is not a pure auction. We have power we haven't used yet.",
      revealDelay: 24,
      roleOnly: "cro",
    },
  ],

  roles: [
    {
      id: "cro",
      title: "CHIEF REVENUE OFFICER",
      description: "You own all commercial sponsor deals, revenue plan, and BRI reporting.",
      privateInfo:
        "The $25M face value sounds massive. But after BRI sharing, the net to our bottom line is closer to $12.5M/year. That's still meaningful. but it's not $25M. The owner doesn't fully get this math. More importantly. NovaTech told me in private they have a firm $18M floor and would drop the gym naming rights for $20M+. We have real room to talk here.",
    },
    {
      id: "marketing",
      title: "MARKETING DIRECTOR",
      description: "You manage brand identity, player sponsor deals, and social media plan.",
      privateInfo:
        "The 10-post order is a brand killer. Our social content currently drives $3.2M in ancillary revenue from organic brand deals. authenticity is the asset. Forced NovaTech posts will drop engagement by an about 35%. This really undercuts the sponsor's own goal. There's a creative solution. 6 organic-feel posts versus 10 overt ads. NovaTech's promo team would likely accept this. their inside research shows organic blend outperforms hard ads 4:1.",
    },
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You track the trust between revenue and salary cap implications.",
      privateInfo:
        "Sponsor deal revenue doesn't right away affect the salary cap. But it affects the owner's willingness to pay into the luxury tax. Here's the key. if we close this deal at $20M+ net, the owner has said he'll approve going over the luxury tax line to re-sign our limited free agent this summer. If the deal collapses or comes in under $18M, he'll demand we stay under the tax. The sponsor deal choice is also the payroll choice.",
    },
    {
      id: "player-relations",
      title: "PLAYER RELATIONS VP",
      description: "You manage player-plan relationships and locker room climate.",
      privateInfo:
        "Marcus Webb told me right away. 'If they put NovaTech's name on our team gym, I'm asking to be traded.' He's not exaggerating. Three older players echoed this. The social posts are the second issue. our first center has a personal brand agreement with a NovaTech rival. He would be in breach of his own deal if he posts NovaTech content. We have a legal fight that nobody has flagged yet.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "NovaTech is waiting for your reply. How do you plan the deal?",
      options: [
        {
          id: "accept-full",
          label: "Accept all terms — $25M, 5 years",
          description: "Highest locked revenue. Close fast before they look somewhere else. Deal with the player concerns internally.",
          tags: ["accept-full", "revenue-max"],
        },
        {
          id: "negotiate",
          label: "Talk. drop the naming rights, adjust the social order",
          description: "Counter with a changed deal. $20M+, no gym naming, reduce social posts to 6/month.",
          tags: ["negotiate", "balanced"],
        },
        {
          id: "reject",
          label: "Reject the deal — the terms middle ground team culture",
          description: "Walk away. Protect the locker room and brand identity. Find a other partner.",
          tags: ["reject", "culture-first"],
        },
        {
          id: "performance-based",
          label: "Propose a output-based setup — $12M base + upside",
          description: "Minimize locked promises. Upside tied to wins, viewership. All-Star appearances.",
          tags: ["performance-based", "risk-shifted"],
        },
      ],
    },
    {
      id: "terms-negotiate",
      prompt: "NovaTech's VP calls back. They'll drop the naming rights. but they're holding at $22M and want 8 social posts instead of 10.",
      context: "Your counter for $20M and 6 posts got a partial reply. The gap. $2M/year and 2 posts.",
      dependsOnRoundId: "direction",
      dependsOnTag: "negotiate",
      options: [
        {
          id: "accept-22m",
          label: "Accept $22M / 8 posts — close now",
          description: "Strong deal, no naming rights. The social post count is okay. Don't let perfect kill good.",
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
          label: "Propose organic blend — 6 'unbranded' posts at $21M",
          description: "Use the promo insight. organic content outperforms hard ads 4:1. Sell NovaTech on quality over quantity.",
          tags: ["creative-integration", "analytics-forward"],
          requiresStatus: "analytics-forward",
        },
        {
          id: "escalate-to-owner",
          label: "Escalate to the owner — let him close it right away",
          description: "The owner wants this done. Let him make the call on the last $2M.",
          tags: ["escalate-to-owner", "deferred"],
        },
      ],
    },
    {
      id: "terms-accept-full",
      prompt: "Webb's agent calls. Webb is demanding a meeting about the team gym name. Two older players are asking the Player Ties VP for clarity on the social posts.",
      context: "You okayed the full deal. Now you need to manage the player fallout.",
      dependsOnRoundId: "direction",
      dependsOnTag: "accept-full",
      options: [
        {
          id: "stand-firm",
          label: "Stand firm — revenue promises come first",
          description: "The deal is signed. Say the business reality to the players. They'll adjust.",
          tags: ["stand-firm", "revenue-first"],
        },
        {
          id: "offer-exemptions",
          label: "Talk player exemptions. opt-out for individual brand conflicts",
          description: "Work with the players individually. If a player has a trying to win brand deal, we carve them out of the social order.",
          tags: ["offer-exemptions", "player-friendly"],
        },
        {
          id: "renegotiate-social",
          label: "Go back to NovaTech — reduce social posts to 6, same price",
          description: "Use the fight issue as power to soften the order. Keep the $25M.",
          tags: ["renegotiate-social", "balanced"],
        },
      ],
    },
    {
      id: "terms-performance",
      prompt: "The owner calls. He's seen the output-based setup and is angry. 'I need predictable revenue, not a lottery ticket. Either get locked money or kill it.'",
      context: "Your output-based counter got a strong issue from owner.",
      dependsOnRoundId: "direction",
      dependsOnTag: "performance-based",
      options: [
        {
          id: "convert-to-base",
          label: "Convert to a locked base — $15M/yr, 5 years",
          description: "Meet the owner's predictability requirement. Still $10M/yr below the original ask. But clean.",
          tags: ["convert-to-base", "owner-aligned"],
        },
        {
          id: "hybrid-structure",
          label: "Hybrid: $18M base + $5M max upside",
          description: "Middle ground. locked floor with meaningful upside. Pitch it as 'best of both worlds.'",
          tags: ["hybrid-structure", "balanced"],
        },
        {
          id: "walk-away",
          label: "Walk away from the deal entirely",
          description: "If the owner wants locked money and NovaTech wants terms we can't accept, the deal doesn't work.",
          tags: ["walk-away", "no-deal"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["accept-full", "accept-22m"],
    message:
      "RIVAL ALERT. Boston just announced a 5-year, $30M/year jersey patch deal with a rival tech company. the new league record. Your NovaTech deal, at $25M or $22M, is no longer the largest in team history. The owner is calling. He wants to know why you didn't push for more.",
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
          label: "Go back to NovaTech — push for $27M using Boston as power",
          description: "Use the rival announcement as a new data point. The market just moved.",
          tags: ["renegotiate-up", "aggressive"],
        },
        {
          id: "accept-optics",
          label: "Accept the optics — focus on long run culture value",
          description: "Tell the owner the number isn't all this. Steady culture drives long run revenue better than a headline figure.",
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
            "Revenue is up. $25M flows into the balance sheet. Two older players in public grumble about the naming rights. Webb requests a trade meeting. you talk him down. The social media posts perform poorly. NovaTech's inside team is frustrated. Year 1 works financially. The culture cost is real.",
          applyStatus: ["over-luxury-tax", "coach-conflict"],
        },
        {
          probability: 0.50,
          label: "Deal Closed — Legal Fight Set off",
          scoreΔ: 4,
          narrative:
            "Your first center's trying to win brand deal creates a legal dispute. His agent threatens breach-of-deal action against the team. It resolves in 90 days. But the distraction during the season is damaging. The BRI revenue net is $12.5M/year. not the $25M headline.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["accept-full", "offer-exemptions"],
      variants: [
        {
          probability: 0.70,
          label: "Deal Closed — Player Fight Managed",
          scoreΔ: 8,
          narrative:
            "The exemption carve-outs resolved the legal fight and quieted the loudest older players. NovaTech okayed the changed social terms. Revenue is in. The locker room okayed it as a reasonable middle ground. Good follow-through on a messy case.",
          applyStatus: ["over-luxury-tax"],
        },
        {
          probability: 0.30,
          label: "Deal Closed — Sponsor Satisfaction Low",
          scoreΔ: 5,
          narrative:
            "NovaTech's inside team is frustrated. the exemptions reduced their social reach by 40%. They started early conversations about not renewing in Year 3. The revenue is here now. the future is uncertain.",
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
            "No naming rights. $22M/year, 8 posts. Players okayed it. the gym stays ours. The social posts are okay. Net BRI value. ~$11M/year. A genuine win on terms that don't damage the culture.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.20,
          label: "Deal Closed — Owner Disappointed",
          scoreΔ: 6,
          narrative:
            "$22M vs. $25M. the owner sees $3M/year left on the table. He signs off but makes a note. When the Boston deal headlines come out at $30M, you'll feel this gap.",
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
            "They came back at $20.5M and 6 posts. Close enough. No naming rights. Players are happy. Net BRI ~$10.3M/year. You negotiated from strength, got what you wanted. guarded the culture. Best outcome.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.40,
          label: "NovaTech Walks — No Deal",
          scoreΔ: 3,
          narrative:
            "They took their budget to a rival market. The owner is furious. You held too long on a deal that had room to close. No revenue, no deal, no other option ready.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["negotiate", "creative-integration"],
      variants: [
        {
          probability: 1.0,
          label: "Organic Blend Deal — Best-in-Class",
          scoreΔ: 10,
          narrative:
            "NovaTech's VP of Promo loved it. '6 premium organic integrations beat 10 ads every time.' Closed at $21M. No naming rights. Players didn't even notice the posts. NovaTech's CMO is presenting the blend plan at a promo conference. This is a case study.",
          applyStatus: ["high-morale", "analytics-forward"],
        },
      ],
    },
    {
      roundTagCombo: ["reject"],
      variants: [
        {
          probability: 1.0,
          label: "No Deal — Culture Guarded",
          scoreΔ: 3,
          narrative:
            "Players respected it. The owner didn't. You left $12.5M/year in net BRI revenue on the table. The following off-season, the owner declined to cross the luxury tax line to re-sign a key limited free agent. The roster gap is right away connected to this revenue shortfall.",
          applyStatus: ["cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["performance-based", "convert-to-base"],
      variants: [
        {
          probability: 0.65,
          label: "Base Deal Closed — Owner Happy",
          scoreΔ: 7,
          narrative:
            "$15M/year locked. No gym naming, changed social terms. The owner gets predictability. Net BRI ~$7.5M/year. Not the headline deal. But clean and durable. NovaTech renewed after Year 2.",
          applyStatus: [],
        },
        {
          probability: 0.35,
          label: "Base Deal — Sponsor Questions Value",
          scoreΔ: 5,
          narrative:
            "$15M/year. NovaTech's board flagged it as below-market within 18 months. They set off an exit clause in Year 3. You're back to zero sponsor deal revenue with one year of experience talking bad deal terms.",
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
            "Team made the playoff run. Set off $4.5M of the $5M upside. Total Year 1. $22.5M. Owner loves it. NovaTech loved it more. the playoff run made their brand content go viral. Setup works when the team wins.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.45,
          label: "Hybrid — Team Misses Playoff run, Upside Not Set off",
          scoreΔ: 5,
          narrative:
            "The base held at $18M. But the $5M upside trigger needed a playoff trip. you ended 9th. NovaTech's board circled the clause and brought it up in Year 2 negotiations. Revenue is below outlook.",
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
        narrative: "A revenue choice was made under complex terms. The team moves forward.",
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
  tagline: "Trade time limit — salary must match.",
  scenario:
    "It's 3 PM on trade time limit day. You're 2.5 games out of a playoff spot. Dallas wants to offload their star wing, Jordan Reeves. $28M this season, one year left. He's averaging 26 points and is exactly what your roster is missing. To match salary under CBA trade rules you must send back 125% of his salary plus $2M. meaning at least $22M outbound. You have a $12M small forward and a $10M backup center who can be combined (aggregated) to hit the line. But taking on Reeves without sending out equal salary triggers Second Apron risk. The clock runs out at 3 PM.",
  scenarioInjections: [
    {
      requiredStatus: "over-luxury-tax",
      prependText: "You're already over the luxury tax line. Absorbing Reeves' $28M without matching salary moves you into Second Apron zone. you lose the right to use mid-level exceptions for three years and can't bundle deals in future trades.",
    },
    {
      requiredStatus: "trade-assets-rich",
      prependText: "You have pick capital from prior trades. This is your moment to weaponize those assets. Dallas is desperate and you have what they want.",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're team again. does a one-year rental on a $28M wing make sense? Unless you see a clear playoff path, every dollar and pick you spend now delays the rebuild.",
    },
    {
      requiredStatus: "star-retained",
      prependText: "With Webb locked in, Reeves would give you a true two-man team office story to sell to free agents. The combination could push you from fringe playoff team to genuine threat.",
    },
  ],
  conceptId: "trade-matching",

  infoCards: [
    {
      title: "TRADE MATCHING RULES",
      content:
        "CBA trade matching rules. when a team is over the salary cap, incoming salary cannot exceed 125% of outgoing salary + $2M. Example. sending out $22M allows you to receive up to $29.5M. Salary mixing allows mixing multiple deals into one outgoing package. Key restriction. teams over the Second Apron ($189M in the current CBA cycle) face extra limits. they cannot bundle deals to take on a player making more than them.",
      revealDelay: 0,
    },
    {
      title: "SECOND APRON STATUS",
      content:
        "Your current payroll. $186.5M. Second Apron line. $189M. Reeves at $28M + current payroll minus outgoing $22M = $192.5M. that puts you $3.5M over the Second Apron. Consequence. you would lose your ability to use the mid-level cap tool, lose the ability to bundle in future trades. your draft pick acquisition rights are limited for 3 years.",
      revealDelay: 10,
    },
    {
      title: "DALLAS'S MOTIVATION",
      content:
        "Dallas wants to clear Reeves' salary to reset their payroll before the off-season. They're in a rebuild. Reeves has asked for a trade. they're complying. Their GM has told two other teams about this deal. There are 4 hours left before the time limit. They need an answer at 2 PM to file the forms in time.",
      revealDelay: 20,
    },
    {
      title: "REEVES MEDICAL FILE — PRIVATE",
      content:
        "Team doctor note. Jordan Reeves had a labrum procedure on his left arm 14 months ago. Recovery was full per official reports. But, our scout's film review shows he has significantly reduced his pull-up jumper from the left side since the surgery. a shot he hit at 41% previously. Other teams will scheme for this in a playoff series. He's not the same player off the left.",
      revealDelay: 24,
      roleOnly: "scout",
    },
  ],

  roles: [
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You are the power on CBA trade mechanics and cap risk.",
      privateInfo:
        "Here's the number nobody's saying out loud. if we cross the Second Apron line, we lose mixing rights for 3 years. That means every future trade, we can only send one deal to match salary. If we plan to be buyers at future deadlines, going over the Second Apron today handicaps us far beyond just this deal. The short-term gain has a very long tail of limits.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You balance win-now stress with long run team health.",
      privateInfo:
        "The owner called me this morning. He said. 'If we miss the playoff run this year by a game or two and you had the chance to make this trade and didn't. that's a bad look. Make the call.' He also said. 'But don't blow up the team for a rental.' Reeves is a one-year rental. he's a free agent this summer. The owner's two sentences are in direct tension with each other.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You rate player quality and long run value.",
      privateInfo:
        "Reeves' arm. I've watched 40 games this year. He's protecting it. The pull-up from the left is gone. he's steering all this right. A good defense coordinator in a playoff series will shade him left relentlessly. He'll shoot 4-for-18 in a closeout game and everyone will say the trade was a mistake. I'm not saying don't do it. I'm saying price it accordingly. This is not the same player we saw 18 months ago.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You run win-chance and asset-value models.",
      privateInfo:
        "Our playoff chance model. current roster at 34% chance to make the play-in, 12% to advance past the first round. With Reeves added. 71% play-in, 38% 1st-round advance. The value is big. But here's the model's other output. Reeves as a free agent this summer projects to receive a 4yr/$108M offer. we cannot afford that if we're over the Second Apron. We get him for 60 regular season games and a playoff run. Then lose him for free to cap-space teams. Run the math on whether that's worth 3 years of limited trade room.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "It's 10 AM. Dallas wants an answer by 2 PM. What is your trade plan?",
      options: [
        {
          id: "aggregate",
          label: "Bundle both deals — send $22M, take $28M",
          description: "Combine the $12M SF and $10M backup center. Legal match. Triggers Second Apron risk. Reeves arrives.",
          tags: ["aggregate", "star-acquisition"],
        },
        {
          id: "add-pick",
          label: "Attach a guarded 2nd-round pick to a single deal",
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
      prompt: "League office confirms the salary match is legal. But your capologist flags the Second Apron risk. Reeves' agent calls. he wants to see a promise from you before he waives his partial trade veto.",
      context: "Trade is structurally ready. Two choices remain. accept the Second Apron results and confirm Reeves is willing.",
      dependsOnRoundId: "direction",
      dependsOnTag: "aggregate",
      options: [
        {
          id: "commit-and-close",
          label: "Commit to Reeves — accept the Second Apron risk",
          description: "The playoff run matters more than 3 years of trade limits. Win now.",
          tags: ["commit-and-close", "win-now"],
        },
        {
          id: "conditional-commitment",
          label: "Commit — but go back to Dallas for a salary sweetener",
          description: "Ask Dallas to take back a small deal to reduce your net payroll increase and get below the Second Apron.",
          tags: ["conditional-commitment", "cap-discipline"],
        },
        {
          id: "pull-back",
          label: "Pull back — Second Apron results are too severe",
          description: "The capologist's numbers changed the calculus. Decline and keep the mixing rights intact.",
          tags: ["pull-back", "long-term"],
        },
      ],
    },
    {
      id: "terms-three-team",
      prompt: "You have two upside third teams. Chicago will absorb $5M of Reeves' salary in exchange for your 2nd-round pick. Portland will absorb $8M for a swap of a future first (top-6 guarded).",
      context: "The three-team setup can keep you off the Second Apron. But each option costs an asset.",
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
          label: "Use Portland — $8M absorbed, costs a top-6 guarded 1st",
          description: "Better salary relief, higher cost. The guarded first is low-risk but real value if you rebuild.",
          tags: ["portland-partner", "asset-cost"],
        },
        {
          id: "abandon-three-team",
          label: "Three-team too complicated. go back to direct trade or stand pat",
          description: "The forms won't clear before 3 PM. Simplify.",
          tags: ["abandon-three-team", "practical"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["aggregate", "three-team"],
    message:
      "RIVAL MOVE. Boston just acquired a comparable wing at the time limit. 2 years left, $24M/year. They're now the betting favorites to come out of the East. Dallas's GM is texting you. 'One other team just called about Reeves. We need your final answer in 30 minutes, not 2 PM.' The clock just moved up.",
    responseRound: {
      id: "rival-response",
      prompt: "The timeline compressed. 30 minutes. Another team is bidding. Do you speed up or hold?",
      options: [
        {
          id: "accelerate",
          label: "Speed up — file the forms now",
          description: "Don't let a rival steal this. Close right away.",
          tags: ["accelerate", "decisive"],
        },
        {
          id: "call-bluff-dallas",
          label: "Call Dallas's bluff. you don't believe the other team is real",
          description: "GMs create urgency artificially. Hold the 2 PM time limit.",
          tags: ["call-bluff-dallas", "composed"],
        },
        {
          id: "increase-offer",
          label: "Increase your offer — add a pick to beat the rival",
          description: "If there's real other teams, outbid them now before you lose Reeves.",
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
            "Reeves arrived with 5 days before the time limit. The team went 11-4 over the final stretch. Made the playoff run as the 5-seed. Lost in 6 in the round two. his arm showed in games 4 and 5. But you made the postseason. The Second Apron limits start next season.",
          applyStatus: ["over-luxury-tax"],
        },
        {
          probability: 0.40,
          label: "Trade Closed — Early Exit",
          scoreΔ: 6,
          narrative:
            "Reeves helped you squeak into the play-in. but his arm was a problem in a 3-game elimination. You're out in the first round. The Second Apron results begin. you gave up two solid lineup players for a four-week playoff run that ended in the play-in.",
          applyStatus: ["over-luxury-tax", "cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["aggregate", "conditional-commitment"],
      variants: [
        {
          probability: 0.65,
          label: "Changed Trade — Under Second Apron",
          scoreΔ: 9,
          narrative:
            "Dallas took back a $4M expiring deal to reduce the net salary increase. You landed under the Second Apron. Reeves came, the team made the playoff run. your trade room is kept. Best core outcome on this path.",
          applyStatus: [],
        },
        {
          probability: 0.35,
          label: "Dallas Refused — Deal Collapsed",
          scoreΔ: 4,
          narrative:
            "Dallas wouldn't take back salary. They had no reason to complicate a simple dump. The conditional counter killed the deal. You stood pat. missed playoff run by a game.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["aggregate", "pull-back"],
      variants: [
        {
          probability: 1.0,
          label: "Stand Pat — Mixing Rights Kept",
          scoreΔ: 5,
          narrative:
            "You guarded the long run cap spot. The current roster missed the playoff run by 1.5 games. The fanbase and owner are frustrated. The capologist was right about the Second Apron. whether the cost was worth it depends on what you do with those trade rights next summer.",
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
            "Chicago absorbed the $5M. You landed $1M under the Second Apron. Reeves arrived in time. You made the playoff run. A 2nd-round pick cost you the deal. but you kept mixing rights for future deadlines. Smart setup.",
          applyStatus: [],
        },
        {
          probability: 0.30,
          label: "Paperwork Didn't Clear",
          scoreΔ: 3,
          narrative:
            "Three-team trades require league office review. It didn't clear before the 3 PM time limit. All three teams missed the window. Reeves stays in Dallas. You miss the playoff run.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["three-team", "portland-partner"],
      variants: [
        {
          probability: 0.75,
          label: "Three-Team Closes — Guarded First Sent",
          scoreΔ: 9,
          narrative:
            "Portland took the top-6 guarded first. The guard makes it low-risk. you ended 5th this year, above the trigger. Reeves arrived. Playoff run made. The guarded pick conveys years from now when you're likely in full title chase. Outstanding deal setup.",
          applyStatus: ["trade-assets-rich"],
        },
        {
          probability: 0.25,
          label: "Guard Triggers — Pick Conveys Early",
          scoreΔ: 6,
          narrative:
            "You ended 7th. outside top 6. The guarded pick conveyed right away to Portland. You traded a real lottery pick for a rental. The trade worked on the court. the asset cost was real.",
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
            "Dallas took the $12M SF + a guarded 2nd-round pick. They didn't need the backup center. The pick sweetened it. You avoided Second Apron risk. Reeves arrived. Playoff run made. One asset spent.",
          applyStatus: [],
        },
        {
          probability: 0.45,
          label: "Dallas Declined — Needs Full Match",
          scoreΔ: 4,
          narrative:
            "Dallas was trying to shed salary, not acquire picks. They needed the matching salary out, not a pick in. Counter rejected. You missed the playoff run by a game and still have both your role players.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["stand-pat"],
      variants: [
        {
          probability: 1.0,
          label: "Standing Pat — Future Kept",
          scoreΔ: 5,
          narrative:
            "You kept the mixing rights. Missed the playoff run by 1.5 games. The owner questioned the choice for 6 weeks. Then acknowledged the Second Apron logic. Next summer, you used the mixing rights to acquire a other star on a multi-year deal. The wait time paid off. later.",
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
        label: "Choice Made Under Stress",
        scoreΔ: 5,
        narrative: "The time limit passed. The team office made a call.",
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
    "Your stats team has identified a five-man bench lineup with a +12.4 net rating over 214 plays this season. the third-best lineup combination in the entire league by this measure. Your first five's net rating over the same period. +3.1. The gap is not noise. But your head coach, Marcus Hill. a 22-year older player with two title rings. calls high-level metrics 'box score fiction invented by people who never laced up.' He has the locker room's trust. You control the team office. Someone has to give.",
  scenarioInjections: [
    {
      requiredStatus: "analytics-forward",
      prependText: "You've already committed to stats culture in this team. This choice will determine whether that promise holds under stress. or collapses when it gets hard.",
    },
    {
      requiredStatus: "coach-conflict",
      prependText: "Your trust with the coach staff is already tight from a previous disagreement. Another stats-driven push could be the breaking point. Tread carefully.",
    },
    {
      requiredStatus: "high-morale",
      prependText: "The locker room trusts you right now. Players are bought in. That capital is your shield if you need to make an uncomfortable call.",
    },
    {
      requiredStatus: "star-retained",
      prependText: "Webb has in public said he 'doesn't care about the numbers as long as we win.' He's a traditionalist. Any stats push will need to be sold carefully to the locker room.",
    },
  ],
  conceptId: "analytics",

  infoCards: [
    {
      title: "LINEUP DATA — STATS DEPT",
      content:
        "Bench lineup. Watts / Torres / Bell / Reyes / Crawford. Net rating. +12.4 per 100 plays over 214 plays. Offensive rating. 119.8 (league rank. 2nd). Defense rating. 107.4 (league rank. 8th). First lineup net rating same period. +3.1. Model trust. 94%. Sample size is statistically big. this is not a small-sample anomaly.",
      revealDelay: 0,
    },
    {
      title: "COACH HILL'S POSITION",
      content:
        "Coach Hill in today's film session. 'I've been watching basketball for 30 years. I know what a good lineup looks like and I know what wins playoff games. This is a regular season lineup against bad defense teams. Run it in the finals and see what happens.' He's not budging on his own. He needs a other kind of talk.",
      revealDelay: 12,
    },
    {
      title: "PLAYER PERSPECTIVE",
      content:
        "Post-practice interview (two players, anonymized). First PG. 'If the numbers say that, the coaches should look at it. I want to win.' First SF. 'If I'm getting benched because of a computer I'm going to have a serious talk with the team office.' The locker room is split.",
      revealDelay: 20,
    },
    {
      title: "HIGH-LEVEL BREAKDOWN — LIMITED",
      content:
        "Why the lineup works (model explanation). the bench unit creates 34% more corner-3 opportunities through off-ball movement. Other teams are forced to hedge on the pick-and-roll, opening driving lanes. The first lineup's weakness. two non-shooters on the floor simultaneously collapses spacing. This is a core roster issue, not a talent issue. The fix is lineup design, not player acquisition.",
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
        "The +12.4 is real but here's what the report didn't fully explain. the bench lineup's advantage is almost entirely against teams ranked 20th or worse defensively. Against top-10 defense units, the net rating drops to +4.1. still positive. But not dominant. If we're making a playoff argument for this lineup, we need to be honest. the edge compresses against elite defense units. I haven't told Coach Hill this yet because it complicates the pitch.",
    },
    {
      id: "gm",
      title: "GENERAL MANAGER",
      description: "You're the team office choice-maker. The coach works for you. technically.",
      privateInfo:
        "Coach Hill has 2 years left on his deal at $8M/year. If you override him and he resigns, you owe him $16M. If you fire him without cause, same $16M. The trust with this coach is also a free agent selling point. two older players signed here in clear terms because Hill was the coach. The stats choice is also a personnel choice.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You manage the owner trust and team culture.",
      privateInfo:
        "The owner called me last week. He read an article about stats-forward franchises and asked. 'Are we falling behind?' He's not asking you to fire Coach Hill. he's asking whether the team is modern. This is also a branding opportunity. 'data-driven team office' is a free agent pitch. How you handle this in public matters as much as the choice itself.",
    },
    {
      id: "scout",
      title: "HEAD SCOUT",
      description: "You rate talent and know how the locker room really thinks.",
      privateInfo:
        "I've been in locker rooms for 18 years. When the team office overrides the coach staff on lineups, players don't see it as stats-forward. they see it as chaos. Three older players have told me in private they'd put 'team calm' on a list of reasons to stay or leave in open market. Coach Hill's trust with the roster is a real asset. If you undermine him on something as visible as lineups, you're trading his power for a lineup edge.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The stats team's report is on Coach Hill's desk. He's ignored it for two weeks. What do you do?",
      options: [
        {
          id: "trust-coach",
          label: "Trust the coach — keep current lineups",
          description: "The coach has rings. Back him in public. Let the season play out.",
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
          label: "Order the lineup change from the team office",
          description: "The data is clear. Issue a order. The coach implements or he resigns.",
          tags: ["mandate-changes", "analytics-first"],
        },
        {
          id: "hire-bridge",
          label: "Hire an stats translator. bring in a data-literate assistant coach",
          description: "Build a bridge between the stats department and coach staff without creating a power fight.",
          tags: ["hire-bridge", "systemic"],
        },
      ],
    },
    {
      id: "terms-share",
      prompt: "Coach Hill sat through the presentation. His reply. 'The numbers are interesting. But I'm not changing my lineup based on a regular season sample. Show me this works against a top-5 defense and then we'll talk.'",
      context: "The coach is engaging with the data but not convinced. He wants playoff-caliber evidence.",
      dependsOnRoundId: "direction",
      dependsOnTag: "share-data",
      options: [
        {
          id: "pilot-program",
          label: "Propose a pilot. run the lineup 8 minutes per game for 2 weeks",
          description: "Give the coach a structured test. Live data against real other teams.",
          tags: ["pilot-program", "evidence-based"],
        },
        {
          id: "deeper-analysis",
          label: "Pull the playoff-defense split data. show him the top-10 defense numbers",
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
      prompt: "Coach Hill hears the order. He calls a player meeting without telling you. Three starters emerge from the meeting and ask for a talk with the team office.",
      context: "The order set off a locker room reply. The players want to be heard.",
      dependsOnRoundId: "direction",
      dependsOnTag: "mandate-changes",
      options: [
        {
          id: "meet-players",
          label: "Meet with the players — explain the data and the reasoning",
          description: "Clear updates over power. Show them the numbers. Earn their buy-in.",
          tags: ["meet-players", "transparent"],
        },
        {
          id: "hold-directive",
          label: "Hold the order. Coach Hill implements or he's reassigned",
          description: "The team office choice stands. No talks with the roster over lineups.",
          tags: ["hold-directive", "authority"],
        },
        {
          id: "pull-back-mandate",
          label: "Pull back the order — revert to collaborative plan",
          description: "The blowback is too big. Walk it back and restart the talk with Coach Hill.",
          tags: ["pull-back-mandate", "de-escalate"],
        },
      ],
    },
    {
      id: "terms-bridge",
      prompt: "You've hired Dr. Keisha Morgan, a data scientist with 8 years of coach experience. She meets with Coach Hill. He accepts her. but wants her role limited to 'input only, no lineup power.'",
      context: "The bridge hire is in place. Now define the power setup.",
      dependsOnRoundId: "direction",
      dependsOnTag: "hire-bridge",
      options: [
        {
          id: "consultation-only",
          label: "Accept input-only. let the trust build organically",
          description: "Trust that good data came in well will earn influence over time.",
          tags: ["consultation-only", "patient"],
        },
        {
          id: "joint-authority",
          label: "Define joint power. Morgan + Hill sign off on lineup choices",
          description: "Formalize the setup. Both voices needed. More tension, more accountability.",
          tags: ["joint-authority", "systemic"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["mandate-changes", "hire-bridge"],
    message:
      "LEAGUE NEWS. Golden State just published a report crediting their new 'stats-first lineup system' for their 12-game win streak. The story is everywhere. Your owner texts you. 'This is exactly what we should be doing. Are we this high-level?' Coach Hill sees the story and calls it 'a publicity stunt.' The national media starts asking your players. 'Does your team office use stats in lineups?'",
    responseRound: {
      id: "rival-response",
      prompt: "The media story is now about stats adoption. How does your team respond in public?",
      options: [
        {
          id: "own-the-narrative",
          label: "Lean in. spot the team as stats-forward in media",
          description: "Use the moment. Say your stats investment in public.",
          tags: ["own-the-narrative", "brand"],
        },
        {
          id: "stay-quiet",
          label: "Stay quiet — don't create stress on the coach mid-season",
          description: "Inside choices stay inside. Media narratives are distractions.",
          tags: ["stay-quiet", "culture-first"],
        },
        {
          id: "coach-leads-response",
          label: "Let Coach Hill respond in public — his voice builds trust",
          description: "If he defends the analytical plan, it lands with more trust than you saying it.",
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
            "Coach Hill's instincts held. The team ended .500 and made the play-in. Post-season review. the lineup data was right but the timing and blend mattered. The coach wasn't wrong to need time. Trust kept.",
          applyStatus: [],
        },
        {
          probability: 0.60,
          label: "Data Was Right — Opportunity Missed",
          scoreΔ: 3,
          narrative:
            "Ended 3 games below .500. The stats team ran the counterfactual. the bench lineup, used properly, projects to 5-6 extra wins. That's the gap between a lottery pick and a playoff run. The data was right. You didn't act on it.",
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
            "Two weeks, 8 minutes per game. The bench lineup went +16 net rating in live action against 6 other teams. Coach Hill called a staff meeting. 'I've been coach this wrong.' By February it was a core lineup. Best of both worlds. his buy-in made it steady.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.25,
          label: "Pilot Fails — Coach Entrenched",
          scoreΔ: 5,
          narrative:
            "The pilot ran against three elite defense units. The net rating dropped to +2.1. Coach Hill called it right away. 'I told you.' He's not wrong. the sample hit bad luck and tough other teams. The data is still right structurally. But you've lost the argument for now.",
          applyStatus: ["coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["share-data", "deeper-analysis"],
      variants: [
        {
          probability: 1.0,
          label: "Full Clear updates — Earned Trust",
          scoreΔ: 9,
          narrative:
            "You showed him all this. including where the edge compresses against elite defense units. Coach Hill respected the honesty. 'You're not trying to sell me something.' He integrated the lineup selectively. full deployment against weaker defense units, conditional against playoff teams. Season win rate improved 11%. Trust intact.",
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
            "He put in under stress. The lineup worked. He never fully trusted it. At the end of the season he told reporters. 'I follow directions.' He didn't re-sign. You lost a title-caliber coach because you pushed too hard too fast.",
          applyStatus: ["coach-conflict"],
        },
        {
          probability: 0.50,
          label: "Coach Resigns Mid-Season",
          scoreΔ: 2,
          narrative:
            "He walked out in February. The assistant coach ended the season. The locker room fractured. Three free agents cited 'team instability' as a reason to look somewhere else in the summer. The lineup numbers were right. The plan was wrong.",
          applyStatus: ["coach-conflict", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["mandate-changes", "meet-players"],
      variants: [
        {
          probability: 0.60,
          label: "Players Get — Culture Stabilizes",
          scoreΔ: 7,
          narrative:
            "The data meeting with players went well. The first SF said. 'I didn't know the numbers were that big.' Lineups adjusted. Coach Hill put in reluctantly but professionally. The lineup produced. The trust with the coach is tight but functional.",
          applyStatus: ["analytics-forward"],
        },
        {
          probability: 0.40,
          label: "Coach Resigns — Players Destabilized",
          scoreΔ: 3,
          narrative:
            "Coach Hill resigned the week after the player meeting. He told the press. 'The team office doesn't trust its coaches.' Three older player players requested trade conversations. You put in the lineup without the coach who built the culture around it.",
          applyStatus: ["coach-conflict", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["mandate-changes", "hold-directive"],
      variants: [
        {
          probability: 0.35,
          label: "Order Holds — Coach Complies",
          scoreΔ: 7,
          narrative:
            "Coach Hill put in the lineup. Barely. The locker room saw the tension. Results were positive on the floor. Two older players opted out of extensions citing 'team office interference in basketball choices.' The lineup worked. The culture cost was real.",
          applyStatus: ["analytics-forward", "coach-conflict"],
        },
        {
          probability: 0.65,
          label: "Coach Resigns — Team Disrupted",
          scoreΔ: 2,
          narrative:
            "He was gone within the week. The team went 6-14 under the interim coach while absorbing the roster disruption. The stats were right. The follow-through destroyed the season.",
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
            "Dr. Morgan spent three months earning Coach Hill's trust. By mid-season she was in every staff meeting. The bench lineup was deployed in 60% of games by February. Steady, collaborative. nobody quit. Sometimes the slow path is the right path.",
          applyStatus: ["analytics-forward"],
        },
        {
          probability: 0.30,
          label: "Bridge Hire — Limited Influence",
          scoreΔ: 5,
          narrative:
            "Input only meant input ignored. Coach Hill appreciated Dr. Morgan personally but changed almost nothing. The bench lineup got 3 minutes per game. Good hire, wrong power setup.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["hire-bridge", "joint-authority"],
      variants: [
        {
          probability: 1.0,
          label: "Joint Power — New Team Model",
          scoreΔ: 9,
          narrative:
            "Coach Hill balked at first. then saw it as distributed accountability, not surveillance. Dr. Morgan and Hill co-designed a lineup framework. The bench lineup ran 12 minutes per game in a structured deployment. Team ended 6th seed. Two free agents cited 'the most thoughtful coach process I've ever been part of' as a reason to sign.",
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
        narrative: "The team office navigated the stats-culture tension and moved forward.",
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
  tagline: "Team player showing fatigue signs.",
  scenario:
    "Your team player, DeShawn Morris. 24 years old, averaging 31.4 points on 38.2 minutes per game. is showing measurable fatigue signs. Fourth-quarter shooting. down 4.8% over the last 12 games. The medical team has flagged 'bilateral plantar fasciitis risk and soft tissue stress indicators'. not a confirmed injury. But a clear warning. Playoff run are 11 games away. The fanbase is selling out every game. The coach wants him on the floor. Morris himself says he's fine. What do you do?",
  scenarioInjections: [
    {
      requiredStatus: "star-retained",
      prependText: "Webb's long run deal means you've already committed to team around a core star player. A soft tissue injury now doesn't just end the season. it potentially ends your title window for two years. Every minute he plays carries team-level risk.",
    },
    {
      requiredStatus: "coach-conflict",
      prependText: "Your trust with the coach staff is already tight. The coach has been vocal about 'trusting his players' and resents team office health mandates. A load plan choice will be fought at every step.",
    },
    {
      requiredStatus: "high-morale",
      prependText: "Team morale is excellent right now. The players trust the process. That goodwill gives you political cover to make an unpopular but smart call. if you use it.",
    },
    {
      requiredStatus: "analytics-forward",
      prependText: "Your stats culture has built trust with the medical team. Their injury models have 94% accuracy on soft tissue risk at this usage level. The data is clear. the ask is whether you act on it.",
    },
  ],
  conceptId: "roster-health",

  infoCards: [
    {
      title: "MEDICAL TEAM ASSESSMENT",
      content:
        "Team doctor Dr. Patel report. Morris is showing grade-1 plantar fasciitis indicators in both feet. common in high-minute players at this point in the season. Not a current injury. About re-injury escalation risk if minutes remain at 38+. 34% chance of soft tissue strain before the end of the regular season. Recommended. reduce to 32-34 minutes per game right away. Other option. full rest for 4-5 games. Then managed return.",
      revealDelay: 0,
    },
    {
      title: "OUTPUT METRICS — LAST 12 GAMES",
      content:
        "Q4 shooting. 43.1% (season avg. 47.9%). Vertical leap measurement (weekly tracking). down 3.1 inches vs. preseason baseline. First-step speed (GPS tracking). down 7%. Points per shot attempt. down 0.8. None of these are injuries. but all of them are measurable degradation steady with late-season fatigue in a high-minute player.",
      revealDelay: 12,
    },
    {
      title: "SEEDING STAKES",
      content:
        "Current standing. 4th seed, 1 game ahead of 5th. Left schedule. 6 home games, 5 road games (including 2 back-to-backs). The gap between 4th and 5th seed changes 1st-round opponent. 4th faces the 5-seed (easier), 5th faces the 4-seed (harder). About win differential if Morris plays 32 vs. 38 minutes over left 11 games. -2.1 wins likely.",
      revealDelay: 20,
    },
    {
      title: "PLAYER PERSPECTIVE — LIMITED",
      content:
        "Morris told team doctor off the record. 'I can feel it in my left foot. It's not bad enough to worry about but it's there.' He told Coach Hill in public. 'I feel great, give me the minutes.' He's protecting his image as an iron man. His agent has called three times this week asking about the medical case. The deal language. if Morris misses 20+ regular season games due to non-injury-related load plan, the team owes a $3M bonus payment.",
      revealDelay: 24,
      roleOnly: "president",
    },
  ],

  roles: [
    {
      id: "physician",
      title: "TEAM PHYSICIAN",
      description: "You are responsible for player health and medical risk review.",
      privateInfo:
        "Plantar fasciitis that progresses from grade-1 to grade-2 during a playoff run is a career-altering injury, not a game-to-game issue. I've seen two team players miss entire playoff runs to this exact injury pathway. My advice is 32 minutes max and no back-to-backs. I cannot force this. but I can tell you the medical risk with complete clarity. at 38+ minutes per game, we are rolling the dice every night.",
    },
    {
      id: "coach",
      title: "HEAD COACH",
      description: "You manage game plan and make in-game minute choices.",
      privateInfo:
        "I've had this talk with DeShawn. He says he's fine. My read. he's trying to win through discomfort. This is what team players do. What I know is this. if I reduce his minutes and we drop 2 seeds, the fanbase will crucify me. If I play him and he gets hurt, they'll say I should have listened to the doctors. Either way, I need the team office to make this call officially so it doesn't land on me alone. I need air cover.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You balance team risk, player ties, and owner expectations.",
      privateInfo:
        "The $3M load plan bonus clause is real. Morris's agent called it out in clear terms. if we sit him for load plan reasons (not injury) for more than 20 games total this season, we owe $3M. We're at 14 games already this season. Sitting him for 5 games this stretch triggers the clause. We'd owe the bonus. I haven't told the coach this yet.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You model win chance and playoff projections.",
      privateInfo:
        "I've run the numbers both ways. At 38 min/game. 71% playoff trip chance. But 34% injury-before-playoff run chance. Likely playoff wins at full health. 2.8 rounds. Likely playoff wins accounting for injury risk. 1.4 rounds. At 32 min/game. 58% playoff trip chance, 94% arrive-healthy chance. Likely playoff wins. 2.4 rounds. The math slightly favors load plan. but it's close enough that it genuinely depends on values, not just chance.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The medical team's advice is on your desk. What is your plan to Morris's workload for the final 11 games?",
      options: [
        {
          id: "hard-limit",
          label: "Hard 32-minute limit — protect the playoff body",
          description: "Formal order. Morris plays no more than 32 minutes per game. Sit all back-to-backs. Doctor's advice followed exactly.",
          tags: ["hard-limit", "health-first"],
        },
        {
          id: "flexible-plan",
          label: "Flexible plan — 34-minute target, coach manages game-to-game",
          description: "Set a target, not a hard cap. Coach adjusts based on game case and Morris's feel.",
          tags: ["flexible-plan", "collaborative"],
        },
        {
          id: "push-through",
          label: "Play through it — Morris says he's fine, trust the player",
          description: "Full minutes. Compete for seeding. Morris is a pro who knows his body.",
          tags: ["push-through", "win-now"],
        },
        {
          id: "full-rest",
          label: "Full rest — sit Morris for 4-5 games, manage return",
          description: "Highest guard. Absorb the record hit now, arrive at playoff run completely healthy.",
          tags: ["full-rest", "long-term"],
        },
      ],
    },
    {
      id: "terms-hard-limit",
      prompt: "Coach Hill pushes back. 'If I sit him and we drop a seed, that's on me in public. I need you to make this official and stand behind it.' Morris's agent calls and raises the load plan bonus clause.",
      context: "The hard limit choice is creating downstream complications.",
      dependsOnRoundId: "direction",
      dependsOnTag: "hard-limit",
      options: [
        {
          id: "public-announcement",
          label: "Make it official. say the load plan protocol in public",
          description: "Take it off the coach's back. Team office owns the choice in public.",
          tags: ["public-announcement", "transparent"],
        },
        {
          id: "pay-bonus",
          label: "Pay the $3M bonus — player wellness over deal language",
          description: "Honor the clause, protect the player, move forward without ambiguity.",
          tags: ["pay-bonus", "player-first"],
        },
        {
          id: "reclassify-rest",
          label: "Classify rest days as minor injury plan. avoid bonus trigger",
          description: "Document the plantar fasciitis findings as the medical basis. Stays under the clause line.",
          tags: ["reclassify-rest", "strategic"],
        },
      ],
    },
    {
      id: "terms-push",
      prompt: "Game 8 of the left 11. Morris comes off the floor after Q3 limping. Medical staff confirms grade-2 plantar fasciitis progression. He can play. it's not a rupture. but every game increases the rupture risk.",
      context: "The injury path the medical team warned about is materializing.",
      dependsOnRoundId: "direction",
      dependsOnTag: "push-through",
      options: [
        {
          id: "shut-down-now",
          label: "Shut him down right away — playoff run are all that matters",
          description: "Stop here. Protect him for the postseason. Accept the regular season results.",
          tags: ["shut-down-now", "health-first"],
        },
        {
          id: "game-time-decisions",
          label: "Game-time choices — Morris and doctor decide each night",
          description: "No blanket shutdown. Rate each game individually.",
          tags: ["game-time-decisions", "flexible"],
        },
        {
          id: "push-to-end",
          label: "Push through the last 3 games — playoff run start next week",
          description: "Three games left. He knows the risk. Let the team player make the call.",
          tags: ["push-to-end", "high-risk"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["push-through", "flexible-plan"],
    message:
      "RIVAL MOVE. The Boston Celtics just announced a league-leading load plan policy. their star plays 30 minutes max for the last 10 games of every regular season, regardless of seeding stakes. Sports media is praising it. Your local beat writer asks you right away. 'Your player is showing fatigue signs. Why isn't he being managed like Boston's star?' The ask is now public.",
    responseRound: {
      id: "rival-response",
      prompt: "The load plan ask is now a public story. How do you respond?",
      options: [
        {
          id: "address-directly",
          label: "Address it right away — say a changed plan in public",
          description: "Take control of the story. Say a plan today.",
          tags: ["address-directly", "transparent"],
        },
        {
          id: "no-comment",
          label: "No comment — player health choices are private",
          description: "Don't engage. The media will move on.",
          tags: ["no-comment", "private"],
        },
        {
          id: "coach-statement",
          label: "Coach Hill makes a statement. 'DeShawn and I decide together'",
          description: "Let the coach handle the public ask. Takes stress off the team office.",
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
            "The announcement landed well. Fans respected the clear updates. Morris dropped from 4th to 5th seed. faced a harder 1st-round opponent. He arrived in the playoff run at full health and averaged 34 points over 5 games. They won the series. The choice held.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.25,
          label: "Load Managed — Seeding Cost Was Real",
          scoreΔ: 6,
          narrative:
            "Dropped to the 5th seed. Drew the 4-seed in round 1. a team with a dominant center. Morris was healthy. But they lost in 5. The counterfactual will haunt the off-season. would the 4th seed matchup have been easier? Probably.",
          applyStatus: [],
        },
      ],
    },
    {
      roundTagCombo: ["hard-limit", "reclassify-rest"],
      variants: [
        {
          probability: 0.80,
          label: "Medical Classification — Smooth Follow-through",
          scoreΔ: 8,
          narrative:
            "The plantar fasciitis documentation was real. it was a real medical finding. Classifying rest days under the medical framework was right and defensible. The bonus clause didn't trigger. Morris arrived healthy. No agent dispute.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.20,
          label: "Agent Disputes Classification",
          scoreΔ: 5,
          narrative:
            "Morris's agent reviewed the documentation and argued the classification was strategic, not purely medical. Filed a grievance. It resolved in the team's favor. the fasciitis was real. but the process created tension with Morris going into a deal year.",
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
            "Coach Hill averaged Morris at 33.4 minutes over the last 11 games. Sat him both back-to-backs. Maintained the 4th seed. Morris entered the playoff run at 96% health by doctor review. The room gave the coach power and produced the right outcome.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.40,
          label: "Flexible Plan — Coach Played Him Too Much",
          scoreΔ: 5,
          narrative:
            "The flexible target became a floor, not a ceiling. Morris averaged 36.1 minutes because the coach couldn't bring himself to bench the star in close games. Fasciitis worsened. He played in the playoff run but was clearly limited in rounds 1 and 2.",
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
            "The grade-2 diagnosis was the wake-up call. Three games rest before the playoff run. Morris arrived at 91%. not 100%. But stable. 1st-round win. The injury scare changed the team's plan to load plan permanently.",
          applyStatus: [],
        },
        {
          probability: 0.30,
          label: "Too Late — Grade-3 Risk in Round 1",
          scoreΔ: 3,
          narrative:
            "Three games rest helped but wasn't enough. The grade-2 fasciitis progressed during Game 3 of the first round. He ended the game. but missed Game 4 and 5. Out in the first round.",
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
            "He played through it. Grade-2 held. Made it to the playoff run. Won the first round. The medial doctor was right about the risk. you got lucky. Morris knows what he put his body through. This talk will come up in every future deal talks.",
          applyStatus: [],
        },
        {
          probability: 0.70,
          label: "Grade-3 Rupture — Season Over",
          scoreΔ: 1,
          narrative:
            "Game 9. Routine drive to the basket. he went down. Plantar fascia rupture. Season over. The medical team's risk review was right. 34% regular season injury chance given continued high minutes. You were in that 34%.",
          applyStatus: ["rebuild-mode", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["full-rest"],
      variants: [
        {
          probability: 0.80,
          label: "Full Rest — Playoff run at 100%",
          scoreΔ: 8,
          narrative:
            "Sat 5 games. Team went 2-3 without him. dropped to the 5th seed. Morris returned for the last 6, team rhythm. Entered the playoff run fully healthy. Averaged 36 points over 4 playoff games. The record cost was real. the playoff payoff was real too.",
          applyStatus: ["high-morale"],
        },
        {
          probability: 0.20,
          label: "Full Rest — Missed Playoff run",
          scoreΔ: 3,
          narrative:
            "The 5-game absence cost more seeds than likely. Team ended 9th. out of the play-in. Morris was 100% healthy for a lottery finish. The medical choice was correct. The timing was catastrophic.",
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
        narrative: "The team office made a health plan call. Results follow.",
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
    "It's draft night. You hold the #6 pick. The war room is split. Your scouting department loves Mateo Silva. a 19-year-old Brazilian wing who spent two years in the Euroleague. Polished, NBA-ready, pro, ceiling probably a 15-ppg starter. Your stats model. With 94% trust, projects Damien Cole. a 20-year-old guard from a mid-major. as a top-15 player by Year 3. Scouts rank Cole #14. The model ranks him #4. You have 10 minutes before you're on the clock. One bad pick at #6 can define a team for a decade.",
  scenarioInjections: [
    {
      requiredStatus: "rebuild-mode",
      prependText: "You're in rebuild mode. This pick is your centerpiece. not a complement to a star. But the foundation you're team from. The wrong choice here sets the rebuild back three years.",
    },
    {
      requiredStatus: "analytics-forward",
      prependText: "Your stats culture has established trust. The model's track record is strong. The ask isn't whether to trust data. it's how much you trust it under Draft Night stress.",
    },
    {
      requiredStatus: "trade-assets-rich",
      prependText: "You have draft capital stockpiled. A trade-up or trade-down is genuinely on the table. you're not forced to stay at #6. Other teams are calling.",
    },
    {
      requiredStatus: "star-retained",
      prependText: "With Webb locked in, this pick needs to complement an established star. not become one independently. Fit matters as much as ceiling.",
    },
  ],
  conceptId: "rookie-scale",

  infoCards: [
    {
      title: "SCOUTING REPORT — MATEO SILVA (#6 CONSENSUS)",
      content:
        "Age. 19. Euroleague stats. 16.2 pts, 5.8 reb, 2.1 ast on 47% FG. NBA comparison. defense-minded 3-and-D wing with real All-Defense upside. Three NBA scouts independently listed him as their #5-7 prospect. Medical clearance. clean. Character. high. disciplined, team-first, pro. Ceiling. 15-17 ppg starter, defense anchor. Floor. lineup player. Chance of becoming an All-Star. 12%. Chance of 10+ year NBA career. 88%.",
      revealDelay: 0,
    },
    {
      title: "STATS REPORT — DAMIEN COLE (MODEL RANK #4)",
      content:
        "Age. 20. Mid-major stats. 28.4 pts, 6.1 ast, 47.2% FG, 41.8% 3P on 7.4 attempts. Model inputs. shot quality (95th rank level), off-ball movement efficiency (97th rank level), pick-and-roll choice-making (91st rank level). Model output. 94% trust in top-15 player by Year 3. Scout consensus rank. #14. Sample-size note. mid-major other teams is a big limitation. model adjusts. But uncertainty range is wide.",
      revealDelay: 12,
    },
    {
      title: "TRADE OFFER — LIVE",
      content:
        "Memphis just called. they'll give us #12 + their 2026 1st-round pick (top-8 guarded) for #6. That's two lottery-range assets instead of one. If we trade down to #12, both Cole and Silva will be open. If we stay at #6, we control the pick but lose the extra asset.",
      revealDelay: 20,
    },
    {
      title: "DEAL SCALE — FOR YOUR REFERENCE",
      content:
        "Rookie scale at #6. Year 1 base ~$9.8M (120% of scale), Years 2-3 escalate ~8%/year. Team runs Years 1-4 via standard rookie scale. Team choice year in Year 3 and Year 4. Max rookie new deal rules at Year 4 completion. Cost-controlled talent for 4 years. A team core star pick here is the most efficient salary spend in basketball.",
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
        "I've watched Cole 12 times this year. The production is real. but mid-major other teams is a real concern. Three of his top 20 games came against teams that are D-League level defensively. When we arranged an elite-level workout, his speed against NBA-caliber defenders dropped noticeably. I still think he's a good player. I just don't think he's top-5 in this draft. The stats model didn't watch those workouts. I did.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You built the player outlook model. You get what the data says.",
      privateInfo:
        "The Cole model output is our strongest advice in three years. The shot quality and off-ball efficiency metrics are steady across every level of other teams we can measure. those skills transfer. The mid-major concern is real but overstated. our model adjusts for other teams level. What I can't model is a prospect's reply to NBA stress, coach systems. injury. Those are human variables. The model says Cole. but someone in that room has to own the non-model risks.",
    },
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You manage the salary cap. Draft picks are your best cost-controlled assets.",
      privateInfo:
        "The Memphis trade offer is the most interesting part of this choice. If we trade to #12 and Cole is still there, we pick him AND keep the Memphis 2026 first. Two assets instead of one at essentially the same cost. The risk. Cole gets taken before 12. Teams with picks at 7, 9. 11 are all upside Cole suitors if word gets out that our model likes him. The trade window closes when we're on the clock.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You work with with owner and manage the team's long run direction.",
      privateInfo:
        "The owner told me before the draft. 'I want a player the fans will love. I don't want another lineup player.' That rules out the safe ceiling of Mateo Silva in his mind. He's read about Cole. the stats darling story. He wants the bold pick. But if Cole is a bust, the owner's instinct will be to blame the stats team, not himself. That's the political reality. The bold pick needs to be the right bold pick.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "You have 10 minutes. The war room is waiting. What is your draft plan?",
      options: [
        {
          id: "take-silva",
          label: "Take Mateo Silva at #6 — scout consensus, NBA-ready",
          description: "Trust the scouts. 88% chance of a 10-year career. Reliable, pro, proven at a high level.",
          tags: ["take-silva", "scout-consensus"],
        },
        {
          id: "take-cole",
          label: "Take Damien Cole at #6 — trust the model",
          description: "The stats case is the strongest we've had in years. High swings but top-15 upside.",
          tags: ["take-cole", "analytics-pick"],
        },
        {
          id: "trade-down",
          label: "Accept Memphis's trade — #12 + guarded 2026 first",
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
      prompt: "The stats team presents one more data point. Cole's 3-point percentage this year came almost entirely from the left corner. 89 of his 143 made threes. His shot chart shows a weak right-wing number (31%). Is this a flaw or a fixable habit?",
      context: "Your stats lead has flagged a shot chart pattern just before the pick.",
      dependsOnRoundId: "direction",
      dependsOnTag: "take-cole",
      options: [
        {
          id: "proceed-cole",
          label: "Proceed. the shot chart pattern is fixable with NBA coach",
          description: "The model accounts for this. Skill refinement is part of development. Take Cole.",
          tags: ["proceed-cole", "analytics-trust"],
        },
        {
          id: "pivot-silva",
          label: "Last-second pivot — take Silva instead",
          description: "The shot chart pattern changes your trust. Lock in the safer pick.",
          tags: ["pivot-silva", "scout-deference"],
        },
        {
          id: "call-trade-now",
          label: "Call Memphis now — trade to #12 with this new info",
          description: "New information changes the calculus. Take the two assets, rate at 12.",
          tags: ["call-trade-now", "asset-accumulation"],
        },
      ],
    },
    {
      id: "terms-trade",
      prompt: "Memphis accepts. You're now at #12. Cole is still on the board. but so are two other teams between you and Cole (picks 10 and 11). Both teams are reportedly interested in guards.",
      context: "You traded down. Cole is open but potentially not for long.",
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
          label: "Take Silva at #12. he's probably still there and the value holds",
          description: "Safe pick at lower cost. Three assets in the vault (Silva + Memphis 2026 first).",
          tags: ["take-silva-at-12", "scout-consensus"],
        },
        {
          id: "best-available",
          label: "Best open at #12. whoever the board says at that moment",
          description: "Trust the big board. Don't force either player. take the best value at that pick.",
          tags: ["best-available", "disciplined"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["take-cole", "trade-up"],
    message:
      "WAR ROOM ALERT. Golden State just moved up to #5. one pick ahead of you. Our intel. they're targeting Cole. You have 6 minutes left on the clock and Golden State is filing the trade forms now. If Cole is their target, he's gone before you pick.",
    responseRound: {
      id: "rival-response",
      prompt: "Golden State is at #5 and may be targeting Cole. How do you respond?",
      options: [
        {
          id: "call-gs-bluff",
          label: "Call it a bluff — stay at #6, trust Cole will be there",
          description: "GMs create smoke. Golden State needed a other spot. Stay calm.",
          tags: ["call-gs-bluff", "composed"],
        },
        {
          id: "emergency-trade-up",
          label: "Emergency call to #4. offer our 2026 first to jump Golden State",
          description: "If Cole is worth #4, that's still a steal at the model's valuation.",
          tags: ["emergency-trade-up", "aggressive"],
        },
        {
          id: "pivot-silva-gs",
          label: "Pivot to Silva — Cole risk is now even higher",
          description: "If Golden State wants Cole, either they know something we don't. Or the pick gets more expensive to move up for. Take Silva at 6.",
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
            "Year 1. 11 points, 4 rebounds, solid defense. Year 2. earned a first spot. Year 3. 15 points, 2nd-team All-Defense. Exactly what the scouts likely. Cole went #9. averaged 22 in Year 3 and made the All-Star team. The safe pick was good. The model was also right.",
          applyStatus: ["scout-trusted"],
        },
        {
          probability: 0.20,
          label: "Silva — Injury Derails Path",
          scoreΔ: 4,
          narrative:
            "ACL in Year 2. He came back in Year 3 but wasn't the same player. The scouts were right about his profile. the injury risk they couldn't project was the variable that mattered. Cole, taken at #9, averaged 24 in Year 3.",
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
            "Year 1. 16 points, learning the system. Year 2. 22 points, 7 assists, first All-Star selection. The shot chart flaw was corrected by November. The model was right. The scouts will recalibrate. This pick defines the team for a decade.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.40,
          label: "Model Miss — Cole Averages Out",
          scoreΔ: 4,
          narrative:
            "The shot chart issue wasn't fixable. The right-wing jumper never developed. He's a solid 16-ppg player. not a bust, not a star. The scouts' range of outcomes was more right than the model's top-15 outlook. Silva, taken at #9 by Memphis, made his first All-Star game in Year 3.",
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
            "You pivoted at the last second. Silva went out and proved the scouts right. Cole, taken at #11, developed into a very good player. but the shot chart concern proved real. his ceiling was 18 ppg, not top-15. Your pivot may have been right.",
          applyStatus: ["scout-trusted"],
        },
        {
          probability: 0.25,
          label: "Model Was Right — Regret Follows",
          scoreΔ: 3,
          narrative:
            "Cole became an All-Star at #11. The shot chart concern that set off the pivot was fixed by his NBA shooting coach in October. You watched him develop every year from the bench. The model had it right.",
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
            "Cole fell to 12. The model was validated. Year 3 All-Star. You also have the Memphis 2026 first. This landed top 8 and hit the guard. Two real assets in the vault. This is how you build a dynasty.",
          applyStatus: ["analytics-forward", "trade-assets-rich"],
        },
        {
          probability: 0.45,
          label: "Cole Gone Before #12",
          scoreΔ: 5,
          narrative:
            "Portland took Cole at #10. You ended up with your best open at 12. a solid pick, not a star. Memphis first is still in the vault. You got two solid assets for the price of giving up a upside team pick.",
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
            "Silva was still there at 12. You got him at a discount and kept the Memphis future first. Three assets total (Silva + Memphis 2026 first that you already had). A solid team again haul. Silva becomes a starter. The future first hits at pick 7.",
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
            "The move to #4 worked. Cole went to you. Golden State had been targeting a center at #5. the Cole bluff was real. You gave up a future first but secured the model's top target. Year 3 All-Star. The cost was real but proportionate.",
          applyStatus: ["analytics-forward"],
        },
        {
          probability: 0.30,
          label: "Moved Up — Cole Wasn't Golden State's Target",
          scoreΔ: 6,
          narrative:
            "Golden State took a center. Cole would have been there at #6. You paid a future first to jump one spot unnecessarily. Cole became a star. the pick was right, the follow-through cost extra.",
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
  tagline: "The owner wants your 3-year plan.",
  scenario:
    "End of season. The owner has called a private meeting in the Owner Suite. Your team narrowly missed the playoff run. lost the final play-in game by 4 points. You have one All-Star under deal (2 years left), two 1st-round picks in your vault. a 14-man roster with 4 lineup-caliber players. The league is in transition. 7 of the last 10 finalists were built through stats-forward drafting, not star open market. The owner asks. 'Give me your 3-year vision. What does this team look like in Year 3?' Your answer defines all this. staff, plan, budget. your own job safety.",
  scenarioInjections: [
    {
      requiredStatus: "star-retained",
      prependText: "Webb's deal. the deal you made in the Cap Room. is the north star of your 3-year plan. Every choice flows from protecting and team around him. The owner knows what you have. Now he wants to know what you do with it.",
    },
    {
      requiredStatus: "analytics-forward",
      prependText: "You've built an stats culture inside this team. Your data systems, your model-driven choices, your coach plan. it's all on the line in this room. Defend it or evolve it.",
    },
    {
      requiredStatus: "rebuild-mode",
      prependText: "You gave up stars for assets. You traded short-term output for long run equity. Now you have to show the owner the rebuild is working. and that you have a clear path to the other side.",
    },
    {
      requiredStatus: "over-luxury-tax",
      prependText: "The luxury tax bills have been real. The owner has paid them. Now he's asking whether it was worth it. and whether you have a plan to avoid the repeater costs that loom.",
    },
    {
      requiredStatus: "coach-conflict",
      prependText: "The tension with the coach staff has leaked into the press. The owner is aware of it. He's going to ask about it, right away or indirectly. You need a spot on leadership calm.",
    },
    {
      requiredStatus: "high-morale",
      prependText: "Player morale has been a strength under your tenure. The locker room trusts you. That culture is a real asset the owner can see in practice. use it as evidence of your leadership.",
    },
  ],
  conceptId: "front-office-philosophy",

  infoCards: [
    {
      title: "TEAM ASSET INVENTORY",
      content:
        "Under deal. Marcus Webb (All-Star PG, 2 years/$48M left). Picks. own 2026 first (top-4 guarded) + Memphis 2026 first (open). Cap space. $8M open below the tax line. Young players on rookie deals. 2 lineup-caliber, 2 developmental. Current payroll. $148M. Luxury tax line. $171M. You have $23M of tax headroom for free agent additions.",
      revealDelay: 0,
    },
    {
      title: "LEAGUE LANDSCAPE",
      content:
        "Last 10 Finals participants. how they were built. 7 via stats-forward drafting and development. 2 via superstar open market (both needed 3+ years of prior team again to have cap space). 1 via trade (assets accumulated over 4 years of rebuild). The era of 'star open market as primary plan' has a 20% success rate in the current CBA. The era of 'draft and develop' has a 70% Finals trip rate when executed with wait time.",
      revealDelay: 12,
    },
    {
      title: "OWNER'S STATED PRIORITIES",
      content:
        "Owner's opening statement. '1. I want a playoff team every year Webb is here. that's the non-negotiable. 2. I want to get how choices are made in this team. stats, scouting, both? 3. I want a plan that doesn't blow up if one thing goes wrong.' He did not mention a spending ceiling in this meeting. That's notable.",
      revealDelay: 20,
    },
    {
      title: "STRONG INTELLIGENCE — LIMITED",
      content:
        "Two rival GMs have been given permission to pursue Webb in a sign then trade when his deal expires. One has a war chest of 3 future firsts. Our power. we're the only team that can offer him a max deal new deal. $47.6M/year. before he hits open market. If we extend Webb now at max deal, we control his career for 5 more years. If we let him reach open market, we lose that power permanently. The owner doesn't know the new deal window closes in 60 days.",
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
        "Here's what I know that the owner doesn't. my job safety is right away tied to Year 1 output, not Year 3. If I pitch a rebuild, I'm likely gone in Year 2 when we're at the bottom of the standings. even if the rebuild is the right call. My incentive is to pitch 'win now' even if the long run answer is wait time. I need to be honest with myself about whether my plan serves the team or my deal.",
    },
    {
      id: "president",
      title: "TEAM PRESIDENT",
      description: "You have the owner's long run trust. You're in this meeting to support or challenge the GM.",
      privateInfo:
        "The Webb max deal window closes in 60 days. If the GM's 3-year plan involves Webb leaving or being traded, we need to have that talk with the owner today. not in 61 days when the option is gone. Whatever vision the GM pitches, the Webb new deal ask has to be answered as part of this meeting.",
    },
    {
      id: "analytics",
      title: "ANALYTICS LEAD",
      description: "You model long run strong outcomes.",
      privateInfo:
        "I've run 3-year playoff chance models for each strategic path. Rebuild path (trade Webb, accumulate assets). 18% Year 1 playoff, 45% Year 2, 72% Year 3. Hybrid path (extend Webb, add stats-sourced players). 62% Year 1, 68% Year 2, 71% Year 3. Win-now path (trade picks for older players). 74% Year 1, 52% Year 2, 31% Year 3. The hybrid path has the most steady floor. The win-now path wins the first year and deteriorates. The rebuild path is painful but lands in the same place as hybrid by Year 3.",
    },
    {
      id: "capologist",
      title: "CAPOLOGIST",
      description: "You model the financial implications of each path.",
      privateInfo:
        "The rebuild path generates $40M+ in cap room by Year 2. enough to pursue any free agent in the league. The hybrid path keeps us in the luxury tax vicinity but preserves Webb's prime years. The win-now path crosses the Second Apron in Year 1 if we pursue older players with our picks. which eliminates our ability to bundle future trades. Financially, win-now is the most expensive path and the least recoverable if it fails.",
    },
  ],

  rounds: [
    {
      id: "direction",
      prompt: "The owner is waiting for your 3-year vision. What is your answer?",
      options: [
        {
          id: "controlled-rebuild",
          label: "Controlled rebuild — accumulate assets, compete in Year 3",
          description: "Trade picks for older players? No. Build through the draft, clear bad deals, let the young core lead. Strong by Year 3.",
          tags: ["controlled-rebuild", "patient"],
          mutations: [
            {
              ifStatus: "rebuild-mode",
              labelSuffix: " ★ HONOR YOUR PATH",
              descriptionPrefix: "You've already made the hard trades to get here. Staying the course is the honest answer.",
            },
            {
              ifStatus: "star-retained",
              descriptionPrefix: "NOTE. A rebuild vision is hard to square with Webb's prime years still on the books. You'll need to address the contradiction.",
            },
          ],
        },
        {
          id: "hybrid-build",
          label: "Hybrid. extend Webb, add stats-sourced players via draft",
          description: "Keep Webb, use the picks intelligently, invest in a modern stats systems. Compete every year.",
          tags: ["hybrid-build", "balanced"],
          mutations: [
            {
              ifStatus: "star-retained",
              labelSuffix: " ★ CONTINUITY PLAY",
              descriptionPrefix: "You built around Webb in the Cap Room. Now you complete the picture around him. This is the natural continuation of that bet.",
            },
            {
              ifStatus: "analytics-forward",
              descriptionPrefix: "Your stats culture is already in place. This path is the fullest expression of all this you've built.",
            },
          ],
        },
        {
          id: "win-now",
          label: "Win now — max free agent pursuit, trade picks for older players",
          description: "Go all-in while Webb is in his prime. Trade the picks. Sign a max free agent. Year 1 title chase.",
          tags: ["win-now", "aggressive"],
          mutations: [
            {
              ifStatus: "over-luxury-tax",
              labelSuffix: " ⚠ CAP CONSTRAINTS",
              descriptionPrefix: "WARNING. You're already over the luxury tax. Going all-in means going over into Second Apron zone. you lose future trade room permanently.",
            },
            {
              ifStatus: "star-retained",
              labelSuffix: "★ STRIKE WHILE WEBB IS PRIME",
              descriptionPrefix: "Webb's window is open. This is the case for urgency. Use his prime years now.",
            },
            {
              ifStatus: "trade-assets-rich",
              descriptionPrefix: "You have pick capital to spend. The win-now path has actual fuel behind it this time.",
            },
          ],
        },
        {
          id: "analytics-transformation",
          label: "Full stats transformation. rebuild choice-making from the ground up",
          description: "Invest in stats systems as the primary strong advantage. Fewer emotions, more models.",
          tags: ["analytics-transformation", "systemic"],
          mutations: [
            {
              ifStatus: "analytics-forward",
              labelSuffix: " ★ DOUBLE DOWN",
              descriptionPrefix: "You've already been moving in this direction. This is the full promise. no hedging.",
            },
            {
              ifStatus: "coach-conflict",
              descriptionPrefix: "NOTE. A full stats transformation will require resolving the coach tension first. The two visions are incompatible.",
            },
          ],
        },
      ],
    },
    {
      id: "terms-rebuild",
      prompt: "The owner responds. 'A rebuild means Webb walks when his deal is up. He's the face of this team. How do you retain him or replace him?' The president flags. the max deal new deal window closes in 60 days.",
      context: "The rebuild vision has a Webb-shaped problem.",
      dependsOnRoundId: "direction",
      dependsOnTag: "controlled-rebuild",
      options: [
        {
          id: "extend-webb-rebuild",
          label: "Extend Webb now — rebuild around him as the core",
          description: "Max deal new deal before the window closes. He's the rebuild anchor. Build the roster around him.",
          tags: ["extend-webb-rebuild", "star-anchor"],
        },
        {
          id: "trade-webb",
          label: "Trade Webb — highest asset return, full rebuild",
          description: "If you're team again, get assets for Webb before he hits open market and walks for nothing.",
          tags: ["trade-webb", "full-rebuild"],
        },
        {
          id: "let-window-close",
          label: "Let the new deal window close — talk as a free agent",
          description: "No max deal. Talk a market deal when he's a free agent. Retain cap room.",
          tags: ["let-window-close", "cap-flexibility"],
        },
      ],
    },
    {
      id: "terms-hybrid",
      prompt: "The owner asks. 'What does the stats investment look like in clear terms? Are we replacing scouts or adding to them?' You need to define the model.",
      context: "The hybrid vision requires defining the team setup.",
      dependsOnRoundId: "direction",
      dependsOnTag: "hybrid-build",
      options: [
        {
          id: "analytics-plus-scouts",
          label: "Stats and scouting together. parallel tracks, equal power",
          description: "Two inputs, no hierarchy. Both have veto power on major choices. Fight is productive.",
          tags: ["analytics-plus-scouts", "dual-model"],
        },
        {
          id: "analytics-primary",
          label: "Stats as primary — scouts as context layer",
          description: "Model makes the call. Scouts add human nuance. Stats leads all major choices.",
          tags: ["analytics-primary", "data-driven"],
        },
        {
          id: "scouts-primary",
          label: "Scouts as primary — stats as verification",
          description: "Traditional evaluation leads. Stats validates or challenges. Human judgement at the center.",
          tags: ["scouts-primary", "traditional"],
        },
      ],
    },
    {
      id: "terms-win-now",
      prompt: "The capologist flags. trading both picks + pursuing a max free agent puts you over the Second Apron in Year 1. You lose mixing rights for 3 years. The stats lead's model shows a 31% playoff chance by Year 3 on this path.",
      context: "The win-now vision has serious long run core costs.",
      dependsOnRoundId: "direction",
      dependsOnTag: "win-now",
      options: [
        {
          id: "accept-second-apron",
          label: "Accept the Second Apron — win now is the order",
          description: "The owner said playoff run every year Webb is here. That's the priority. Execute the plan.",
          tags: ["accept-second-apron", "short-term"],
        },
        {
          id: "modify-win-now",
          label: "Modify the plan — trade one pick, keep the other",
          description: "Half-measure. Stay off the Second Apron. Less immediate firepower but some future kept.",
          tags: ["modify-win-now", "balanced"],
        },
        {
          id: "pivot-from-win-now",
          label: "Pivot — the capologist's math changed your mind",
          description: "You present a changed hybrid vision. The win-now path is too expensive for too short a window.",
          tags: ["pivot-from-win-now", "analytical"],
        },
      ],
    },
  ],

  rivalCounter: {
    triggerTags: ["win-now", "hybrid-build"],
    message:
      "LEAGUE NEWS. Boston just completed a blockbuster sign then trade, landing a second max player. their core is locked for 5 years. Three other top-8 teams have made big off-season moves. Your local beat writer publishes. 'While rivals improve, [Your Team] is still searching for a 3-year direction.' The owner forwards you the article with one word. 'Respond.'",
    responseRound: {
      id: "rival-response",
      prompt: "Rival moves are accelerating the timeline. The owner wants a reply to the media story. What do you do?",
      options: [
        {
          id: "accelerate-plan",
          label: "Speed up the plan. say a major move to change the story",
          description: "Trade the open Memphis first for a win-now piece. Show the market you're moving.",
          tags: ["accelerate-plan", "reactive"],
        },
        {
          id: "stay-the-course",
          label: "Stay the course. say the plan clearly and resist stress",
          description: "Knee-jerk choices are how you end up with bad deals. Trust the 3-year vision.",
          tags: ["stay-the-course", "disciplined"],
        },
        {
          id: "owner-press-conference",
          label: "Have the owner speak — team calm message",
          description: "The owner in public endorses the plan. Team office trust is re-established via his power.",
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
            "Webb went to LA via sign then trade. three open firsts back. Two seasons of pain. Year 3. you have 4 cost-controlled players, cap space. three lottery picks in the vault. A free agent max target chose you because of the clarity of the vision. The city forgave the rebuild. The plan worked.",
          applyStatus: ["trade-assets-rich", "rebuild-mode"],
        },
        {
          probability: 0.35,
          label: "Rebuild — Slower Than Likely",
          scoreΔ: 4,
          narrative:
            "Webb left. The picks underperformed. Year 3. still team again. The GM who pitched this vision was let go after Year 2. His successor inherited the assets and later made it work. in Year 5, not Year 3.",
          applyStatus: ["rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["controlled-rebuild", "extend-webb-rebuild"],
      variants: [
        {
          probability: 0.70,
          label: "Webb Kept longer — Team again With a Star",
          scoreΔ: 8,
          narrative:
            "Kept longer Webb before the window closed. Built around him. stats-sourced picks, cost-controlled talent. Year 3. playoff team with Webb as the older player anchor and two young stars around him. Best of both worlds.",
          applyStatus: ["star-retained", "high-morale"],
        },
        {
          probability: 0.30,
          label: "Webb Kept longer — Team again Stalls",
          scoreΔ: 5,
          narrative:
            "Kept longer Webb but the picks didn't hit. He's unhappy playing on a non-strong team. Year 3. he's requesting a trade. The max deal new deal becomes a trade asset, not a core star.",
          applyStatus: ["star-retained", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["hybrid-build", "analytics-plus-scouts"],
      variants: [
        {
          probability: 0.75,
          label: "Hybrid Model — Steady Title chase",
          scoreΔ: 10,
          narrative:
            "The dual-power setup created productive tension. Stats found two overlooked players. Scouts validated them. Webb was kept longer and anchored the system. Year 3. 2nd seed in the conference. Two analytically-sourced All-Stars. Zero wasted deals. This is what a well-run team looks like.",
          applyStatus: ["analytics-forward", "scout-trusted", "high-morale"],
        },
        {
          probability: 0.25,
          label: "Hybrid Model — Choice Paralysis",
          scoreΔ: 6,
          narrative:
            "Parallel power created paralysis on two key choices. both scouts and stats disagreed on the same player. no one had the power to decide. Missed a time limit. Lost a free agent. Year 3. strong but underachieving for the talent assembled.",
          applyStatus: ["analytics-forward"],
        },
      ],
    },
    {
      roundTagCombo: ["hybrid-build", "analytics-primary"],
      variants: [
        {
          probability: 0.70,
          label: "Stats-Primary — Clear Choice Setup",
          scoreΔ: 9,
          narrative:
            "Clear power made choices fast. The model identified two All-Star caliber players that scouts had underrated. Year 3. most efficient offense in the league. Webb kept longer. Young core flourishing. The scouts who stayed became the model's best critics. the tension made both sides better.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.30,
          label: "Stats-Primary — Scouts Resign",
          scoreΔ: 5,
          narrative:
            "The primary designation felt like a demotion to the scouting staff. Three elite scouts left within 6 months. The model performed. but lost the human layer that caught non-model risks. One stats-sourced pick was a character issue that pure metrics couldn't flag.",
          applyStatus: ["analytics-forward", "coach-conflict"],
        },
      ],
    },
    {
      roundTagCombo: ["win-now", "accept-second-apron"],
      variants: [
        {
          probability: 0.40,
          label: "Win Now — Title Run",
          scoreΔ: 9,
          narrative:
            "Year 1. traded both picks, signed a max free agent. Made the Finals. Lost in 6. The city forgave the second-apron limits because of the run. Year 3. team again with no picks and limited trade rights. The window was real. you used it.",
          applyStatus: ["over-luxury-tax"],
        },
        {
          probability: 0.60,
          label: "Win Now — No Ring, No Assets",
          scoreΔ: 2,
          narrative:
            "Year 1. picked up, got to the round two, lost. Year 2. Webb aged, the max free agent slipped. you had no picks to retool. Year 3. lottery team with a $180M payroll and Second Apron limits. No exit.",
          applyStatus: ["over-luxury-tax", "rebuild-mode"],
        },
      ],
    },
    {
      roundTagCombo: ["win-now", "modify-win-now"],
      variants: [
        {
          probability: 0.60,
          label: "Changed Win-Now — Steady Stress",
          scoreΔ: 7,
          narrative:
            "Traded one pick, kept the other. Stayed off the Second Apron. Missed on the max free agent but signed a quality $20M player. Year 1. 5th seed. Year 3. still strong with one pick left and okay cap. Not a title run. a durable playoff team.",
          applyStatus: [],
        },
        {
          probability: 0.40,
          label: "Half Measure — No Title, Less Assets",
          scoreΔ: 4,
          narrative:
            "Not hard enough for a real run, not disciplined enough for a true rebuild. Year 3. mediocre roster in the middle of nothing. The worst outcome. neither vision executed.",
          applyStatus: ["cap-space-limited"],
        },
      ],
    },
    {
      roundTagCombo: ["analytics-transformation"],
      variants: [
        {
          probability: 0.55,
          label: "Stats-Forward — 3-year Build",
          scoreΔ: 8,
          narrative:
            "Invested $4M in stats systems. Replaced two traditional scouts with data scientists. The model found three overlooked players other teams passed on. Year 3. most efficient offense in the league. Webb happy, young core thriving. The scouts who remained became the model's best critics.",
          applyStatus: ["analytics-forward", "high-morale"],
        },
        {
          probability: 0.45,
          label: "Stats-Forward — Cultural Fracture",
          scoreΔ: 4,
          narrative:
            "The transformation was too fast. Half the scouting staff resigned in protest. The model performed. but lost the human layer that scouts provide. Two analytically-sourced picks had undisclosed character concerns that the model couldn't flag. Year 3. team again again.",
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
          "The 3-year plan was came in. The owner approved. The team moves forward with a defined plan.",
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

// ─── Compatibility exports for legacy API routes ─────────────────────────────
// New gameplay uses missionGraph + /api/mission/* routes. These helpers keep
// older endpoints compiling and safely functional if called.

export interface BranchState {
  capFlex: number;
  starPower: number;
  dataTrust: number;
  culture: number;
  riskHeat: number;
}

export interface MissionNodeOptionCompat {
  id: string;
  label: string;
  description: string;
  tags: string[];
  effects: {
    scoreΔ: number;
    branchΔ: Partial<BranchState>;
  };
  outcome: {
    narrative: string;
  };
  nextNodeId: string | null;
}

export interface MissionNodeCompat {
  id: string;
  step: number;
  title: string;
  conceptId: string;
  options: MissionNodeOptionCompat[];
}

export const GAME_SITUATION_COUNT = MISSIONS.length;

const DEFAULT_BRANCH_STATE: BranchState = {
  capFlex: 0,
  starPower: 0,
  dataTrust: 0,
  culture: 0,
  riskHeat: 0,
};

function getMissionIdByStep(step: number): string | null {
  const sorted = [...MISSIONS].sort((a, b) => a.missionNumber - b.missionNumber);
  const idx = Math.max(0, Math.min(step - 1, sorted.length - 1));
  return sorted[idx]?.id ?? null;
}

export function getDefaultNodeIdForStep(step: number): string {
  return getMissionIdByStep(step) ?? "cap-crunch";
}

export function createBranchState(raw?: Partial<Record<keyof BranchState, number>> | null): BranchState {
  return {
    capFlex: Number(raw?.capFlex ?? 0),
    starPower: Number(raw?.starPower ?? 0),
    dataTrust: Number(raw?.dataTrust ?? 0),
    culture: Number(raw?.culture ?? 0),
    riskHeat: Number(raw?.riskHeat ?? 0),
  };
}

export function applyBranchDelta(
  current: BranchState,
  delta?: Partial<Record<keyof BranchState, number>> | null
): BranchState {
  return {
    capFlex: current.capFlex + Number(delta?.capFlex ?? 0),
    starPower: current.starPower + Number(delta?.starPower ?? 0),
    dataTrust: current.dataTrust + Number(delta?.dataTrust ?? 0),
    culture: current.culture + Number(delta?.culture ?? 0),
    riskHeat: current.riskHeat + Number(delta?.riskHeat ?? 0),
  };
}

export function getNextNodeId(
  step: number,
  _branchState: BranchState,
  _winningOptionIndex: number
): string | null {
  const nextStep = step + 1;
  if (nextStep > GAME_SITUATION_COUNT) return null;
  return getMissionIdByStep(nextStep);
}

function getCompatOptions(mission: AnyMission): MissionNodeOptionCompat[] {
  const nextNodeId =
    mission.missionNumber >= GAME_SITUATION_COUNT
      ? null
      : getMissionIdByStep(mission.missionNumber + 1);

  if (isLegacyMission(mission)) {
    return mission.options.map((opt, index) => ({
      id: `legacy-opt-${index}`,
      label: opt.label,
      description: opt.note,
      tags: opt.tags,
      effects: {
        scoreΔ: opt.outcome.scoreΔ,
        branchΔ: DEFAULT_BRANCH_STATE,
      },
      outcome: {
        narrative: opt.outcome.narrative,
      },
      nextNodeId,
    }));
  }

  const firstRound = mission.rounds.find((r) => !r.dependsOnRoundId) ?? mission.rounds[0];
  const defaultVariant = mission.defaultOutcome.variants[0];
  if (!firstRound) return [];

  return firstRound.options.map((opt) => ({
    id: opt.id,
    label: opt.label,
    description: opt.description,
    tags: opt.tags,
    effects: {
      scoreΔ: defaultVariant?.scoreΔ ?? 0,
      branchΔ: DEFAULT_BRANCH_STATE,
    },
    outcome: {
      narrative: defaultVariant?.narrative ?? "Decision recorded.",
    },
    nextNodeId,
  }));
}

export function getMissionNode(id: string): MissionNodeCompat | undefined {
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) return undefined;

  return {
    id: mission.id,
    step: mission.missionNumber,
    title: mission.title,
    conceptId: mission.conceptId,
    options: getCompatOptions(mission),
  };
}
