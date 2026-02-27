/**
 * Track 101 Content Overrides
 *
 * Track 101 is designed for 5th–6th grade students.
 * Key simplifications:
 *  - "salary cap" → "team spending limit" or "team budget"
 *  - "luxury tax" → "spending penalty" or "extra fee"
 *  - "second apron" → "high-spending penalty zone"
 *  - Shorter sentences, active voice, everyday analogies
 *  - Target reading level: Flesch-Kincaid Grade 6
 */

export interface Track101MissionOverride {
  scenario: string;
  tagline?: string;
  infoCardSimplifications?: Record<string, string>; // infoCard title → simplified content
  roundSimplifications?: Record<
    string,
    {
      prompt?: string;
      context?: string;
      options?: Record<string, string>; // optionId → simplified description
    }
  >;
}

export const TRACK_101_MISSION_OVERRIDES: Record<string, Track101MissionOverride> = {
  "cap-crunch": {
    tagline: "Your star player wants a new deal. Clock is ticking.",
    scenario:
      "Your best player, Marcus Webb, has one year left on his contract. He's been an All-Star twice. His agent wants a 3-year deal worth $48 million. The problem: if you say yes, your team goes $14 million over the league's spending limit. That means you'll have to pay extra fees on top of his salary — like a fine for spending too much. Two other teams already have the money to sign him. You have 48 hours to decide.",
    infoCardSimplifications: {
      "CAP SHEET ALERT":
        "Your team is spending $168 million on players right now. The league's spending limit is $171 million. You're $3 million under the limit. If you sign Webb for $48 million over 3 years, you jump to $185 million — that's $14 million over the limit. The league charges you extra money (a penalty) for every dollar you go over. The more years you stay over the limit, the bigger the penalty gets.",
      "AGENT CALL — MARCUS WEBB":
        "Webb's agent called: '3 years, $48 million. That's the deal. LA and Miami both want him and they have the money. If you can't match that, he's listening to their offers. He wants to stay — but you need to make an offer.'",
      "OWNERSHIP MEMO — PRIVATE":
        "Private message from the owner: 'Paying the spending penalty once is okay — I'll handle it this year. But do NOT let us pay it three years in a row. If that happens, the penalties get really, really expensive. No matter what, avoid that situation.'",
      "MEDICAL FILE — RESTRICTED":
        "Private doctor's note: Webb had a heel injury 18 months ago. It was never in the news. Over a 3-year contract, there's a 28% chance (about 1 in 4) the injury comes back. The doctor says we should watch how much he plays.",
    },
    roundSimplifications: {
      direction: {
        prompt: "Webb's agent wants an answer in 48 hours. What do you do first?",
        options: {
          "sign-max":
            "Say yes to the full deal — 3 years, $48 million. Keep your star player. Pay the extra spending fees.",
          negotiate:
            "Make a lower offer. Try to get him for $13–14 million per year instead of $16 million. Make the agent work.",
          "explore-trade":
            "Ask around. Find out if another team would trade good players or draft picks for Webb before you decide.",
          "call-bluff":
            "Let him become a free agent. You can match any offer he gets. Make him prove there really is a better deal.",
        },
      },
      terms: {
        prompt: "Webb's agent called back with a counteroffer. What do you do?",
        context:
          "You offered $13.5 million per year — $40.5 million total. The agent said: 'Webb's lowest price is $15 million per year. He'll go to LA at $16 million if you can't hit $15 million.'",
        options: {
          "meet-floor": "Say yes to $15 million per year — $45 million total. Close the deal.",
          "restructure-bonus":
            "Offer $13 million base pay plus up to $2 million in bonus money if he plays well. That's $15 million if he performs.",
          "final-offer":
            "Hold firm at $13.5 million. That's your final number. If he leaves, he leaves.",
        },
      },
      "terms-sign": {
        prompt: "Webb's agent called right back: 'Deal. But he wants two extra things.'",
        context: "You agreed on $48 million for 3 years. Now the agent is asking for more.",
        options: {
          "full-accept":
            "Say yes to everything. He gets to decide if he stays in Year 3. You lose some control.",
          "ntc-only":
            "Say yes to no-trade protection, but say no to the Year 3 option. You keep more control.",
          "counter-both":
            "Offer a limited no-trade list (5 teams) and no Year 3 option. Business first.",
        },
      },
      "terms-bluff": {
        prompt: "Day 1 of free agency: LA officially offered Webb 4 years for $64 million. You have 72 hours to match.",
        context: "Your 'call the bluff' plan just got tested for real.",
        options: {
          "match-immediately":
            "Match the offer right away — in the first hour. Show everyone you're serious about keeping him.",
          "decline-for-picks":
            "Say no. LA's offer includes two future first-round draft picks as payment. Take the picks and rebuild.",
          "counter-90":
            "Offer 90% of what LA offered. Wait for Webb to decide. He has 72 hours.",
        },
      },
      "terms-trade": {
        prompt: "Two trade offers are on the table. Which one do you pick?",
        context:
          "Team A (LA): 2 first-round draft picks + a young point guard on a cheap deal. Team B (Miami): 1 first-round pick + their starting center (2 years left, $18 million).",
        options: {
          "accept-la":
            "Take LA's deal — 2 draft picks and a young point guard. Best future value. Full rebuild.",
          "accept-miami":
            "Take Miami's deal — 1 draft pick and a good center. Stay competitive for now.",
          "reject-trades":
            "Reject both offers. Neither is good enough. Go back to contract talks with Webb.",
        },
      },
    },
  },

  "contract-choice": {
    tagline: "Your young star is ready for a huge deal. What do you offer?",
    scenario:
      "Your young star player, Darius Cole, just finished his first contract — and he was amazing. He made two All-Star teams! Now the league says he qualifies for the biggest possible contract: 5 years worth over $210 million. His agent is letting other teams know he's available. Those teams have money saved up to pay him. Cole has the option to walk away after Year 5. What do you offer?",
    roundSimplifications: {
      direction: {
        prompt: "What is your opening offer to Cole's agent?",
        options: {
          "offer-supermax":
            "Offer the biggest possible deal — 5 years, $210 million+. Keep your star at all costs.",
          "team-friendly":
            "Offer a smaller deal that's better for your team's budget. Take a risk that he says yes.",
          "qualifying-offer":
            "Make the minimum offer to keep his rights for one more year. Buy time to figure out the plan.",
          "sign-and-trade":
            "Trade him to another team right now. Get good players and draft picks in return.",
        },
      },
    },
  },

  "revenue-mix": {
    tagline: "A big company wants to sponsor your team. Is it a good deal?",
    scenario:
      "A tech company called NovaTech wants to put their logo on your team's jersey. They'll pay you $25 million per year for 5 years — the biggest sponsorship deal your team has ever had. But they have some rules: they want to rename your practice gym after themselves, they want your team to post about them on social media 10 times a month, and they want first choice if you ever sell the naming rights to your arena. About half of the extra money you earn gets shared with all teams in the league. Your players are already unhappy about the social media requirement. Your owner wants as much money as possible.",
    roundSimplifications: {
      direction: {
        prompt: "What is your first move on the NovaTech deal?",
        options: {
          "accept-full":
            "Accept the full deal. $25 million per year is too good to pass up.",
          "negotiate-conditions":
            "Accept the money but push back on the rules. No arena naming rights, fewer social posts.",
          "counter-lower":
            "Make a smaller counter deal. Drop the social media requirement entirely.",
          "reject-deal":
            "Reject NovaTech. Look for a better sponsor with fewer strings attached.",
        },
      },
    },
  },

  "expense-pressure": {
    tagline: "Trade deadline is today. Can you get this star player?",
    scenario:
      "It's the trade deadline — 3 PM today. You're 2 and a half games out of the playoffs. Another team wants to trade their star player, Jordan Reeves. He scores 26 points a game and is exactly what your team is missing. But the league has rules: if you're already over the spending limit, you have to send out almost as much salary as you take in. You have two players whose salaries combine to just enough — but taking Reeves also moves you into an even worse spending zone. The clock is ticking.",
    roundSimplifications: {
      direction: {
        prompt: "It's trade deadline day. What do you do about Jordan Reeves?",
        options: {
          "make-trade":
            "Go for it. Combine your two players' salaries and send them for Reeves.",
          "partial-trade":
            "Try to get Reeves in a smaller deal. Offer just one of the two players.",
          "pass-on-reeves":
            "Don't do it. The salary math is too messy. Find a different player.",
          "buy-roster-spot":
            "Buy out a current player to create cap space, then go after Reeves clean.",
        },
      },
    },
  },

  "stats-lineup": {
    tagline: "Your team's data says the bench lineup wins more. The coach disagrees.",
    scenario:
      "Your stats team discovered something interesting: your bench players (backup players) actually perform better together than your starters. When they play together, the team scores 12 more points per 100 turns with the ball than the opponent. Your starters? Only 3 more points. The difference is real. But your head coach, Marcus Hill, has 22 years of experience and two championships. He thinks advanced stats are nonsense. The players trust him. You control the front office. Someone has to give in — who?",
    roundSimplifications: {
      direction: {
        prompt: "Your stats team found something the coach won't listen to. What do you do?",
        options: {
          "back-analytics":
            "Back your stats team. Ask the coach to try the bench lineup for two weeks.",
          "back-coach":
            "Back the coach. His experience and the players' trust matter more right now.",
          "find-middle":
            "Set up a meeting. Show the coach the data. Find a plan you both agree on.",
          "hire-analyst":
            "Bring in a famous analytics expert to meet with the coach and present the numbers.",
        },
      },
    },
  },

  "matchup-adjust": {
    tagline: "Your star player looks tired. Playoffs are close. What do you do?",
    scenario:
      "Your best player, DeShawn Morris, is 24 years old and averaging 31 points per game. He's been playing 38 minutes every night. Lately his shooting percentage in the fourth quarter has dropped. The team doctors are worried: his feet are showing signs of strain. He hasn't been officially hurt yet — but the warning signs are there. Playoffs are only 11 games away. The fans are buying tickets to watch him play. His coach wants him on the floor. Morris says he feels fine. What do you do?",
    roundSimplifications: {
      direction: {
        prompt: "Morris looks worn down. How do you handle it?",
        options: {
          "reduce-minutes":
            "Cut his playing time right now. Rest him a few minutes per game even if he's unhappy.",
          "maintain-schedule":
            "Keep his schedule the same. He says he feels fine — trust him.",
          "consult-player":
            "Have a private conversation with Morris. Show him the medical data. Let him help decide.",
          "load-manage":
            "Give him full rest in two upcoming easy games. Save him for the important matchups.",
        },
      },
    },
  },

  "draft-table": {
    tagline: "You have 10 minutes to make your draft pick. Who do you choose?",
    scenario:
      "It's draft night and you have the 6th pick. Your scouts love Mateo Silva — a 19-year-old player from Europe. He's polished, professional, and ready to play right now. He'll probably average 15 points per game by Year 3. Your stats computer, with 94% confidence, says Damien Cole — a 20-year-old from a smaller college — could become a top-15 player by Year 3. But the scouts rank Cole #14, while the computer ranks him #4. The gap is huge. You have 10 minutes to pick. A wrong choice can hurt your team for a decade.",
    roundSimplifications: {
      direction: {
        prompt: "You have 10 minutes before the 6th pick. Who do you draft?",
        options: {
          "pick-silva":
            "Draft Mateo Silva. He's ready now and scouts all love him. Safe, proven choice.",
          "pick-cole":
            "Trust the computer model. Draft Damien Cole. Higher upside if the model is right.",
          "trade-up":
            "Trade your pick to move up. You want a different player ranked #3.",
          "trade-down":
            "Trade your pick to move down and collect extra picks. Get more chances.",
        },
      },
    },
  },

  "final-gm-call": {
    tagline: "The owner wants your 3-year plan. What's your vision?",
    scenario:
      "The season is over. Your team almost made the playoffs — you lost the last qualifying game by 4 points. The owner calls you in for a private meeting. Your team has: one All-Star player with 2 years left on his deal, two first-round draft picks saved up, and a 14-player roster with 4 really good rotation players. The league has been won mostly by teams that used smart data and draft picks — not by signing big free agents. The owner asks: 'What does this team look like in 3 years?' Your answer will decide the whole direction of the team — including whether you keep your job.",
    roundSimplifications: {
      direction: {
        prompt: "What three-year vision do you present to the owner?",
        options: {
          "win-now":
            "Go for it now. Use the draft picks to trade for another star and try to win right away.",
          "slow-rebuild":
            "Rebuild slowly. Keep the picks, develop young players, and build for Year 3.",
          "balanced-plan":
            "Stay competitive while building. Keep the star player and one draft pick. Develop the rest.",
          "analytics-rebuild":
            "Build the team using data and smart drafting. Model-based roster building for Year 3.",
        },
      },
    },
  },
};

