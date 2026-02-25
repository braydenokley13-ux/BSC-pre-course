export interface GlossaryTerm {
  term: string;
  def: string;
  why: string;
}

export interface GlossaryGroup {
  group: string;
  terms: GlossaryTerm[];
}

export interface ConceptCard {
  id: string;
  title: string;
  body: string;
  note: string;
  missionId: string;
}

// ── 30-term full glossary ──────────────────────────────────────────────────────
export const GLOSSARY_TERMS: GlossaryGroup[] = [
  {
    group: "Cap Rules",
    terms: [
      {
        term: "Salary Cap",
        def: "The league-set limit on total player salaries — currently $141M. It is a soft cap, meaning teams can exceed it using specific exceptions.",
        why: "Understanding the cap is the foundation of every roster decision.",
      },
      {
        term: "Soft Cap vs Hard Cap",
        def: "A soft cap can be exceeded using exceptions (Bird Rights, MLE). A hard cap cannot be exceeded for any reason — triggered by moves like using the Second Apron or traded player exceptions.",
        why: "Hard caps eliminate flexibility. Hitting one unexpectedly can trap a roster.",
      },
      {
        term: "Luxury Tax Line",
        def: "The threshold above which teams pay an escalating dollar-for-dollar penalty — currently $171M.",
        why: "Teams over the tax pay real money back to the league — often 2–3× the overage.",
      },
      {
        term: "Second Apron",
        def: "A hard-cap line at $178M. Teams above it lose access to the MLE, cannot aggregate salaries in trades, and face severe roster restrictions.",
        why: "The second apron is designed to discourage runaway spending.",
      },
      {
        term: "Dead Cap / Dead Money",
        def: "Salary that counts against the cap even though the player is no longer on the roster — created when a player is waived with guaranteed money remaining.",
        why: "Dead cap reduces your spending room without giving you a player in return.",
      },
      {
        term: "Cap Hold",
        def: "A placeholder salary that counts against cap space for a free agent whose rights the team still holds.",
        why: "Cap holds can prevent teams from signing free agents even when they appear to have room.",
      },
      {
        term: "BRI (Basketball Related Income)",
        def: "Total NBA revenue — ticket sales, TV deals, merchandise, digital rights, and more. Currently ~$10.5B/year.",
        why: "The salary cap is set at ~49–51% of BRI. When the league earns more, the cap rises the next year.",
      },
      {
        term: "Escrow",
        def: "Players forfeit ~10% of each paycheck into escrow. At year-end, if total salaries exceeded the agreed BRI share, players return money.",
        why: "Escrow balances the system between owners and players relative to actual revenue.",
      },
    ],
  },
  {
    group: "Contracts",
    terms: [
      {
        term: "Bird Rights",
        def: "The right to exceed the cap to re-sign your own player. Full Bird requires 3 years with the team. Early Bird requires 2. Non-Bird allows re-signing up to a set amount.",
        why: "Bird Rights are the most powerful tool for retaining stars above the cap.",
      },
      {
        term: "Mid-Level Exception (MLE)",
        def: "An exception allowing over-cap teams to sign players for up to ~$12.4M/year. Teams above the tax line get a smaller version (~$8.5M).",
        why: "The MLE is how most teams add talent when over the cap — the most negotiated tool in free agency.",
      },
      {
        term: "Bi-Annual Exception (BAE)",
        def: "An exception worth ~$4.5M usable every other year — and only if the team is not in the tax.",
        why: "The BAE offers depth signing flexibility but disappears when you go over the tax line.",
      },
      {
        term: "Room Exception",
        def: "Teams under the cap can sign players using cap room OR a $7.7M Room Exception if they can't clear full room.",
        why: "Teams rebuilding under the cap gain access to cheaper exceptions without tax penalties.",
      },
      {
        term: "Player Option",
        def: "The player can choose to opt out of the final contract year and enter free agency — or keep the existing deal.",
        why: "Player options give stars leverage. A player likely opts out when they can earn more elsewhere.",
      },
      {
        term: "Team Option",
        def: "The team decides whether to exercise the final year of a player's contract.",
        why: "Teams love options on role players. Declining a team option adds to dead cap.",
      },
      {
        term: "Mutual Option",
        def: "Both the team AND player must agree to exercise the final year.",
        why: "Mutual options create negotiation leverage for both sides.",
      },
      {
        term: "Early Termination Clause (ETC)",
        def: "A clause allowing the player (or team) to end the deal early, typically after year 3 or 4.",
        why: "ETCs give flexibility — but also uncertainty. A star with an ETC is always one opt-out away from free agency.",
      },
      {
        term: "Contract Extension",
        def: "Adding years to an existing contract before it expires — typically at a salary bump. Extensions must follow CBA timing and maximum annual increase rules.",
        why: "Extensions lock up players cheaper than open-market free agency. Waiting costs more.",
      },
      {
        term: "Qualifying Offer",
        def: "A one-year tender to a restricted free agent. If signed, the team retains his rights for one year. If rejected, he becomes an unrestricted free agent.",
        why: "QOs give teams the right to match any offer sheet — critical for retaining young talent.",
      },
      {
        term: "Supermax / Designated Player Extension",
        def: "The largest possible contract — up to 35% of the cap — reserved for players meeting specific criteria (All-NBA, All-Star, MVP, DPOY). Only the current team can offer it.",
        why: "The supermax is the ultimate retention tool — but can lock a declining player into an unmovable deal.",
      },
      {
        term: "Rookie Scale Contract",
        def: "Preset 4-year deals for first-round picks, salary determined by draft slot. Teams hold two team options on years 3 and 4.",
        why: "Rookie scale contracts are the most cost-efficient in the league — the reason drafting is the foundation of sustained winning.",
      },
      {
        term: "Two-Way Contract",
        def: "A special contract (~$611K) for players who split time between the NBA roster and G League. Teams can carry up to two.",
        why: "Two-way deals allow prospect development without counting against the standard 15-man roster limit.",
      },
      {
        term: "No-Trade Clause (NTC)",
        def: "A contract provision preventing the team from trading the player without his consent.",
        why: "NTCs reduce team flexibility significantly. A player with an NTC controls his own destination.",
      },
    ],
  },
  {
    group: "Trades",
    terms: [
      {
        term: "Trade Matching Rule",
        def: "Over-cap teams can only take on incoming salary up to 125% + $2M of salary sent out. Under-cap teams can absorb up to the cap + $5M rookie exception.",
        why: "Matching rules prevent teams from circumventing the salary cap through trades.",
      },
      {
        term: "Salary Aggregation",
        def: "Combining multiple contracts on one side of a trade to match a single large salary on the other side. Teams above the Second Apron cannot aggregate.",
        why: "Aggregation unlocks trades that would otherwise be financially impossible.",
      },
      {
        term: "Sign-and-Trade",
        def: "A player signs a new contract with his current team which is immediately traded to a new team. Allows the acquiring team to exceed the cap.",
        why: "Sign-and-trades let teams get value when they would otherwise lose a player for nothing in free agency.",
      },
      {
        term: "Trade Kicker",
        def: "A contract clause adding extra salary (up to 15% of remaining value) when a player is traded.",
        why: "Trade kickers protect players financially but reduce trade market demand.",
      },
    ],
  },
  {
    group: "Analytics",
    terms: [
      {
        term: "PER (Player Efficiency Rating)",
        def: "A per-minute efficiency metric summarizing statistical contributions into one number. League average is 15.",
        why: "PER gives a fast read on player productivity — though it over-rewards scoring and misses defense.",
      },
      {
        term: "True Shooting % (TS%)",
        def: "Shooting efficiency accounting for the value of three-pointers and free throws. League average is ~57%.",
        why: "TS% is the most honest way to compare shooters across different styles of play.",
      },
      {
        term: "Win Shares (WS)",
        def: "An estimate of the number of wins a player contributed to the team.",
        why: "Win Shares connects individual performance to actual outcomes — useful for contract value analysis.",
      },
      {
        term: "BPM (Box Plus/Minus)",
        def: "Estimated net impact per 100 possessions vs. a league-average player, based only on box score data. +5 is All-Star level.",
        why: "BPM shows impact relative to replacement — essential for measuring stars vs. role players fairly.",
      },
      {
        term: "VORP (Value Over Replacement Player)",
        def: "Total value a player provides above what a replacement-level player would provide, scaled to a full season.",
        why: "VORP compares players with different playing time or roles — it rewards both efficiency and availability.",
      },
      {
        term: "Net Rating / ORTG / DRTG",
        def: "Net Rating is the point differential per 100 possessions with a player on the court. ORTG = offensive rating, DRTG = defensive rating.",
        why: "Net Rating captures what the scoreboard actually shows — undervalued players often show up best here.",
      },
      {
        term: "Usage Rate",
        def: "The percentage of team possessions a player uses while on the court. Stars: 28–35%. Role players: 12–18%.",
        why: "High usage players carry more offensive responsibility — but can signal inefficiency if efficiency metrics don't keep pace.",
      },
      {
        term: "$/Win Share",
        def: "How much a team is paying per Win Share of production — a contract analytics metric measuring cost efficiency.",
        why: "$/Win Share is how front offices grade contracts. A low $/WS = good value. A high $/WS = overpaid.",
      },
      {
        term: "Market Inefficiency",
        def: "A player whose production value significantly exceeds his salary — often because a skill is undervalued league-wide.",
        why: "Teams that identify and exploit market inefficiencies build rosters above their payroll tier.",
      },
    ],
  },
];

// ── 8 featured concept cards (one unlocked per mission) ───────────────────────
export const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: "luxury-tax",
    missionId: "cap-crunch",
    title: "Luxury Tax & Cap Penalties",
    body: "Every dollar over the Luxury Tax Line ($171M) is taxed at an escalating multiplier. Year 1 over the line: roughly 1.5× penalty per dollar. Repeat offenders (tax in 3 of 4 consecutive years) face multipliers that can exceed 3×. The penalty money is redistributed to non-tax teams. Teams above the Second Apron ($178M) face a hard cap and lose key exceptions like the MLE and salary aggregation rights in trades.",
    note: "You'll calculate exact tax bills and model repeater scenarios in the course. For now: the repeater penalty compounds faster than most people expect — staying just under the tax line has real long-term value.",
  },
  {
    id: "extensions-options",
    missionId: "contract-choice",
    title: "Contract Extensions & Options",
    body: "An extension adds years to an existing contract before it expires — typically at a salary bump. Teams benefit by locking in talent below open-market free agency value. A Player Option gives the player the right to opt out of the final year and enter free agency. A Team Option gives the team that right. Mutual Options require both sides to agree. The Supermax (Designated Player Extension) is the largest possible contract — 35% of the cap — and can only be offered by the player's current team.",
    note: "You'll analyze extension vs. free agency value using market rate models in the course. For now: early = cheaper, late = more expensive or gone.",
  },
  {
    id: "bri-revenue",
    missionId: "revenue-mix",
    title: "The NBA as a Business (BRI & Revenue)",
    body: "The salary cap is set at roughly 49–51% of Basketball Related Income (BRI) — the total revenue the NBA generates. When the league earns more (new TV deals, streaming rights, expansion fees), the cap rises the following year. Not all revenue is shared equally: national TV money and merchandise are distributed equally among all 30 teams, but arena revenue (gate, concessions, local sponsorships) stays with the home team. This creates a structural advantage for large-market franchises in local revenue — which is why luxury tax redistribution exists to level the playing field.",
    note: "You'll model BRI projections and cap forecasting in the course. For now: the cap number isn't random — it's a slice of the total revenue pie, and it grows with the league.",
  },
  {
    id: "trade-matching",
    missionId: "expense-pressure",
    title: "Trade Matching Rules",
    body: "Every trade must follow salary matching rules. If your team is over the cap, incoming salary can be at most 125% + $2M of the salary you send out. Example: send out $20M, take back up to $27M. If you are under the cap, the new payroll just needs to stay within the cap + $5M. Salary aggregation — combining multiple contracts on one side to match a large salary on the other — is a key tool, but teams above the Second Apron lose this right. This is why Second Apron teams struggle to make trades at the deadline.",
    note: "You'll use a real trade machine to model deals in the course. For now: if a trade looks blocked, the math is usually wrong on the salary side.",
  },
  {
    id: "analytics",
    missionId: "stats-lineup",
    title: "Analytics & Player Evaluation",
    body: "Modern front offices use multiple tiers of metrics. Basic efficiency: PER (per-minute production, avg 15) and True Shooting % (avg 57%). Impact metrics: Win Shares, BPM (Box Plus/Minus, avg 0), and VORP (value above replacement). Team context: Net Rating (point differential per 100 possessions). Contract analytics: $/Win Share — how much the team pays per win produced. A player with a negative Net Rating costs the team points when he plays, regardless of his box score numbers.",
    note: "You'll build and run these models yourself in the course. For now: metrics work best as a bundle — one number rarely tells the whole story.",
  },
  {
    id: "roster-health",
    missionId: "matchup-adjust",
    title: "Roster Health & Load Management",
    body: "Load management is the strategic resting of players — especially veterans and young players showing fatigue signs — to reduce injury risk and preserve performance for high-leverage games. NBA medical teams track soft tissue stress, shot quality in late-game situations, and minute accumulation. The risk of overloading a young player is career trajectory damage: a torn ACL at 23 changes a player's development permanently. Front offices balance the short-term cost of sitting players (lost regular season wins, lower seeding) against the long-term benefit (health entering the playoffs, player longevity).",
    note: "You'll use performance data and fatigue models in the course. For now: the best players are only valuable if they're on the floor — preventive rest is part of roster management.",
  },
  {
    id: "rookie-scale",
    missionId: "draft-table",
    title: "Rookie Scale & Draft Contracts",
    body: "All first-round draft picks are signed to preset 4-year rookie scale contracts — the salary is set by the league based on draft slot. The #1 pick earns roughly $12M in Year 1; pick #30 earns ~$2M. Teams hold team options on years 3 and 4 of every rookie scale deal, meaning they can keep a developing player cost-controlled for 4 years. If the player develops into a star, the team pays far below market value. Second-round picks are not guaranteed rookie scale deals — teams negotiate directly, often using two-way contracts (~$611K) for developmental prospects.",
    note: "You'll calculate rookie scale values and analyze draft capital trade-offs in the course. For now: the draft is how small-market teams compete with large-market teams — cost-controlled stars are worth more than their salary suggests.",
  },
  {
    id: "front-office-philosophy",
    missionId: "final-gm-call",
    title: "Front Office Philosophy",
    body: "Every franchise operates from an underlying philosophy that shapes every decision. Cap flexibility strategy: keep payroll below the cap line to maintain the ability to sign free agents or absorb contracts in trades. Rebuild / tanking: intentionally fielding a weak team to improve draft lottery odds and acquire cost-controlled young talent. Win-now: prioritize immediate contention by trading assets and signing veterans. Analytics-first: use data models to identify undervalued players and inefficient market positions. The most successful franchises blend scouting expertise with analytical rigor — neither approach alone sustains winning long-term.",
    note: "You'll develop and defend your own front office philosophy framework in the course. For now: the best GMs have a clear thesis and the discipline to execute it consistently — even when it's unpopular.",
  },
];

export function getConceptCard(id: string): ConceptCard | undefined {
  return CONCEPT_CARDS.find((c) => c.id === id);
}