// ─── Glossary Overrides ────────────────────────────────────────────────────────
// Simpler definitions for Track 101. Same terms, plainer language.

export const TRACK_101_GLOSSARY_OVERRIDES: Record<
  string,
  { def: string; why: string }
> = {
  "salary-cap": {
    def: "The most a team can pay all its players combined.",
    why: "It's like a spending limit — you can't go over it without paying extra fees.",
  },
  "soft-cap": {
    def: "A spending limit you can go past if you follow special rules.",
    why: "Teams can still sign players even after reaching the limit.",
  },
  "hard-cap": {
    def: "A spending limit you absolutely cannot go past, no exceptions.",
    why: "Once you hit it, you cannot add more salary no matter what.",
  },
  "luxury-tax-line": {
    def: "A second, higher spending line where extra fees kick in.",
    why: "Every dollar above this line costs your owner extra money on top of the salary.",
  },
  "second-apron": {
    def: "An even higher spending line where you lose important team-building tools.",
    why: "Teams above this line can't do certain trades or signings anymore.",
  },
  "dead-money": {
    def: "Money you still owe a player who is no longer on your team.",
    why: "It counts against your spending limit even though the player is gone.",
  },
  "cap-hold": {
    def: "A placeholder number that takes up cap space for a player you might re-sign.",
    why: "It reduces how much money you can spend on other players until you decide.",
  },
  "cap-flexibility": {
    def: "How much freedom you have to sign, trade, or cut players.",
    why: "More flexibility means you can react quickly when good players become available.",
  },
  bri: {
    def: "The total amount of money all NBA teams earn in a year.",
    why: "The spending cap grows when the league earns more money overall.",
  },
  escrow: {
    def: "A portion of player pay held back until the end of the year.",
    why: "It makes sure players and owners split the league's money fairly.",
  },
  "revenue-sharing": {
    def: "When big-market teams share some of their extra money with small-market teams.",
    why: "It helps smaller cities compete against cities like LA and New York.",
  },
  "local-revenue": {
    def: "Money your team earns from ticket sales, local sponsors, and your arena.",
    why: "Local income is what drives your owner's budget decisions.",
  },
  "bird-rights": {
    def: "A special rule that lets you pay your own player over the spending limit.",
    why: "It's the main way teams re-sign their star players.",
  },
  mle: {
    def: "A special budget for signing one extra player even when you're over the spending limit.",
    why: "Most teams use this to add quality role players.",
  },
  bae: {
    def: "A smaller version of the Mid-Level Exception that you can only use every other year.",
    why: "It helps teams add depth players without breaking the budget.",
  },
  "room-exception": {
    def: "A bonus signing tool available to teams that have stayed under the spending limit.",
    why: "It lets under-budget teams sign one more useful player.",
  },
  extension: {
    def: "A new contract added before a player's current deal runs out.",
    why: "Signing a player early often costs less than waiting until they hit free agency.",
  },
  "player-option": {
    def: "A clause that lets the player choose whether to stay for the last year of the deal.",
    why: "If they're playing great, they can opt out and get a bigger contract.",
  },
  "team-option": {
    def: "A clause that lets the team choose whether to keep a player for the last year.",
    why: "Teams use this to control role players without risk.",
  },
  "mutual-option": {
    def: "Both the team and the player must agree to continue the contract.",
    why: "If either side says no, the player becomes a free agent.",
  },
  "qualifying-offer": {
    def: "A one-year offer that lets you match any contract another team gives your young player.",
    why: "It keeps young players from just leaving for free.",
  },
  "restricted-free-agent": {
    def: "A free agent whose current team gets to match any offer he receives.",
    why: "The original team has the power to keep him even if he signs elsewhere.",
  },
  "free-agency": {
    def: "The time of year when players can sign with any team they want.",
    why: "Big roster changes usually happen during this window.",
  },
  supermax: {
    def: "The biggest contract the league allows, reserved for the best players.",
    why: "It helps teams keep star players but uses up a huge chunk of the budget.",
  },
  "rookie-scale": {
    def: "A set pay chart for players drafted in the first round.",
    why: "Getting a great player on a cheap rookie deal is one of the best advantages in team-building.",
  },
  "two-way-contract": {
    def: "A deal where a player splits time between the NBA team and their development league team.",
    why: "It's a low-cost way to test and develop talent.",
  },
  "no-trade-clause": {
    def: "A contract rule that says the player must approve any trade.",
    why: "It gives the player power and limits the team's flexibility.",
  },
  "market-value": {
    def: "What a player would realistically earn if he were available to all teams.",
    why: "Paying too far above or below market value causes problems later.",
  },
  "trade-matching-rule": {
    def: "A rule that says teams over the spending limit must send out almost as much salary as they take in.",
    why: "Most rejected trades fail because of this math requirement.",
  },
  "salary-aggregation": {
    def: "Combining multiple players' contracts to make a trade work salary-wise.",
    why: "It lets you get a high-salary player even if no single player matches his salary.",
  },
  "sign-and-trade": {
    def: "When a player re-signs with his current team, then gets traded immediately to a new team.",
    why: "The original team gets something in return instead of losing the player for nothing.",
  },
  "trade-kicker": {
    def: "Bonus money written into a contract that gets triggered if the player is traded.",
    why: "It can make trades harder to complete because it adds extra cost.",
  },
  "draft-pick-value": {
    def: "How much a future draft pick is worth as a trade chip.",
    why: "Teams building for the future rely heavily on hoarding good draft picks.",
  },
  "asset-timeline": {
    def: "The plan for when your best players, picks, and budget will all line up together.",
    why: "If your best pieces peak at different times, opportunities get wasted.",
  },
  per: {
    def: "A single number that estimates how productive a player is per minute played.",
    why: "It's a quick way to compare players, but it misses a lot of things.",
  },
  "true-shooting": {
    def: "A percentage that measures how efficiently a player scores (2-pointers, 3-pointers, and free throws).",
    why: "It's much better than basic field goal percentage for judging shooters.",
  },
  "win-shares": {
    def: "An estimate of how many wins a player is responsible for during the season.",
    why: "It connects individual performance to actual team results.",
  },
  bpm: {
    def: "A stat that shows how much a player helps or hurts the team per 100 possessions.",
    why: "It lets you compare players in different roles.",
  },
  vorp: {
    def: "How much better a player is than a replacement-level player over the whole season.",
    why: "It helps compare players who play different amounts of time.",
  },
  "net-rating": {
    def: "How many more points your team scores than the opponent per 100 possessions.",
    why: "It shows whether your lineup is actually winning the minutes it plays.",
  },
  "usage-rate": {
    def: "The percentage of the team's plays a player is involved in while he's on the court.",
    why: "High usage means the team is relying on that player a lot.",
  },
  "dollar-per-win-share": {
    def: "How many dollars a team spends for each win-share a player contributes.",
    why: "Lower is better — it means you're getting more production for less money.",
  },
  "market-inefficiency": {
    def: "A skill or type of player that most teams are not paying enough for.",
    why: "Finding these underpriced players is how smart teams build great rosters cheaply.",
  },
  "sample-size": {
    def: "How much data or evidence you have before making a decision.",
    why: "A small amount of data can lead you to wrong conclusions.",
  },
  "load-management": {
    def: "Giving players planned rest days to protect them from injuries.",
    why: "A healthy star player in the playoffs is worth more than a few extra regular-season wins.",
  },
  "injury-risk": {
    def: "The chance that a player gets hurt based on how hard they're working.",
    why: "Being aware of risk helps teams protect players before something bad happens.",
  },
  "minute-load": {
    def: "How many minutes a player averages over time.",
    why: "Playing too many minutes without rest increases the chance of injury.",
  },
  "soft-tissue": {
    def: "Muscle and tendon strain that can be a warning sign before a bigger injury.",
    why: "Catching these warning signs early can prevent a player from missing the whole season.",
  },
  availability: {
    def: "How often a player is healthy enough to actually play in games.",
    why: "A player can only help the team if he's on the floor.",
  },
  "team-culture": {
    def: "The shared trust, habits, and standards that define how your team works together.",
    why: "Teams with strong culture perform better under pressure.",
  },
  seeding: {
    def: "Your team's rank in the playoffs based on your regular-season record.",
    why: "Better seeding means easier first-round matchups and more home games.",
  },
  "front-office-philosophy": {
    def: "Your overall strategy for building the team — rebuild, win now, or something in between.",
    why: "A clear philosophy keeps all your decisions consistent over many years.",
  },
};
