/*
Polish Checklist
- [ ] Animations feel smooth and not distracting across week transitions.
- [ ] Responsive checks: phone portrait, tablet, and desktop scoreboard spacing.
- [ ] localStorage tests: bestScore, lastRun, tutorialSeen, and reset behavior.
- [ ] Event variety check: 60+ unique major events with mixed prerequisites.
*/

(() => {
  "use strict";

  const CONFIG = {
    totalWeeks: 12,
    salaryCap: 141,
    luxuryTaxLine: 171,
    apronLine: 178,
    underCapExceptionM: 5,
    hiddenGoalRevealWeek: 6
  };

  const STORAGE = {
    bestScore: "bestScore",
    lastRun: "lastRun",
    tutorialSeen: "tutorialSeen",
    settings: "bscSettings"
  };

  const MOMENTUM = {
    HOT: "HOT",
    STABLE: "STABLE",
    CRISIS: "CRISIS"
  };

  const TEMPERAMENT_MOD = {
    patient: 0.92,
    neutral: 1,
    impatient: 1.12
  };

  const FALLBACK_TEAMS = [
    {
      name: "Boston Celtics",
      marketSize: "large",
      ownerTemperament: "impatient",
      startingValueB: 5.2,
      startingPatience: 60,
      storyline: "A veteran contender with a huge payroll. Ownership wants banners, not excuses.",
      startingRoster: ["Jayson Tatum", "Jaylen Brown", "Jrue Holiday", "Kristaps Porzingis", "Derrick White", "Malik Freeman", "Nolan Price", "Elijah Boone", "Carter Wynn", "Darius Cole"]
    },
    {
      name: "Los Angeles Lakers",
      marketSize: "large",
      ownerTemperament: "impatient",
      startingValueB: 6.1,
      startingPatience: 58,
      storyline: "Global spotlight every night. A single losing week can dominate headlines.",
      startingRoster: ["LeBron James", "Anthony Davis", "Austin Reaves", "Rui Hachimura", "D'Angelo Russell", "Marcus Hale", "Trey Lawson", "Isaiah Knox", "Devin Marsh", "Caleb Stone"]
    },
    {
      name: "Golden State Warriors",
      marketSize: "large",
      ownerTemperament: "impatient",
      startingValueB: 5.8,
      startingPatience: 57,
      storyline: "An aging core with title expectations and a tax bill that keeps climbing.",
      startingRoster: ["Stephen Curry", "Draymond Green", "Andrew Wiggins", "Klay Thompson", "Jonathan Kuminga", "Jordan Bellamy", "Keon Rivers", "Miles Harper", "Quentin Shaw", "Bryce Nolan"]
    },
    {
      name: "Miami Heat",
      marketSize: "large",
      ownerTemperament: "neutral",
      startingValueB: 4.3,
      startingPatience: 63,
      storyline: "Culture and toughness are the brand. Smart cap moves can unlock a deep run.",
      startingRoster: ["Jimmy Butler", "Bam Adebayo", "Tyler Herro", "Terry Rozier", "Jaime Jaquez Jr.", "Andre Voss", "Leo Santiago", "Mason Reid", "Tyrell Banks", "Cameron Fox"]
    },
    {
      name: "New York Knicks",
      marketSize: "large",
      ownerTemperament: "impatient",
      startingValueB: 5,
      startingPatience: 59,
      storyline: "Big market pressure with a fan base hungry for relevance and discipline.",
      startingRoster: ["Jalen Brunson", "Julius Randle", "OG Anunoby", "Josh Hart", "Mitchell Robinson", "Zion Mercer", "Noah Briggs", "Caleb Vaughn", "Dante Ellis", "Mason Hart"]
    },
    {
      name: "Dallas Mavericks",
      marketSize: "large",
      ownerTemperament: "neutral",
      startingValueB: 4.6,
      startingPatience: 65,
      storyline: "Star offense, thin margins. One wrong contract could trap the roster.",
      startingRoster: ["Luka Doncic", "Kyrie Irving", "PJ Washington", "Dereck Lively II", "Tim Hardaway Jr.", "Kobe Whitman", "Elias Turner", "Jace Holloway", "Ronan Cruz", "Tyler Dean"]
    },
    {
      name: "Denver Nuggets",
      marketSize: "med",
      ownerTemperament: "neutral",
      startingValueB: 4.1,
      startingPatience: 66,
      storyline: "Championship-level top talent, but depth decisions decide the ceiling.",
      startingRoster: ["Nikola Jokic", "Jamal Murray", "Michael Porter Jr.", "Aaron Gordon", "Kentavious Caldwell-Pope", "Micah Sloan", "Owen Drake", "Blake Monroe", "Jayce Grant", "Xavier Flynn"]
    },
    {
      name: "Oklahoma City Thunder",
      marketSize: "small",
      ownerTemperament: "patient",
      startingValueB: 3.9,
      startingPatience: 74,
      storyline: "Young core on the rise. You can push now or preserve long-term flexibility.",
      startingRoster: ["Shai Gilgeous-Alexander", "Jalen Williams", "Chet Holmgren", "Lu Dort", "Isaiah Joe", "Aiden Rowe", "Colby Lane", "Tyson Webb", "Evan Pike", "Ryder Moss"]
    },
    {
      name: "San Antonio Spurs",
      marketSize: "small",
      ownerTemperament: "patient",
      startingValueB: 3.6,
      startingPatience: 76,
      storyline: "A future-star timeline. Patience helps, but progress still matters.",
      startingRoster: ["Victor Wembanyama", "Devin Vassell", "Keldon Johnson", "Jeremy Sochan", "Tre Jones", "Landon Kerr", "Nico Dalton", "Felix Navarro", "Jamir Tate", "Seth Bishop"]
    },
    {
      name: "Orlando Magic",
      marketSize: "med",
      ownerTemperament: "neutral",
      startingValueB: 3.4,
      startingPatience: 68,
      storyline: "Length and youth provide upside. Cap timing determines when to strike.",
      startingRoster: ["Paolo Banchero", "Franz Wagner", "Jalen Suggs", "Wendell Carter Jr.", "Jonathan Isaac", "Adrian Cole", "Milo Benton", "CJ Randall", "Parker Tate", "Damon Quinn"]
    },
    {
      name: "Toronto Raptors",
      marketSize: "med",
      ownerTemperament: "neutral",
      startingValueB: 3.8,
      startingPatience: 64,
      storyline: "A pivot roster balancing competitiveness and future asset control.",
      startingRoster: ["Scottie Barnes", "RJ Barrett", "Immanuel Quickley", "Jakob Poeltl", "Gradey Dick", "Malik Osei", "Roman Petrov", "Jaylin Cross", "Connor Wells", "Tariq Lowe"]
    },
    {
      name: "Portland Trail Blazers",
      marketSize: "small",
      ownerTemperament: "patient",
      startingValueB: 3.2,
      startingPatience: 72,
      storyline: "Development years with flashes of star scoring. Every dollar matters.",
      startingRoster: ["Anfernee Simons", "Jerami Grant", "Deandre Ayton", "Scoot Henderson", "Shaedon Sharpe", "Brandon York", "Ellis Boone", "Kian Douglas", "Harper James", "Omar Fields"]
    }
  ];

  const REAL_PLAYERS = [
    ["Jayson Tatum", "Boston Celtics", "SF", 95, 27, 49, 4, "none", 92],
    ["Jaylen Brown", "Boston Celtics", "SG", 92, 28, 52, 4, "none", 90],
    ["Jrue Holiday", "Boston Celtics", "PG", 88, 34, 37, 2, "none", 88],
    ["Kristaps Porzingis", "Boston Celtics", "C", 87, 29, 30, 2, "none", 78],
    ["Derrick White", "Boston Celtics", "SG", 85, 30, 20, 3, "none", 91],

    ["LeBron James", "Los Angeles Lakers", "SF", 95, 40, 50, 1, "player", 85],
    ["Anthony Davis", "Los Angeles Lakers", "PF", 92, 32, 43, 3, "none", 76],
    ["Austin Reaves", "Los Angeles Lakers", "SG", 83, 27, 13, 3, "none", 90],
    ["Rui Hachimura", "Los Angeles Lakers", "PF", 80, 27, 17, 2, "none", 84],
    ["D'Angelo Russell", "Los Angeles Lakers", "PG", 81, 29, 18, 1, "player", 82],

    ["Stephen Curry", "Golden State Warriors", "PG", 95, 37, 55, 2, "none", 86],
    ["Draymond Green", "Golden State Warriors", "PF", 84, 35, 24, 3, "none", 80],
    ["Andrew Wiggins", "Golden State Warriors", "SF", 82, 30, 26, 2, "none", 83],
    ["Klay Thompson", "Golden State Warriors", "SG", 80, 35, 30, 1, "none", 79],
    ["Jonathan Kuminga", "Golden State Warriors", "SF", 83, 23, 8, 2, "none", 87],

    ["Jimmy Butler", "Miami Heat", "SF", 90, 36, 49, 2, "none", 79],
    ["Bam Adebayo", "Miami Heat", "C", 89, 29, 35, 3, "none", 91],
    ["Tyler Herro", "Miami Heat", "SG", 84, 26, 29, 3, "none", 86],
    ["Terry Rozier", "Miami Heat", "PG", 80, 32, 24, 2, "none", 84],
    ["Jaime Jaquez Jr.", "Miami Heat", "SF", 79, 24, 4, 3, "none", 88],

    ["Jalen Brunson", "New York Knicks", "PG", 91, 29, 27, 2, "none", 92],
    ["Julius Randle", "New York Knicks", "PF", 86, 31, 30, 2, "player", 85],
    ["OG Anunoby", "New York Knicks", "SF", 86, 28, 36, 4, "none", 84],
    ["Josh Hart", "New York Knicks", "SG", 82, 30, 19, 3, "none", 90],
    ["Mitchell Robinson", "New York Knicks", "C", 80, 28, 15, 2, "none", 76],

    ["Luka Doncic", "Dallas Mavericks", "PG", 97, 27, 43, 4, "none", 89],
    ["Kyrie Irving", "Dallas Mavericks", "PG", 90, 34, 40, 2, "none", 80],
    ["PJ Washington", "Dallas Mavericks", "PF", 81, 27, 16, 2, "none", 85],
    ["Dereck Lively II", "Dallas Mavericks", "C", 80, 22, 5, 3, "none", 84],
    ["Tim Hardaway Jr.", "Dallas Mavericks", "SG", 78, 33, 17, 1, "none", 82],

    ["Nikola Jokic", "Denver Nuggets", "C", 97, 31, 48, 4, "none", 93],
    ["Jamal Murray", "Denver Nuggets", "PG", 88, 29, 36, 2, "none", 81],
    ["Michael Porter Jr.", "Denver Nuggets", "SF", 84, 28, 36, 3, "none", 79],
    ["Aaron Gordon", "Denver Nuggets", "PF", 83, 31, 23, 2, "none", 86],
    ["Kentavious Caldwell-Pope", "Denver Nuggets", "SG", 78, 33, 15, 1, "player", 85],

    ["Shai Gilgeous-Alexander", "Oklahoma City Thunder", "PG", 95, 28, 36, 4, "none", 92],
    ["Jalen Williams", "Oklahoma City Thunder", "SF", 86, 24, 6, 2, "none", 91],
    ["Chet Holmgren", "Oklahoma City Thunder", "C", 85, 24, 11, 3, "none", 79],
    ["Lu Dort", "Oklahoma City Thunder", "SG", 79, 27, 16, 3, "none", 89],
    ["Isaiah Joe", "Oklahoma City Thunder", "SG", 77, 27, 13, 2, "none", 88],

    ["Victor Wembanyama", "San Antonio Spurs", "C", 92, 22, 12, 3, "none", 83],
    ["Devin Vassell", "San Antonio Spurs", "SG", 82, 26, 29, 4, "none", 86],
    ["Keldon Johnson", "San Antonio Spurs", "SF", 80, 27, 20, 2, "none", 85],
    ["Jeremy Sochan", "San Antonio Spurs", "PF", 78, 23, 6, 2, "none", 84],
    ["Tre Jones", "San Antonio Spurs", "PG", 76, 26, 9, 2, "none", 87],

    ["Paolo Banchero", "Orlando Magic", "PF", 87, 23, 13, 3, "none", 90],
    ["Franz Wagner", "Orlando Magic", "SF", 86, 24, 7, 2, "none", 91],
    ["Jalen Suggs", "Orlando Magic", "SG", 80, 25, 9, 2, "none", 83],
    ["Wendell Carter Jr.", "Orlando Magic", "C", 79, 27, 12, 2, "none", 81],
    ["Jonathan Isaac", "Orlando Magic", "PF", 77, 29, 18, 1, "player", 72],

    ["Scottie Barnes", "Toronto Raptors", "SF", 87, 25, 11, 2, "none", 89],
    ["RJ Barrett", "Toronto Raptors", "SG", 82, 26, 25, 3, "none", 87],
    ["Immanuel Quickley", "Toronto Raptors", "PG", 83, 27, 33, 4, "none", 88],
    ["Jakob Poeltl", "Toronto Raptors", "C", 80, 30, 20, 2, "none", 84],
    ["Gradey Dick", "Toronto Raptors", "SG", 76, 22, 5, 3, "none", 86],

    ["Anfernee Simons", "Portland Trail Blazers", "SG", 84, 27, 26, 3, "none", 86],
    ["Jerami Grant", "Portland Trail Blazers", "PF", 82, 32, 30, 3, "none", 83],
    ["Deandre Ayton", "Portland Trail Blazers", "C", 81, 28, 34, 2, "none", 80],
    ["Scoot Henderson", "Portland Trail Blazers", "PG", 78, 22, 11, 3, "none", 82],
    ["Shaedon Sharpe", "Portland Trail Blazers", "SG", 79, 23, 7, 2, "none", 79]
  ].map((row) => ({
    name: row[0],
    team: row[1],
    position: row[2],
    overall: row[3],
    age: row[4],
    salaryM: row[5],
    yearsLeft: row[6],
    optionType: row[7],
    durability: row[8],
    source: "real"
  }));

  const GENERATED_BY_TEAM = {
    "Boston Celtics": ["Malik Freeman", "Nolan Price", "Elijah Boone", "Carter Wynn", "Darius Cole"],
    "Los Angeles Lakers": ["Marcus Hale", "Trey Lawson", "Isaiah Knox", "Devin Marsh", "Caleb Stone"],
    "Golden State Warriors": ["Jordan Bellamy", "Keon Rivers", "Miles Harper", "Quentin Shaw", "Bryce Nolan"],
    "Miami Heat": ["Andre Voss", "Leo Santiago", "Mason Reid", "Tyrell Banks", "Cameron Fox"],
    "New York Knicks": ["Zion Mercer", "Noah Briggs", "Caleb Vaughn", "Dante Ellis", "Mason Hart"],
    "Dallas Mavericks": ["Kobe Whitman", "Elias Turner", "Jace Holloway", "Ronan Cruz", "Tyler Dean"],
    "Denver Nuggets": ["Micah Sloan", "Owen Drake", "Blake Monroe", "Jayce Grant", "Xavier Flynn"],
    "Oklahoma City Thunder": ["Aiden Rowe", "Colby Lane", "Tyson Webb", "Evan Pike", "Ryder Moss"],
    "San Antonio Spurs": ["Landon Kerr", "Nico Dalton", "Felix Navarro", "Jamir Tate", "Seth Bishop"],
    "Orlando Magic": ["Adrian Cole", "Milo Benton", "CJ Randall", "Parker Tate", "Damon Quinn"],
    "Toronto Raptors": ["Malik Osei", "Roman Petrov", "Jaylin Cross", "Connor Wells", "Tariq Lowe"],
    "Portland Trail Blazers": ["Brandon York", "Ellis Boone", "Kian Douglas", "Harper James", "Omar Fields"]
  };

  const FREE_AGENT_NAMES = ["Gavin Rhodes", "Trevor Cain", "Julian Park", "Reggie Miles", "Simon Clarke", "Uriel Diaz", "Preston Hale", "Dante Ruiz", "Kelvin Shaw", "Wyatt Frost", "Amir Gordon", "Leon Pace"];

  const FALLBACK_PLAYERS = [...REAL_PLAYERS, ...createGeneratedPlayers()];

  const EVENT_SEEDS = {
    extension: [
      ["Franchise Star Wants Security", "Your top player asks for extension talks before rumors start."],
      ["Sixth Man Extension Window", "A key bench scorer wants long-term protection while his value rises."],
      ["Defensive Anchor Raise", "Your best stopper says he will test free agency without an offer."],
      ["Lead Guard Contract Pressure", "The point guard wants clarity before the trade market opens."],
      ["Young Core Deal Timing", "A young starter is entering a breakout phase and seeks a new contract."],
      ["Two-Year Bridge Offer", "Agent proposes a shorter bridge deal with upside incentives."],
      ["Veteran Discount Debate", "A respected veteran offers a cheaper extension if guaranteed years are added."],
      ["Cap-Friendly Bonus Structure", "Your cap team suggests creative bonuses to keep flexibility." ]
    ],
    option: [
      ["Player Option Looming", "A rotation player can opt out soon and wants to discuss role and money."],
      ["Bench Scorer Option Call", "Your microwave scorer asks if you will honor his player option path."],
      ["Starter Wants Control", "A starter wants a player option in the next contract revision."],
      ["Option Decline Rumors", "Media expects one of your veterans to decline his option."],
      ["Mutual Option Proposal", "Agent offers a mutual path to keep both sides flexible."],
      ["Cap Relief Opportunity", "Declining an option could save money but weaken short-term depth."],
      ["Locker Room Promise", "A veteran says he accepted less before and now expects option respect."],
      ["One-Year Decision", "You must decide whether to keep or clear an expiring option player."]
    ],
    tax: [
      ["Owner Sees Tax Bill", "Finance report shows a steep luxury tax payment approaching."],
      ["Apron Warning", "League office memo flags your apron proximity and future roster limits."],
      ["Quarterly Cash Alert", "Revenue growth slowed while payroll stayed high."],
      ["Tax Repeater Fear", "Staff warns that repeat-tax penalties can snowball next season."],
      ["Cap Department Mandate", "Ownership asks for at least one cost-control action this week."],
      ["Escalating Penalty Math", "A small payroll increase now could trigger larger tax multipliers."],
      ["Asset Protection Brief", "Front office says moving one contract now may prevent meltdown later."],
      ["Sponsor Concern", "A sponsor asks whether your tax spending has a clear win-now path."]
    ],
    trade: [
      ["Two-Team Framework", "A rival GM calls with a balanced framework around starters."],
      ["Three-Team Call", "A multi-team structure could solve multiple roster issues at once."],
      ["Defense-for-Scoring Swap", "You can improve one side of the ball while risking the other."],
      ["Future Pick Pressure", "You can include a future pick to target immediate talent."],
      ["Bench Consolidation", "Combine two role players into one higher-level contributor."],
      ["Buy-Low Star Opportunity", "A struggling star is available at a discount if you move quickly."],
      ["Expiring Contract Market", "You can rent help now or preserve cap room for next year."],
      ["Chemistry Gamble", "A high-talent player could raise ceiling but challenge locker room fit."]
    ],
    injury: [
      ["Medical Staff Caution", "Training load data shows increased soft-tissue risk."],
      ["Back-to-Back Fatigue", "The schedule cluster has your rotation at elevated fatigue."],
      ["Minor Knock, Major Choice", "A starter has a minor issue and asks to keep playing."],
      ["Durability Audit", "Sports science says too many high-minute nights this month."],
      ["Return Timeline Debate", "A recovering player can return now or wait one more week."],
      ["Practice Intensity Split", "Coaches and medical staff disagree on training load."],
      ["Depth Stress", "Bench injuries force tough minute management choices."],
      ["Veteran Maintenance", "An older star needs extra rest, which could hurt short-term results."]
    ],
    pr: [
      ["Podcast Quote Sparks Debate", "A player quote trends online and raises media pressure."],
      ["Press Conference Slip", "A tense comment creates a short-term public-relations problem."],
      ["Agent Leaks Story", "An agent leak questions your long-term plan."],
      ["Fan Campaign Trend", "Fans demand a major move on social media this week."],
      ["TV Panel Criticism", "National analysts question your cap strategy live on air."],
      ["Locker Room Rumor", "An anonymous report suggests chemistry tension."],
      ["Contract Narrative", "Media argues your recent contracts are either brilliant or reckless."],
      ["Public Patience Test", "A rough stretch has local press measuring job security."]
    ],
    breakout: [
      ["Young Wing Breakout", "A young wing exploded in efficiency and now expects a larger role."],
      ["Bench Guard Surge", "A reserve guard is outperforming contract value significantly."],
      ["Second-Year Jump", "A sophomore big is showing unexpected defensive growth."],
      ["Shooting Spike", "A role player is having a career-best shooting month."],
      ["Prospect Momentum", "Your youngest prospect is forcing lineup conversations."],
      ["Development Staff Win", "Player development staff asks for more minutes for a breakout candidate."],
      ["All-Bench Spark", "Second unit chemistry created a surprise competitive edge."],
      ["Contract Value Rising", "A breakout means future salary demands may increase soon."]
    ],
    sponsor: [
      ["Arena Naming Add-On", "A sponsor proposes a bonus package tied to media momentum."],
      ["Jersey Patch Renewal", "You can lock a long-term sponsor at a favorable rate now."],
      ["Community Series Deal", "A partner wants more community events tied to player availability."],
      ["Broadcast Segment Rights", "A sponsor asks for more behind-the-scenes access content."],
      ["Premium Partner Push", "A new sponsor offers upside but wants a star-focused campaign."],
      ["Revenue Stability Offer", "A conservative deal guarantees cash with lower upside."],
      ["Brand Risk Clause", "A major sponsor adds penalties for PR spikes."],
      ["Expansion Bid Support", "Sponsor backing could boost franchise value metrics this season."]
    ],
    philosophy: [
      ["Analytics vs Scouts", "Your departments disagree on who should shape next contracts."],
      ["Coaching Input Split", "Coaches prioritize fit while analysts push value contracts."],
      ["Pace Identity Debate", "Front office argues over high-tempo roster spending priorities."],
      ["Defense-First Blueprint", "Scouting says defense travels; analytics says shot profile matters more."],
      ["Youth Timeline Conflict", "One camp wants patience, another wants immediate veteran upgrades."],
      ["Shot Creation Priority", "Decision needed: pay creators now or invest in two-way depth."],
      ["Cap Discipline Meeting", "Internal debate on whether strict cap control limits upside."],
      ["Deadline Philosophy", "Push chips in now or guard future flexibility for a bigger strike."]
    ]
  };

  const CATEGORY_PROFILES = {
    extension: {
      prereq: (s) => s.roster.some((p) => p.overall >= 84 && p.yearsLeft <= 2),
      labels: ["Offer team-friendly extension", "Offer market-value extension", "Offer max-style extension", "Front-load and push chips in"],
      notes: [
        "Lower risk, keeps cap cleaner but may upset the player.",
        "Balanced approach that should keep trust stable.",
        "Big upside if performance rises, but cap pressure grows.",
        "Huge upside swing; media and owner will react hard."
      ],
      tags: [["Cap Discipline"], ["Stable Core"], ["Win-Now"], ["Win-Now", "Cap Crunch"]],
      base: [
        { payrollM: 3.5, teamRating: 1.2, franchiseValueB: 0.03, ownerPatience: 1, riskHeat: -2, mediaHeat: 1, volatility: 16 },
        { payrollM: 6.8, teamRating: 2.7, franchiseValueB: 0.06, ownerPatience: 1, riskHeat: 3, mediaHeat: 4, volatility: 24 },
        { payrollM: 10.2, teamRating: 4.1, franchiseValueB: 0.1, ownerPatience: -2, riskHeat: 11, mediaHeat: 7, volatility: 34 },
        { payrollM: 12.4, teamRating: 5.5, franchiseValueB: 0.14, ownerPatience: -4, riskHeat: 18, mediaHeat: 10, volatility: 42 }
      ],
      contractAction: ["extendSmall", "extendCore", "extendMax", "extendMax"]
    },
    option: {
      prereq: (s) => s.roster.some((p) => p.optionType === "player" || p.yearsLeft <= 1),
      labels: ["Decline and clear room", "Renegotiate 1+1", "Keep full option rights", "Sign-and-trade leverage play"],
      notes: [
        "Cap relief now, but role depth and chemistry could slip.",
        "Balanced flexibility with medium commitment.",
        "Stronger short-term lineup, less cap breathing room.",
        "High-ceiling chess move that can get messy fast."
      ],
      tags: [["Cap Relief"], ["Flexibility"], ["Win-Now"], ["Chaos"]],
      base: [
        { payrollM: -4.5, teamRating: -1.5, franchiseValueB: -0.02, ownerPatience: 2, riskHeat: -4, mediaHeat: -2, volatility: 18 },
        { payrollM: 1.2, teamRating: 1.1, franchiseValueB: 0.03, ownerPatience: 1, riskHeat: 1, mediaHeat: 2, volatility: 22 },
        { payrollM: 5.2, teamRating: 2.8, franchiseValueB: 0.07, ownerPatience: -1, riskHeat: 9, mediaHeat: 6, volatility: 33 },
        { payrollM: -0.8, teamRating: 2.2, franchiseValueB: 0.09, ownerPatience: -2, riskHeat: 14, mediaHeat: 9, volatility: 41 }
      ],
      contractAction: ["declineOption", "adjustOption", "keepOption", "flipOption"]
    },
    tax: {
      prereq: (s) => s.payroll > CONFIG.luxuryTaxLine - 8,
      labels: ["Dump salary now", "Trim one medium contract", "Ignore warning and spend", "Double-down on expensive talent"],
      notes: [
        "Owner will like this, but roster quality dips.",
        "Balanced tax control with moderate basketball cost.",
        "Could boost wins if it works, but checkbook pain rises.",
        "Big ceiling, huge meltdown risk if results fail."
      ],
      tags: [["Tax Dodger"], ["Cap Discipline"], ["Win-Now"], ["Cap Crunch", "Win-Now"]],
      base: [
        { payrollM: -10.5, teamRating: -2.1, franchiseValueB: -0.04, ownerPatience: 4, riskHeat: -5, mediaHeat: -1, volatility: 17 },
        { payrollM: -6.2, teamRating: -0.6, franchiseValueB: 0.01, ownerPatience: 3, riskHeat: -2, mediaHeat: 1, volatility: 21 },
        { payrollM: 5.3, teamRating: 3.1, franchiseValueB: 0.08, ownerPatience: -6, riskHeat: 10, mediaHeat: 8, volatility: 36 },
        { payrollM: 9.4, teamRating: 5.1, franchiseValueB: 0.14, ownerPatience: -10, riskHeat: 16, mediaHeat: 11, volatility: 45 }
      ],
      contractAction: ["salaryDump", "trimContract", "holdCourse", "holdCourse"]
    },
    trade: {
      prereq: () => true,
      labels: ["Small fit swap", "Balanced two-way trade", "Future assets for upside", "Three-team shock deal"],
      notes: [
        "Safe move that keeps floor stable.",
        "Healthy upside with manageable volatility.",
        "Large upside, can backfire if fit misses.",
        "Wildcard path: massive ceiling and noise."
      ],
      tags: [["Steady Hand"], ["Win-Now"], ["Win-Now", "Risk Play"], ["Chaos", "Win-Now"]],
      base: [
        { payrollM: -1.8, teamRating: 1.1, franchiseValueB: 0.03, ownerPatience: 1, riskHeat: 2, mediaHeat: 3, volatility: 18 },
        { payrollM: 1.1, teamRating: 2.3, franchiseValueB: 0.05, ownerPatience: 1, riskHeat: 6, mediaHeat: 5, volatility: 27 },
        { payrollM: 3.8, teamRating: 4.2, franchiseValueB: 0.11, ownerPatience: -2, riskHeat: 13, mediaHeat: 8, volatility: 38 },
        { payrollM: 6.4, teamRating: 5.3, franchiseValueB: 0.15, ownerPatience: -4, riskHeat: 19, mediaHeat: 12, volatility: 47 }
      ],
      contractAction: ["none", "none", "none", "none"]
    },
    injury: {
      prereq: (s) => averageDurability(s.roster) < 88 || s.riskHeat > 36,
      labels: ["Reduce minutes and rest", "Balanced load management", "Push starters harder", "Aggressive playoff prep"],
      notes: [
        "Lower injury risk, slight short-term performance dip.",
        "Middle path for health and wins.",
        "Boosts short-term rating but raises injury chance.",
        "Big upside and big downside in one bet."
      ],
      tags: [["Health First"], ["Stable Core"], ["Win-Now"], ["Win-Now", "Locker Room Risk"]],
      base: [
        { payrollM: 0, teamRating: -0.8, franchiseValueB: -0.01, ownerPatience: 1, riskHeat: -5, mediaHeat: -1, volatility: 14, durabilityShift: 4 },
        { payrollM: 0, teamRating: 0.5, franchiseValueB: 0.01, ownerPatience: 1, riskHeat: -1, mediaHeat: 1, volatility: 21, durabilityShift: 2 },
        { payrollM: 0, teamRating: 2.1, franchiseValueB: 0.04, ownerPatience: 0, riskHeat: 9, mediaHeat: 4, volatility: 34, durabilityShift: -3 },
        { payrollM: 0, teamRating: 3.8, franchiseValueB: 0.07, ownerPatience: -2, riskHeat: 14, mediaHeat: 7, volatility: 43, durabilityShift: -6 }
      ],
      contractAction: ["none", "none", "none", "none"]
    },
    pr: {
      prereq: (s) => s.mediaHeat > 15,
      labels: ["Give calm, clear statement", "Do selective interview circuit", "Lean into controversy", "Viral campaign gamble"],
      notes: [
        "Steady PR control with low upside.",
        "Can settle narrative and keep momentum.",
        "High attention can help or hurt quickly.",
        "Explosive upside if fans buy in, risk if they do not."
      ],
      tags: [["Media Control"], ["Narrative Win"], ["Locker Room Risk"], ["Chaos", "Win-Now"]],
      base: [
        { payrollM: 0, teamRating: 0.1, franchiseValueB: 0.02, ownerPatience: 2, riskHeat: -3, mediaHeat: -10, volatility: 12 },
        { payrollM: 0, teamRating: 0.8, franchiseValueB: 0.04, ownerPatience: 1, riskHeat: 1, mediaHeat: -5, volatility: 21 },
        { payrollM: 0, teamRating: 1.2, franchiseValueB: 0.06, ownerPatience: -2, riskHeat: 8, mediaHeat: 7, volatility: 34 },
        { payrollM: 0, teamRating: 1.6, franchiseValueB: 0.1, ownerPatience: -4, riskHeat: 13, mediaHeat: 12, volatility: 45 }
      ],
      contractAction: ["none", "none", "none", "none"]
    },
    breakout: {
      prereq: (s) => s.roster.some((p) => p.age <= 24 && p.overall <= 84),
      labels: ["Reward with steady role", "Raise role and minutes", "Feature him now", "Build offense around breakout"],
      notes: [
        "Safe growth path with controlled expectations.",
        "Balanced upside and development confidence.",
        "Can unlock real gains but may hurt chemistry.",
        "Massive upside; if it misses, everyone notices."
      ],
      tags: [["Youth Movement"], ["Youth Movement", "Analytics Darling"], ["Win-Now"], ["Win-Now", "Risk Play"]],
      base: [
        { payrollM: 0.6, teamRating: 1.1, franchiseValueB: 0.03, ownerPatience: 1, riskHeat: 1, mediaHeat: 2, volatility: 17 },
        { payrollM: 1.4, teamRating: 2.1, franchiseValueB: 0.05, ownerPatience: 1, riskHeat: 4, mediaHeat: 4, volatility: 24 },
        { payrollM: 2.4, teamRating: 3.3, franchiseValueB: 0.08, ownerPatience: -1, riskHeat: 9, mediaHeat: 6, volatility: 35 },
        { payrollM: 3.8, teamRating: 4.5, franchiseValueB: 0.12, ownerPatience: -3, riskHeat: 14, mediaHeat: 10, volatility: 43 }
      ],
      contractAction: ["none", "extendSmall", "extendCore", "extendCore"]
    },
    sponsor: {
      prereq: () => true,
      labels: ["Take guaranteed sponsor deal", "Balanced bonus structure", "Performance-heavy sponsor bet", "High-visibility sponsor gamble"],
      notes: [
        "Stable value growth with low risk.",
        "Balanced revenue and manageable pressure.",
        "Upside if narrative stays positive.",
        "Big money and big PR sensitivity."
      ],
      tags: [["Business Smart"], ["Business Smart"], ["Market Push"], ["Market Push", "Locker Room Risk"]],
      base: [
        { payrollM: 0, teamRating: 0, franchiseValueB: 0.07, ownerPatience: 2, riskHeat: -2, mediaHeat: -2, volatility: 12 },
        { payrollM: 0, teamRating: 0.3, franchiseValueB: 0.09, ownerPatience: 1, riskHeat: 1, mediaHeat: 1, volatility: 22 },
        { payrollM: 0, teamRating: 0.9, franchiseValueB: 0.13, ownerPatience: -1, riskHeat: 6, mediaHeat: 5, volatility: 32 },
        { payrollM: 0, teamRating: 1.3, franchiseValueB: 0.18, ownerPatience: -4, riskHeat: 12, mediaHeat: 10, volatility: 44 }
      ],
      contractAction: ["none", "none", "none", "none"]
    },
    philosophy: {
      prereq: () => true,
      labels: ["Choose cap discipline model", "Blend scouts and analytics", "Prioritize talent over structure", "All-in philosophy shakeup"],
      notes: [
        "Stable plan with limited immediate upside.",
        "Balanced identity and moderate growth.",
        "Short-term burst, long-term risk.",
        "High-upside reset that can fracture alignment."
      ],
      tags: [["Cap Discipline", "Analytics Darling"], ["Balanced Plan"], ["Win-Now"], ["Chaos", "Win-Now"]],
      base: [
        { payrollM: -1.2, teamRating: 0.5, franchiseValueB: 0.03, ownerPatience: 2, riskHeat: -3, mediaHeat: 0, volatility: 15 },
        { payrollM: 0.6, teamRating: 1.7, franchiseValueB: 0.06, ownerPatience: 1, riskHeat: 2, mediaHeat: 2, volatility: 24 },
        { payrollM: 3.4, teamRating: 3.2, franchiseValueB: 0.1, ownerPatience: -2, riskHeat: 10, mediaHeat: 6, volatility: 36 },
        { payrollM: 5.1, teamRating: 4.4, franchiseValueB: 0.14, ownerPatience: -4, riskHeat: 15, mediaHeat: 10, volatility: 46 }
      ],
      contractAction: ["none", "none", "none", "none"]
    }
  };

  const MINOR_EVENTS = [
    {
      title: "Training Focus",
      description: "Set weekly emphasis for the player development staff.",
      options: [
        { label: "Defense fundamentals", impacts: { teamRating: 0.6, ownerPatience: 1, riskHeat: -2, mediaHeat: -1 }, note: "Stable improvement." },
        { label: "Offense pace and space", impacts: { teamRating: 1.1, franchiseValueB: 0.02, riskHeat: 2, mediaHeat: 1 }, note: "Higher variance style." }
      ]
    },
    {
      title: "Staff Budget",
      description: "You can spend on front office tools or save cash now.",
      options: [
        { label: "Invest in scouting tools", impacts: { franchiseValueB: 0.03, ownerPatience: -1, riskHeat: -1 }, note: "Long-term upside." },
        { label: "Freeze spending", impacts: { ownerPatience: 2, teamRating: -0.4, riskHeat: -2 }, note: "Owner likes savings." }
      ]
    },
    {
      title: "Load Management",
      description: "Pick this week's rest strategy.",
      options: [
        { label: "Rest veterans", impacts: { teamRating: -0.5, riskHeat: -3, ownerPatience: 1 }, note: "Protect health." },
        { label: "Push for wins", impacts: { teamRating: 0.8, riskHeat: 3, mediaHeat: 2 }, note: "Raises short-term pressure." }
      ]
    },
    {
      title: "Community Event",
      description: "Sponsor asks for player appearances this week.",
      options: [
        { label: "Send full group", impacts: { franchiseValueB: 0.03, mediaHeat: -2, teamRating: -0.3 }, note: "Positive PR, small fatigue." },
        { label: "Keep players focused", impacts: { teamRating: 0.5, mediaHeat: 2, franchiseValueB: -0.01 }, note: "On-court focus only." }
      ]
    },
    {
      title: "Assistant Coach Input",
      description: "Assistant coach proposes rotation changes.",
      options: [
        { label: "Approve changes", impacts: { teamRating: 0.9, riskHeat: 1 }, note: "Potential spark." },
        { label: "Keep current plan", impacts: { ownerPatience: 1, riskHeat: -1 }, note: "Stable approach." }
      ]
    },
    {
      title: "Travel Schedule",
      description: "Optimize comfort or cost before road games.",
      options: [
        { label: "Premium travel", impacts: { teamRating: 0.6, ownerPatience: -1, franchiseValueB: -0.01 }, note: "Players fresh, owner notices spending." },
        { label: "Cost-efficient route", impacts: { ownerPatience: 1, teamRating: -0.2, riskHeat: -1 }, note: "Cheap and practical." }
      ]
    },
    {
      title: "Film Room Focus",
      description: "Allocate extra hours for opponent scouting or internal development.",
      options: [
        { label: "Opponent scouting", impacts: { teamRating: 0.7, riskHeat: -1 }, note: "Steady edge." },
        { label: "Internal development", impacts: { franchiseValueB: 0.02, teamRating: 0.4, mediaHeat: -1 }, note: "Growth-oriented." }
      ]
    },
    {
      title: "Rest Day Media Access",
      description: "Media requests additional player access.",
      options: [
        { label: "Approve access", impacts: { mediaHeat: -4, franchiseValueB: 0.02, riskHeat: 1 }, note: "Narrative cooling." },
        { label: "Decline access", impacts: { mediaHeat: 3, teamRating: 0.2, ownerPatience: 1 }, note: "Protect focus." }
      ]
    },
    {
      title: "Analytics Intern Proposal",
      description: "An intern proposes lineup tweaks for cap-efficient wins.",
      options: [
        { label: "Pilot the model", impacts: { teamRating: 0.8, franchiseValueB: 0.02, riskHeat: 1 }, note: "Data-driven upside." },
        { label: "Stay traditional", impacts: { ownerPatience: 1, riskHeat: -1 }, note: "Conservative call." }
      ]
    },
    {
      title: "Medical Equipment Upgrade",
      description: "Optional investment in recovery technology.",
      options: [
        { label: "Approve upgrade", impacts: { franchiseValueB: -0.01, teamRating: 0.6, riskHeat: -2 }, note: "Small cost, health gain." },
        { label: "Delay upgrade", impacts: { ownerPatience: 1, riskHeat: 1 }, note: "Save cash now." }
      ]
    }
  ];

  const TUTORIAL_STEPS = [
    {
      title: "1) Cap Space",
      body: "Cap Space means how much salary room you have under the cap line. If it is negative, you are over the cap and trades become harder."
    },
    {
      title: "2) Franchise Value",
      body: "Franchise Value is your business score in billions. Winning, smart contracts, and good media moments push it up."
    },
    {
      title: "3) Owner Patience",
      body: "Owner Patience is your job security. If it reaches 0, ownership fires you and your run ends."
    },
    {
      title: "4) Weekly Decisions",
      body: "Each week you pick one major front-office move. Some weeks add a quick minor move. Every choice changes your cap and team direction."
    },
    {
      title: "5) Trade Matching Rule",
      body: "Simple trade rule: if over the cap, incoming salary must be less than or equal to outgoing x 1.25 + $2M. If under the cap, payroll must stay near the cap with a small rookie exception."
    }
  ];

  let ui = {};
  let gameData = { teams: [], players: [], contentPack: null };
  let playersByName = new Map();
  let state = null;
  let eventLibrary = [];
  let scoreVisualState = null;

  let settings = {
    alwaysTooltips: false
  };

  document.addEventListener("DOMContentLoaded", bootstrap);

  async function bootstrap() {
    cacheUi();
    loadSettings();
    bindGlobalEvents();
    gameData = await loadGameData();
    playersByName = new Map(gameData.players.map((p) => [p.name, p]));
    eventLibrary = buildEventLibrary(gameData.contentPack);
    renderStartScreen();
    renderBestScoreBanner();
    maybeShowLastRunHint();
    refreshTooltipMode();
  }

  function cacheUi() {
    ui = {
      startScreen: byId("startScreen"),
      gameScreen: byId("gameScreen"),
      endScreen: byId("endScreen"),
      teamGrid: byId("teamGrid"),
      bestScoreBanner: byId("bestScoreBanner"),
      capSpaceValue: byId("capSpaceValue"),
      capSpaceTrend: byId("capSpaceTrend"),
      teamRatingValue: byId("teamRatingValue"),
      teamRatingTrend: byId("teamRatingTrend"),
      franchiseValueValue: byId("franchiseValueValue"),
      franchiseValueTrend: byId("franchiseValueTrend"),
      ownerPatienceValue: byId("ownerPatienceValue"),
      ownerPatienceTrend: byId("ownerPatienceTrend"),
      riskHeatValue: byId("riskHeatValue"),
      riskHeatTrend: byId("riskHeatTrend"),
      settingsBtn: byId("settingsBtn"),
      settingsOverlay: byId("settingsOverlay"),
      closeSettingsBtn: byId("closeSettingsBtn"),
      tooltipToggle: byId("tooltipToggle"),
      resetDataBtn: byId("resetDataBtn"),
      tickerBar: byId("tickerBar"),
      tickerText: byId("tickerText"),
      weekBadge: byId("weekBadge"),
      teamNameText: byId("teamNameText"),
      recordEstimateText: byId("recordEstimateText"),
      momentumText: byId("momentumText"),
      mediaHeatText: byId("mediaHeatText"),
      topHeadline: byId("topHeadline"),
      capSheetQuick: byId("capSheetQuick"),
      goalsList: byId("goalsList"),
      goalPulse: byId("goalPulse"),
      mediaHeatBar: byId("mediaHeatBar"),
      riskHeatBar: byId("riskHeatBar"),
      momentumBadge: byId("momentumBadge"),
      tagsWrap: byId("tagsWrap"),
      eventPanel: byId("eventPanel"),
      eventTitle: byId("eventTitle"),
      eventCategory: byId("eventCategory"),
      eventDescription: byId("eventDescription"),
      eventOptions: byId("eventOptions"),
      tradeDeadlinePanel: byId("tradeDeadlinePanel"),
      tradeOffers: byId("tradeOffers"),
      passTradeBtn: byId("passTradeBtn"),
      minorPanel: byId("minorPanel"),
      minorTitle: byId("minorTitle"),
      minorDescription: byId("minorDescription"),
      minorOptions: byId("minorOptions"),
      draftPanel: byId("draftPanel"),
      draftChoices: byId("draftChoices"),
      offseasonPanel: byId("offseasonPanel"),
      offseasonChoices: byId("offseasonChoices"),
      recapPanel: byId("recapPanel"),
      recapHeadlines: byId("recapHeadlines"),
      analystBlurb: byId("analystBlurb"),
      deltaPanel: byId("deltaPanel"),
      continueWeekBtn: byId("continueWeekBtn"),
      tooltipBubble: byId("tooltipBubble"),
      tutorialOverlay: byId("tutorialOverlay"),
      tutorialStepTitle: byId("tutorialStepTitle"),
      tutorialStepBody: byId("tutorialStepBody"),
      tutorialPrevBtn: byId("tutorialPrevBtn"),
      tutorialNextBtn: byId("tutorialNextBtn"),
      endTitle: byId("endTitle"),
      dynastyScoreText: byId("dynastyScoreText"),
      finalValueText: byId("finalValueText"),
      archetypeText: byId("archetypeText"),
      bestValueText: byId("bestValueText"),
      valueChart: byId("valueChart"),
      ratingChart: byId("ratingChart"),
      patienceChart: byId("patienceChart"),
      payrollChart: byId("payrollChart"),
      decisionList: byId("decisionList"),
      lessonsList: byId("lessonsList"),
      nextRunList: byId("nextRunList"),
      newRunBtn: byId("newRunBtn")
    };
  }

  function bindGlobalEvents() {
    ui.settingsBtn.addEventListener("click", () => showSettings(true));
    ui.closeSettingsBtn.addEventListener("click", () => showSettings(false));
    ui.tooltipToggle.addEventListener("change", () => {
      settings.alwaysTooltips = ui.tooltipToggle.checked;
      saveSettings();
      refreshTooltipMode();
    });

    ui.resetDataBtn.addEventListener("click", () => {
      const ok = window.confirm("Reset saved best score, tutorial status, and last run?");
      if (!ok) return;
      localStorage.removeItem(STORAGE.bestScore);
      localStorage.removeItem(STORAGE.lastRun);
      localStorage.removeItem(STORAGE.tutorialSeen);
      localStorage.removeItem(STORAGE.settings);
      settings = { alwaysTooltips: false };
      ui.tooltipToggle.checked = false;
      refreshTooltipMode();
      renderBestScoreBanner();
      showSettings(false);
      showToastHeadline("Saved data reset.");
    });

    ui.continueWeekBtn.addEventListener("click", () => {
      if (!state) return;
      finalizeWeekAndAdvance();
    });

    ui.passTradeBtn.addEventListener("click", () => {
      if (!state || state.locked) return;
      state.locked = true;
      addWeekHeadline("Deadline passes with no move.");
      addWeekHeadline("Analysts call it disciplined, fans call it quiet.");
      applyImpacts({
        payrollM: 0,
        teamRating: -0.2,
        franchiseValueB: 0,
        ownerPatience: 1,
        riskHeat: -4,
        mediaHeat: -2
      }, "trade-pass");
      state.decisionLog.push({ week: state.week, type: "Trade Deadline", choice: "Pass", title: "No deal" });
      finalizeDecisionPhase("Trade deadline closed without a move.");
    });

    ui.newRunBtn.addEventListener("click", () => {
      showScreen("start");
      state = null;
      renderBestScoreBanner();
      maybeShowLastRunHint();
    });

    bindTutorialEvents();
    bindTooltipEvents();
  }

  function bindTutorialEvents() {
    ui.tutorialPrevBtn.addEventListener("click", () => {
      if (!state || state.tutorialStep <= 0) return;
      state.tutorialStep -= 1;
      renderTutorialStep();
    });

    ui.tutorialNextBtn.addEventListener("click", () => {
      if (!state) return;
      if (state.tutorialStep >= TUTORIAL_STEPS.length - 1) {
        ui.tutorialOverlay.classList.add("hidden");
        localStorage.setItem(STORAGE.tutorialSeen, "true");
        return;
      }
      state.tutorialStep += 1;
      renderTutorialStep();
    });
  }

  function bindTooltipEvents() {
    const tipTargets = document.querySelectorAll("[data-tooltip]");
    tipTargets.forEach((el) => {
      el.addEventListener("mouseenter", (event) => {
        if (settings.alwaysTooltips) return;
        showTooltip(event.currentTarget);
      });
      el.addEventListener("mouseleave", () => {
        if (settings.alwaysTooltips) return;
        hideTooltip();
      });
      el.addEventListener("click", (event) => {
        if (settings.alwaysTooltips) return;
        showTooltip(event.currentTarget, true);
      });
      el.addEventListener("touchstart", (event) => {
        if (settings.alwaysTooltips) return;
        showTooltip(event.currentTarget, true);
      }, { passive: true });
    });
  }

  async function loadGameData() {
    try {
      const contentPackPromise = fetch("data/content-pack.json", { cache: "no-cache" }).catch(() => null);
      const [teamsResp, playersResp, contentResp] = await Promise.all([
        fetch("data/teams.json", { cache: "no-cache" }),
        fetch("data/players.json", { cache: "no-cache" }),
        contentPackPromise
      ]);
      if (!teamsResp.ok || !playersResp.ok) {
        throw new Error("Data files unavailable");
      }
      const teams = await teamsResp.json();
      const players = await playersResp.json();
      let contentPack = null;
      if (contentResp && contentResp.ok) {
        try {
          contentPack = sanitizeContentPack(await contentResp.json());
        } catch (_) {
          contentPack = null;
        }
      }
      return {
        teams: sanitizeTeams(teams),
        players: sanitizePlayers(players),
        contentPack
      };
    } catch (_) {
      return {
        teams: sanitizeTeams(FALLBACK_TEAMS),
        players: sanitizePlayers(FALLBACK_PLAYERS),
        contentPack: null
      };
    }
  }

  function sanitizeContentPack(contentPack) {
    if (!contentPack || typeof contentPack !== "object") return null;
    const inputSeeds = contentPack.eventSeeds;
    if (!inputSeeds || typeof inputSeeds !== "object") return null;

    const normalized = {};
    Object.entries(inputSeeds).forEach(([category, seeds]) => {
      if (!Array.isArray(seeds)) return;
      const valid = seeds
        .map((seed) => {
          if (Array.isArray(seed) && seed.length >= 2) {
            return [String(seed[0]), String(seed[1])];
          }
          if (seed && typeof seed === "object" && seed.title && seed.description) {
            return [String(seed.title), String(seed.description)];
          }
          return null;
        })
        .filter(Boolean);
      if (valid.length) {
        normalized[category] = valid;
      }
    });

    if (!Object.keys(normalized).length) return null;
    return {
      ...contentPack,
      eventSeeds: normalized
    };
  }

  function sanitizeTeams(teams) {
    return teams.map((team) => ({
      name: team.name,
      marketSize: team.marketSize,
      ownerTemperament: team.ownerTemperament,
      startingValueB: Number(team.startingValueB),
      startingPatience: Number(team.startingPatience),
      storyline: team.storyline,
      startingRoster: [...team.startingRoster]
    }));
  }

  function sanitizePlayers(players) {
    return players.map((p) => ({
      name: p.name,
      team: p.team,
      position: p.position,
      overall: Number(p.overall),
      age: Number(p.age),
      salaryM: Number(p.salaryM),
      yearsLeft: Number(p.yearsLeft),
      optionType: p.optionType || "none",
      durability: Number(p.durability),
      source: p.source || "generated"
    }));
  }

  function renderStartScreen() {
    ui.teamGrid.innerHTML = "";
    const shell = ui.startScreen.querySelector(".broadcast-shell");
    const existingPack = shell.querySelector(".content-pack-note");
    if (existingPack) existingPack.remove();
    if (gameData.contentPack && gameData.contentPack.name) {
      const note = document.createElement("p");
      note.className = "disclaimer content-pack-note";
      note.textContent = `Content pack connected: ${gameData.contentPack.name}`;
      shell.insertBefore(note, ui.teamGrid);
    }
    gameData.teams.forEach((team) => {
      const card = document.createElement("article");
      card.className = "team-card";
      card.innerHTML = `
        <h3>${team.name}</h3>
        <div class="team-meta">
          <span>Market: ${labelCase(team.marketSize)}</span>
          <span>Owner: ${labelCase(team.ownerTemperament)}</span>
          <span>Value: $${team.startingValueB.toFixed(1)}B</span>
        </div>
        <p class="team-story">${team.storyline}</p>
      `;
      const button = document.createElement("button");
      button.className = "primary-btn";
      button.type = "button";
      button.textContent = "Take GM Job";
      button.addEventListener("click", () => startRun(team.name));
      card.appendChild(button);
      ui.teamGrid.appendChild(card);
    });
  }

  function maybeShowLastRunHint() {
    const raw = localStorage.getItem(STORAGE.lastRun);
    if (!raw) return;
    try {
      const lastRun = JSON.parse(raw);
      if (!lastRun || !lastRun.team) return;
      const hint = document.createElement("p");
      hint.className = "disclaimer";
      hint.textContent = `Last run: ${lastRun.team}, Dynasty Score ${lastRun.dynastyScore}, Final Value $${Number(lastRun.finalFranchiseValueB || 0).toFixed(2)}B.`;
      const shell = ui.startScreen.querySelector(".broadcast-shell");
      const existing = shell.querySelector(".run-hint");
      if (existing) existing.remove();
      hint.classList.add("run-hint");
      shell.insertBefore(hint, ui.teamGrid);
    } catch (_) {
      // ignore corrupted data
    }
  }

  function renderBestScoreBanner() {
    const best = Number(localStorage.getItem(STORAGE.bestScore) || 0);
    ui.bestScoreBanner.textContent = best > 0
      ? `Best Franchise Value: $${best.toFixed(2)}B`
      : "Best Franchise Value: No saved run yet";
  }

  function startRun(teamName) {
    const team = gameData.teams.find((t) => t.name === teamName);
    if (!team) return;
    const roster = team.startingRoster
      .map((name) => clonePlayer(playersByName.get(name)))
      .filter(Boolean);

    const rosterFallbackNeeded = roster.length < 8;
    if (rosterFallbackNeeded) {
      const extras = gameData.players
        .filter((p) => p.team === team.name && !roster.some((r) => r.name === p.name))
        .slice(0, 8 - roster.length)
        .map(clonePlayer);
      roster.push(...extras);
    }

    const payroll = calcPayroll(roster, 0);
    const baseRating = calcRosterRating(roster);

    state = {
      team,
      roster,
      week: 1,
      payroll,
      deadCapM: 0,
      capSpace: CONFIG.salaryCap - payroll,
      teamRating: baseRating,
      franchiseValueB: team.startingValueB,
      ownerPatience: team.startingPatience,
      riskHeat: 32,
      mediaHeat: 30,
      momentum: MOMENTUM.STABLE,
      tags: new Set(seedInitialTags(team, payroll, baseRating, roster)),
      tickerHeadlines: ["Season opens with front office pressure."],
      usedEventIds: new Set(),
      decisionLog: [],
      weeklySnapshots: {
        weeks: [0],
        franchiseValue: [team.startingValueB],
        teamRating: [baseRating],
        ownerPatience: [team.startingPatience],
        payroll: [payroll],
        capLine: [CONFIG.salaryCap],
        taxLine: [CONFIG.luxuryTaxLine]
      },
      repeatTaxCount: 0,
      taxWeeks: 0,
      hotWeeks: 0,
      hiddenGoalRevealed: false,
      currentWeekRecap: null,
      currentMajorEvent: null,
      currentMinorEvent: null,
      currentTradeOffers: [],
      currentDraftChoices: [],
      finalOffseasonDone: false,
      pendingMinor: false,
      locked: false,
      tutorialStep: 0,
      goalHistory: []
    };

    scoreVisualState = null;

    state.ownerGoals = generateOwnerGoals();
    startWeekRecap();

    showScreen("game");
    renderEverything();
    showToastHeadline(`Welcome, GM of the ${team.name}.`);

    const tutorialSeen = localStorage.getItem(STORAGE.tutorialSeen) === "true";
    if (!tutorialSeen) {
      state.tutorialStep = 0;
      ui.tutorialOverlay.classList.remove("hidden");
      renderTutorialStep();
    }

    prepareWeek();
  }

  function showScreen(target) {
    ui.startScreen.classList.add("hidden");
    ui.gameScreen.classList.add("hidden");
    ui.endScreen.classList.add("hidden");
    if (target === "start") ui.startScreen.classList.remove("hidden");
    if (target === "game") ui.gameScreen.classList.remove("hidden");
    if (target === "end") ui.endScreen.classList.remove("hidden");
  }

  function renderEverything() {
    if (!state) return;
    syncPayrollAndCap();
    updateMomentum();
    renderScoreboard();
    renderBroadcastPanel();
    renderGoalsPanel();
    renderNarrativePanel();
    renderTicker();
    renderRecapPanel();
  }

  function renderScoreboard() {
    const nextValues = {
      capSpace: state.capSpace,
      teamRating: state.teamRating,
      franchiseValue: state.franchiseValueB,
      ownerPatience: state.ownerPatience,
      riskHeat: state.riskHeat
    };

    const previous = scoreVisualState || { ...nextValues };

    animateScoreValue(ui.capSpaceValue, previous.capSpace, nextValues.capSpace, (value) => signed(value, 1));
    animateScoreValue(ui.teamRatingValue, previous.teamRating, nextValues.teamRating, (value) => Math.round(value).toString());
    animateScoreValue(ui.franchiseValueValue, previous.franchiseValue, nextValues.franchiseValue, (value) => value.toFixed(2));
    animateScoreValue(ui.ownerPatienceValue, previous.ownerPatience, nextValues.ownerPatience, (value) => Math.round(value).toString());
    animateScoreValue(ui.riskHeatValue, previous.riskHeat, nextValues.riskHeat, (value) => Math.round(value).toString());

    setTrendState(ui.capSpaceTrend, ui.capSpaceValue.closest(".meter-card"), nextValues.capSpace - previous.capSpace, 1);
    setTrendState(ui.teamRatingTrend, ui.teamRatingValue.closest(".meter-card"), nextValues.teamRating - previous.teamRating, 1);
    setTrendState(ui.franchiseValueTrend, ui.franchiseValueValue.closest(".meter-card"), nextValues.franchiseValue - previous.franchiseValue, 2);
    setTrendState(ui.ownerPatienceTrend, ui.ownerPatienceValue.closest(".meter-card"), nextValues.ownerPatience - previous.ownerPatience, 1);
    setTrendState(ui.riskHeatTrend, ui.riskHeatValue.closest(".meter-card"), nextValues.riskHeat - previous.riskHeat, 1);

    scoreVisualState = { ...nextValues };
  }

  function animateScoreValue(element, from, to, formatter) {
    if (!element) return;
    if (!Number.isFinite(from) || !Number.isFinite(to) || Math.abs(to - from) < 0.01) {
      element.textContent = formatter(to);
      return;
    }

    if (element._animFrame) {
      cancelAnimationFrame(element._animFrame);
    }

    const startTime = performance.now();
    const duration = 220;
    const step = (now) => {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = from + (to - from) * eased;
      element.textContent = formatter(current);
      if (progress < 1) {
        element._animFrame = requestAnimationFrame(step);
      } else {
        element._animFrame = null;
      }
    };
    element._animFrame = requestAnimationFrame(step);
  }

  function setTrendState(trendEl, cardEl, delta, decimals) {
    if (!trendEl || !cardEl) return;
    const roundedDelta = roundTo(delta, decimals);
    const threshold = decimals >= 2 ? 0.01 : 0.1;
    cardEl.classList.remove("is-up", "is-down");
    trendEl.classList.remove("positive", "negative", "neutral");

    if (Math.abs(roundedDelta) < threshold) {
      trendEl.textContent = `• ${Math.abs(roundedDelta).toFixed(decimals)}`;
      trendEl.classList.add("neutral");
      return;
    }

    if (roundedDelta > 0) {
      trendEl.textContent = `▲ ${Math.abs(roundedDelta).toFixed(decimals)}`;
      trendEl.classList.add("positive");
      cardEl.classList.add("is-up");
      return;
    }

    trendEl.textContent = `▼ ${Math.abs(roundedDelta).toFixed(decimals)}`;
    trendEl.classList.add("negative");
    cardEl.classList.add("is-down");
  }

  function renderBroadcastPanel() {
    const projected = projectedRecord(state.teamRating, state.momentum, state.mediaHeat);
    ui.weekBadge.textContent = `Week ${state.week}`;
    ui.teamNameText.textContent = state.team.name;
    ui.recordEstimateText.textContent = `${projected.wins}-${projected.losses}`;
    ui.momentumText.textContent = state.momentum;
    ui.mediaHeatText.textContent = `${Math.round(state.mediaHeat)}`;
    ui.topHeadline.textContent = state.tickerHeadlines[0] || "No headlines yet.";

    const taxBill = estimateTaxBill();
    const capSheetHtml = [
      `<div><span>Payroll</span><strong>$${state.payroll.toFixed(1)}M</strong></div>`,
      `<div><span>Cap</span><strong>$${CONFIG.salaryCap.toFixed(1)}M</strong></div>`,
      `<div><span>Tax Line</span><strong>$${CONFIG.luxuryTaxLine.toFixed(1)}M</strong></div>`,
      `<div><span>Tax Bill</span><strong>$${taxBill.toFixed(1)}M</strong></div>`,
      `<div><span>Cap Space</span><strong>${signed(state.capSpace, 1)}M</strong></div>`,
      `<div><span>Dead Cap</span><strong>$${state.deadCapM.toFixed(1)}M</strong></div>`
    ];
    ui.capSheetQuick.innerHTML = capSheetHtml.join("");
  }

  function renderGoalsPanel() {
    ui.goalsList.innerHTML = "";
    const visibleGoals = state.ownerGoals.filter((g) => g.public || g.revealed);
    visibleGoals.forEach((goal) => {
      const progress = clamp(goal.progressFn(state), 0, 100);
      const complete = goal.completeFn(state);
      const goalItem = document.createElement("div");
      goalItem.className = "goal-item";
      const top = document.createElement("div");
      top.className = "goal-top";

      const title = document.createElement("span");
      title.className = "goal-title";
      title.textContent = goal.title;

      const percent = document.createElement("span");
      percent.className = "goal-percent";
      percent.textContent = `${Math.round(progress)}%`;

      top.appendChild(title);
      top.appendChild(percent);

      const progressShell = document.createElement("div");
      progressShell.className = "progress-shell";
      const progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      progressFill.style.width = `${progress}%`;
      progressShell.appendChild(progressFill);

      const note = document.createElement("p");
      note.className = "goal-note";
      note.textContent = complete ? "Completed" : goal.description;

      goalItem.appendChild(top);
      goalItem.appendChild(progressShell);
      goalItem.appendChild(note);
      ui.goalsList.appendChild(goalItem);
    });

    const completedVisible = visibleGoals.filter((g) => g.completeFn(state)).length;
    const pulse = completedVisible === visibleGoals.length ? "Ahead" : completedVisible > 0 ? "Mixed" : "Pressure";
    ui.goalPulse.textContent = pulse;
  }

  function renderNarrativePanel() {
    ui.mediaHeatBar.style.width = `${state.mediaHeat}%`;
    ui.riskHeatBar.style.width = `${state.riskHeat}%`;
    ui.momentumBadge.textContent = state.momentum;
    ui.tagsWrap.innerHTML = "";
    [...state.tags].slice(0, 8).forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      ui.tagsWrap.appendChild(chip);
    });
  }

  function renderTicker() {
    const joined = state.tickerHeadlines.slice(0, 5).join("   |   ");
    ui.tickerText.textContent = joined;
  }

  function startWeekRecap() {
    state.currentWeekRecap = {
      headlines: [],
      analyst: "",
      deltas: {
        payrollM: 0,
        teamRating: 0,
        franchiseValueB: 0,
        ownerPatience: 0,
        riskHeat: 0,
        mediaHeat: 0
      },
      decisions: []
    };
  }

  function renderRecapPanel() {
    const recap = state.currentWeekRecap;
    ui.recapHeadlines.innerHTML = "";
    recap.headlines.slice(0, 4).forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      ui.recapHeadlines.appendChild(p);
    });

    ui.analystBlurb.textContent = recap.analyst || "Analyst Desk: Waiting for your move.";

    const d = recap.deltas;
    const deltaRows = [
      ["Payroll", `${signed(d.payrollM, 1)}M`],
      ["Cap Space", `${signed(-d.payrollM, 1)}M`],
      ["Team Rating", signed(d.teamRating, 1)],
      ["Franchise Value", `${signed(d.franchiseValueB, 2)}B`],
      ["Owner Patience", signed(d.ownerPatience, 1)],
      ["Media Heat", signed(d.mediaHeat, 1)]
    ];
    ui.deltaPanel.innerHTML = deltaRows
      .map(([name, value]) => `<div class="delta-box"><span>${name}</span><strong>${value}</strong></div>`)
      .join("");
  }

  function prepareWeek() {
    if (!state) return;

    state.locked = false;
    playWeekTransition();
    startWeekRecap();
    ui.continueWeekBtn.classList.add("hidden");
    ui.continueWeekBtn.textContent = "Continue";
    ui.eventPanel.classList.add("hidden");
    ui.tradeDeadlinePanel.classList.add("hidden");
    ui.minorPanel.classList.add("hidden");
    ui.draftPanel.classList.add("hidden");
    ui.offseasonPanel.classList.add("hidden");

    if (state.week === CONFIG.hiddenGoalRevealWeek && !state.hiddenGoalRevealed) {
      revealHiddenGoal();
    }

    if (state.week === 7) {
      renderTradeDeadlineWeek();
    } else if (state.week === 12) {
      renderWeek12Finale();
    } else {
      renderMajorDecisionWeek();
    }

    renderEverything();
  }

  function renderMajorDecisionWeek() {
    const event = pickMajorEvent();
    state.currentMajorEvent = event;
    ui.eventPanel.classList.remove("hidden");

    ui.eventTitle.textContent = event.title;
    ui.eventCategory.textContent = categoryLabel(event.category);
    ui.eventDescription.textContent = event.description;
    ui.eventOptions.innerHTML = "";

    const wildcardUnlocked = state.riskHeat >= 62 || state.momentum === MOMENTUM.HOT;
    event.options.forEach((option, idx) => {
      if (option.requiresWildcard && !wildcardUnlocked) {
        return;
      }
      const card = document.createElement("article");
      const tierClass = `option-${option.tier.toLowerCase().replace(/\s+/g, "-")}`;
      card.className = `option-card ${tierClass}`;

      const capDelta = -option.impacts.payrollM;
      const chips = [
        `Cap ${signed(capDelta, 1)}M`,
        `Rating ${signed(option.impacts.teamRating, 1)}`,
        `Value ${signed(option.impacts.franchiseValueB, 2)}B`,
        `Patience ${signed(option.impacts.ownerPatience, 1)}`
      ];

      card.innerHTML = `
        <div class="option-head">
          <strong>${option.label}</strong>
          <span class="option-tier">${option.tier}</span>
        </div>
        <div class="risk-meter" aria-hidden="true"><span></span></div>
        <div class="option-impact">${chips.map((chip) => `<span>${chip}</span>`).join("")}</div>
        <p class="risk-note">Risk note: ${option.riskNote}</p>
      `;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = idx === 0 ? "Choose Safe" : idx === 1 ? "Choose Balanced" : idx === 2 ? "Choose Risky" : "Choose Wildcard";
      button.addEventListener("click", () => {
        if (state.locked) return;
        state.locked = true;
        resolveMajorChoice(event, option);
      });

      card.appendChild(button);
      ui.eventOptions.appendChild(card);
    });
  }

  function resolveMajorChoice(event, option) {
    const before = snapshotMetrics();
    applyImpacts(option.impacts, `major-${event.category}`);
    applyContractAction(option.contractAction, option.impacts);

    const swing = resolveRandomSwing(option);
    applyImpacts(swing, "swing");

    option.tags.forEach((tag) => state.tags.add(tag));
    normalizeTags();

    addWeekHeadline(`${event.title}: ${option.label}`);
    addWeekHeadline(swing.franchiseValueB >= 0 ? "Front office move lands positively." : "The gamble creates short-term turbulence.");
    addWeekHeadline(capHeadlineFromPayroll());

    state.currentWeekRecap.analyst = buildAnalystLine(event, option, swing);

    const after = snapshotMetrics();
    mergeRecapDeltas(diffSnapshots(before, after));

    state.decisionLog.push({
      week: state.week,
      type: "Major",
      title: event.title,
      choice: option.label,
      impact: diffSnapshots(before, after)
    });

    maybeQueueMinorDecision();
  }

  function resolveRandomSwing(option) {
    const marketBoost = state.team.marketSize === "large" ? 0.05 : state.team.marketSize === "small" ? -0.03 : 0;
    const momentumBoost = state.momentum === MOMENTUM.HOT ? 0.08 : state.momentum === MOMENTUM.CRISIS ? -0.1 : 0;
    const durabilityBoost = (averageDurability(state.roster) - 82) / 130;
    const mediaPenalty = state.mediaHeat / 600;
    const riskPenalty = state.riskHeat / 520;

    const successChance = clamp(0.56 + marketBoost + momentumBoost + durabilityBoost - mediaPenalty - riskPenalty - option.volatility / 250, 0.18, 0.82);

    const success = Math.random() < successChance;
    const riskScale = 1 + state.riskHeat / 190;
    const swingSize = option.volatility / 100;

    if (success) {
      return {
        payrollM: 0,
        teamRating: roundTo((0.6 + Math.random() * 1.2) * swingSize, 1),
        franchiseValueB: roundTo((0.01 + Math.random() * 0.04) * riskScale, 2),
        ownerPatience: roundTo(0.6 + Math.random() * 2.4, 1),
        riskHeat: roundTo(Math.random() * 2.2, 1),
        mediaHeat: roundTo(-0.8 + Math.random() * 2.6, 1)
      };
    }

    return {
      payrollM: 0,
      teamRating: roundTo(-(0.8 + Math.random() * 1.8) * swingSize, 1),
      franchiseValueB: roundTo(-(0.015 + Math.random() * 0.05) * riskScale, 2),
      ownerPatience: roundTo(-(1 + Math.random() * 3.2), 1),
      riskHeat: roundTo(1 + Math.random() * 3, 1),
      mediaHeat: roundTo(1 + Math.random() * 4.2, 1)
    };
  }

  function maybeQueueMinorDecision() {
    const eligibleWeeks = new Set([2, 4, 5, 6, 8, 9, 10, 11]);
    const roll = Math.random();
    state.pendingMinor = eligibleWeeks.has(state.week) && roll > 0.38;

    if (!state.pendingMinor) {
      finalizeDecisionPhase("Major move locked in.");
      return;
    }

    const minor = pickMinorEvent();
    state.currentMinorEvent = minor;
    ui.minorPanel.classList.remove("hidden");
    ui.minorTitle.textContent = minor.title;
    ui.minorDescription.textContent = minor.description;
    ui.minorOptions.innerHTML = "";

    minor.options.forEach((opt, idx) => {
      const card = document.createElement("article");
      card.className = `option-card ${idx === 0 ? "option-conservative" : "option-aggressive"}`;
      card.innerHTML = `
        <div class="option-head">
          <strong>${opt.label}</strong>
          <span class="option-tier">${idx === 0 ? "Conservative" : "Aggressive"}</span>
        </div>
        <div class="risk-meter" aria-hidden="true"><span></span></div>
        <div class="option-impact">
          <span>Rating ${signed(opt.impacts.teamRating || 0, 1)}</span>
          <span>Value ${signed(opt.impacts.franchiseValueB || 0, 2)}B</span>
          <span>Patience ${signed(opt.impacts.ownerPatience || 0, 1)}</span>
        </div>
        <p class="risk-note">${opt.note}</p>
      `;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Choose";
      btn.addEventListener("click", () => {
        if (state.locked && state.pendingMinor === false) return;
        resolveMinorChoice(minor, opt);
      });
      card.appendChild(btn);
      ui.minorOptions.appendChild(card);
    });

    state.locked = false;
  }

  function resolveMinorChoice(minor, option) {
    const before = snapshotMetrics();
    applyImpacts(option.impacts, "minor");
    addWeekHeadline(`Minor move: ${minor.title} — ${option.label}.`);
    state.currentWeekRecap.analyst = `Analyst Desk: Small choices matter. ${option.note}`;

    const after = snapshotMetrics();
    mergeRecapDeltas(diffSnapshots(before, after));

    state.decisionLog.push({
      week: state.week,
      type: "Minor",
      title: minor.title,
      choice: option.label,
      impact: diffSnapshots(before, after)
    });

    state.pendingMinor = false;
    finalizeDecisionPhase("Minor decision complete.");
  }

  function renderTradeDeadlineWeek() {
    ui.tradeDeadlinePanel.classList.remove("hidden");
    ui.tradeOffers.innerHTML = "";

    const offers = generateTradeOffers();
    state.currentTradeOffers = offers;

    offers.forEach((offer, idx) => {
      const card = document.createElement("article");
      card.className = "trade-card";

      const pkg = buildTradePackage(offer, false);
      const legal = isTradeLegal(pkg.outgoingSalaryM, pkg.incomingSalaryM);

      const title = document.createElement("h3");
      title.textContent = offer.title;
      const description = document.createElement("p");
      description.textContent = offer.description;
      const outgoingLine = document.createElement("p");
      outgoingLine.className = "trade-outgoing";
      const incomingLine = document.createElement("p");
      incomingLine.className = "trade-incoming";
      const salaryLine = document.createElement("p");
      salaryLine.className = "trade-salary";
      const legalBadge = document.createElement("span");
      const fitLine = document.createElement("p");
      fitLine.className = "risk-note";
      fitLine.textContent = `Fit impact: +${offer.fitImpact.offense} offense, +${offer.fitImpact.defense} defense, ${signed(offer.fitImpact.chemistry, 0)} chemistry`;

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(outgoingLine);
      card.appendChild(incomingLine);
      card.appendChild(salaryLine);
      card.appendChild(legalBadge);
      card.appendChild(fitLine);

      const applyTradeCardPackage = (packageView, legalNow) => {
        outgoingLine.innerHTML = `<strong>Outgoing:</strong> ${packageView.outgoingNames.join(", ")}`;
        incomingLine.innerHTML = `<strong>Incoming:</strong> ${packageView.incomingNames.join(", ")}`;
        salaryLine.textContent = `Outgoing $${packageView.outgoingSalaryM.toFixed(1)}M | Incoming $${packageView.incomingSalaryM.toFixed(1)}M`;
        legalBadge.className = legalNow ? "legal-ok" : "legal-bad";
        legalBadge.textContent = legalNow ? "Trade Legal" : "Trade Not Legal";
      };

      applyTradeCardPackage(pkg, legal);

      const counterRow = document.createElement("label");
      counterRow.className = "counter-row";
      const counterInput = document.createElement("input");
      counterInput.type = "checkbox";
      counterInput.dataset.offerIdx = String(idx);
      counterRow.appendChild(counterInput);
      counterRow.appendChild(document.createTextNode(" Counter offer (+risk, +upside)"));
      card.appendChild(counterRow);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Accept Offer";
      btn.addEventListener("click", () => {
        if (state.locked) return;
        const checked = counterInput.checked;
        acceptTradeOffer(offer, checked);
      });
      card.appendChild(btn);

      counterInput.addEventListener("change", () => {
        const useCounter = counterInput.checked;
        const packageView = buildTradePackage(offer, useCounter);
        const legalNow = isTradeLegal(packageView.outgoingSalaryM, packageView.incomingSalaryM);
        applyTradeCardPackage(packageView, legalNow);
      });

      ui.tradeOffers.appendChild(card);
    });

    addWeekHeadline("Breaking News: Deadline clock starts now.");
    addWeekHeadline("Four offers hit the desk. One call can define the season.");
  }

  function acceptTradeOffer(offer, useCounter) {
    const pkg = buildTradePackage(offer, useCounter);
    if (!isTradeLegal(pkg.outgoingSalaryM, pkg.incomingSalaryM)) {
      showToastHeadline("Trade blocked by cap matching rule.");
      return;
    }

    state.locked = true;
    const before = snapshotMetrics();

    const outgoingSet = new Set(pkg.outgoingNames);
    state.roster = state.roster.filter((p) => !outgoingSet.has(p.name));

    pkg.incomingPlayers.forEach((player) => {
      const clone = clonePlayer(player);
      clone.team = state.team.name;
      state.roster.push(clone);
    });

    const fitRatingBoost = (offer.fitImpact.offense + offer.fitImpact.defense + offer.fitImpact.chemistry * 0.5) / 2;
    const counterRisk = useCounter ? 8 : 0;
    const counterValue = useCounter ? 0.05 : 0.02;

    applyImpacts({
      payrollM: pkg.incomingSalaryM - pkg.outgoingSalaryM,
      teamRating: fitRatingBoost,
      franchiseValueB: counterValue,
      ownerPatience: fitRatingBoost > 0 ? 2 : -1,
      riskHeat: 5 + counterRisk,
      mediaHeat: 6 + (useCounter ? 4 : 0)
    }, "trade-deadline");

    state.teamRating = clamp(calcRosterRating(state.roster) + fitRatingBoost, 50, 99);

    if (useCounter) {
      state.tags.add("Chaos");
      state.tags.add("Win-Now");
    } else {
      state.tags.add("Trade Machine");
    }
    normalizeTags();

    addWeekHeadline(`${offer.title} accepted${useCounter ? " with counter" : ""}.`);
    addWeekHeadline(capHeadlineFromPayroll());
    addWeekHeadline(`Trade machine impact: offense +${offer.fitImpact.offense}, defense +${offer.fitImpact.defense}.`);

    state.currentWeekRecap.analyst = useCounter
      ? "Analyst Desk: Bold counter move. Ceiling rose, risk meter did too."
      : "Analyst Desk: Clean deadline execution with balanced cap logic.";

    const after = snapshotMetrics();
    const diff = diffSnapshots(before, after);
    mergeRecapDeltas(diff);

    state.decisionLog.push({
      week: state.week,
      type: "Trade Deadline",
      title: offer.title,
      choice: useCounter ? "Accept with counter" : "Accept",
      impact: diff
    });

    finalizeDecisionPhase("Trade deadline decision complete.");
  }

  function renderWeek12Finale() {
    ui.draftPanel.classList.remove("hidden");
    ui.draftChoices.innerHTML = "";

    const prospects = generateDraftProspects();
    state.currentDraftChoices = prospects;

    prospects.forEach((prospect) => {
      const card = document.createElement("article");
      let tierClass = "option-balanced";
      if (prospect.archetype.includes("Ceiling")) tierClass = "option-risky";
      if (prospect.archetype.includes("Floor")) tierClass = "option-safe";
      card.className = `option-card ${tierClass}`;
      card.innerHTML = `
        <div class="option-head">
          <strong>${prospect.name} (${prospect.position})</strong>
          <span class="option-tier">${prospect.archetype}</span>
        </div>
        <div class="risk-meter" aria-hidden="true"><span></span></div>
        <p>${prospect.summary}</p>
        <div class="option-impact">
          <span>Cap ${signed(-prospect.impacts.payrollM, 1)}M</span>
          <span>Rating ${signed(prospect.impacts.teamRating, 1)}</span>
          <span>Value ${signed(prospect.impacts.franchiseValueB, 2)}B</span>
        </div>
      `;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Draft Prospect";
      btn.addEventListener("click", () => chooseDraftProspect(prospect));
      card.appendChild(btn);
      ui.draftChoices.appendChild(card);
    });

    addWeekHeadline("Draft Night special begins.");
  }

  function chooseDraftProspect(prospect) {
    if (state.locked) return;
    state.locked = true;

    const before = snapshotMetrics();

    const rookie = {
      name: prospect.name,
      team: state.team.name,
      position: prospect.position,
      overall: prospect.baseOverall,
      age: 20,
      salaryM: prospect.impacts.payrollM,
      yearsLeft: 3,
      optionType: "none",
      durability: 82,
      source: "generated"
    };

    state.roster.push(rookie);
    applyImpacts(prospect.impacts, "draft");
    state.teamRating = clamp(calcRosterRating(state.roster) + prospect.impacts.teamRating, 50, 99);

    if (prospect.archetype.includes("Ceiling")) {
      state.tags.add("Youth Movement");
      state.tags.add("Risk Play");
    } else if (prospect.archetype.includes("Floor")) {
      state.tags.add("Cap Discipline");
    } else {
      state.tags.add("Balanced Plan");
    }
    normalizeTags();

    addWeekHeadline(`Drafted ${prospect.name} (${prospect.archetype}).`);
    state.currentWeekRecap.analyst = `Analyst Desk: ${prospect.archetype} pick made. Long-term timeline is now set.`;

    const after = snapshotMetrics();
    const diff = diffSnapshots(before, after);
    mergeRecapDeltas(diff);

    state.decisionLog.push({
      week: state.week,
      type: "Draft",
      title: "Draft Night",
      choice: `${prospect.name} - ${prospect.archetype}`,
      impact: diff
    });

    renderOffseasonChoices();
  }

  function renderOffseasonChoices() {
    ui.offseasonPanel.classList.remove("hidden");
    ui.offseasonChoices.innerHTML = "";

    const offseasonOptions = getOffseasonOptions();
    offseasonOptions.forEach((option, idx) => {
      const card = document.createElement("article");
      const tierClass = idx === 0 ? "option-risky" : idx === 1 ? "option-commitment" : "option-safe";
      card.className = `option-card ${tierClass}`;
      card.innerHTML = `
        <div class="option-head">
          <strong>${option.label}</strong>
          <span class="option-tier">Commitment</span>
        </div>
        <div class="risk-meter" aria-hidden="true"><span></span></div>
        <p>${option.description}</p>
        <div class="option-impact">
          <span>Cap ${signed(-option.impacts.payrollM, 1)}M</span>
          <span>Rating ${signed(option.impacts.teamRating, 1)}</span>
          <span>Value ${signed(option.impacts.franchiseValueB, 2)}B</span>
          <span>Patience ${signed(option.impacts.ownerPatience, 1)}</span>
        </div>
      `;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Choose Commitment";
      btn.addEventListener("click", () => chooseOffseason(option));
      card.appendChild(btn);
      ui.offseasonChoices.appendChild(card);
    });

    state.locked = false;
  }

  function chooseOffseason(option) {
    if (state.locked) return;
    state.locked = true;
    const before = snapshotMetrics();

    applyImpacts(option.impacts, "offseason");
    applyContractAction(option.contractAction, option.impacts);

    if (option.tag) state.tags.add(option.tag);
    normalizeTags();

    if (option.addPlayer) {
      const fa = option.addPlayer;
      const player = clonePlayer(fa);
      player.team = state.team.name;
      state.roster.push(player);
    }

    state.teamRating = clamp(calcRosterRating(state.roster) + option.impacts.teamRating, 50, 99);

    addWeekHeadline(`Offseason call: ${option.label}.`);
    addWeekHeadline(capHeadlineFromPayroll());
    state.currentWeekRecap.analyst = option.analyst;

    const after = snapshotMetrics();
    const diff = diffSnapshots(before, after);
    mergeRecapDeltas(diff);

    state.decisionLog.push({
      week: state.week,
      type: "Offseason",
      title: "Final Commitment",
      choice: option.label,
      impact: diff
    });

    state.finalOffseasonDone = true;
    finalizeDecisionPhase("Week 12 complete. Final report ready.", true);
  }

  function finalizeDecisionPhase(message, finalWeek = false) {
    renderEverything();
    ui.continueWeekBtn.classList.remove("hidden");
    ui.continueWeekBtn.textContent = finalWeek ? "View Final Report" : "Continue";
    showToastHeadline(message);
    state.locked = false;
  }

  function finalizeWeekAndAdvance() {
    if (!state) return;

    const beforeWeekClose = snapshotMetrics();
    applyWeeklyDriftAndSystems();
    const afterWeekClose = snapshotMetrics();
    mergeRecapDeltas(diffSnapshots(beforeWeekClose, afterWeekClose));
    renderEverything();

    const loss = checkLoseCondition();
    if (loss) {
      endRun(false, loss);
      return;
    }

    pushWeeklySnapshot();

    if (state.week >= CONFIG.totalWeeks) {
      endRun(true, "Finished Week 12 without being fired.");
      return;
    }

    state.week += 1;
    prepareWeek();
  }

  function applyWeeklyDriftAndSystems() {
    const marketBoost = state.team.marketSize === "large" ? 0.02 : state.team.marketSize === "small" ? -0.005 : 0.01;
    const momentumBoost = state.momentum === MOMENTUM.HOT ? 0.03 : state.momentum === MOMENTUM.CRISIS ? -0.028 : 0.008;
    const mediaSponsor = state.mediaHeat >= 28 && state.mediaHeat <= 64 ? 0.018 : state.mediaHeat > 82 ? -0.025 : 0.003;

    state.franchiseValueB += marketBoost + momentumBoost + mediaSponsor;

    const ratingDrift = state.momentum === MOMENTUM.HOT ? 0.6 : state.momentum === MOMENTUM.CRISIS ? -0.6 : 0.2;
    const durabilityDrift = (averageDurability(state.roster) - 84) / 18;
    state.teamRating += ratingDrift + durabilityDrift;

    const patienceDrift = state.momentum === MOMENTUM.HOT ? 1 : state.momentum === MOMENTUM.CRISIS ? -2 : 0;
    state.ownerPatience += patienceDrift;

    const taxImpact = applyTaxPenalty();
    if (taxImpact.applied) {
      addWeekHeadline(`Luxury tax hit: $${taxImpact.bill.toFixed(1)}M at multiplier ${taxImpact.multiplier.toFixed(2)}.`);
    }

    applyGoalPressure();
    resolveRiskEvents();
    decayRiskAndMedia();

    state.teamRating = clamp(state.teamRating, 45, 99);
    state.ownerPatience = clamp(state.ownerPatience, 0, 100);
    state.mediaHeat = clamp(state.mediaHeat, 0, 100);
    state.riskHeat = clamp(state.riskHeat, 0, 100);
    state.franchiseValueB = roundTo(Math.max(0.8, state.franchiseValueB), 3);

    syncPayrollAndCap();
    updateMomentum();
  }

  function applyTaxPenalty() {
    syncPayrollAndCap();
    if (state.payroll <= CONFIG.luxuryTaxLine) {
      state.repeatTaxCount = Math.max(0, state.repeatTaxCount - 1);
      return { applied: false, bill: 0, multiplier: 0 };
    }

    state.taxWeeks += 1;
    state.repeatTaxCount += 1;
    const overTax = state.payroll - CONFIG.luxuryTaxLine;
    const temperament = TEMPERAMENT_MOD[state.team.ownerTemperament] || 1;
    const multiplier = (1.15 + state.repeatTaxCount * 0.2) * temperament;
    const bill = overTax * multiplier;

    state.franchiseValueB -= bill * 0.0064;
    state.ownerPatience -= overTax * 0.14 + multiplier * 2.2;

    if (state.payroll > CONFIG.apronLine) {
      state.franchiseValueB -= 0.05;
      state.ownerPatience -= 3;
      state.mediaHeat += 4;
      addWeekHeadline("Apron breach alarm: flexibility penalties kick in.");
    }

    return { applied: true, bill, multiplier };
  }

  function applyGoalPressure() {
    state.ownerGoals.forEach((goal) => {
      const progress = clamp(goal.progressFn(state), 0, 100);
      const previous = goal.lastProgress ?? progress;
      if (goal.public || goal.revealed) {
        if (progress > previous + 1) {
          state.ownerPatience += 0.8;
        } else if (progress < previous - 1.2) {
          state.ownerPatience -= 0.8;
        }
      }
      goal.lastProgress = progress;
      state.goalHistory.push({ week: state.week, goalId: goal.id, progress });
    });
  }

  function resolveRiskEvents() {
    const disasterChance = clamp(0.02 + state.riskHeat / 230 + (state.momentum === MOMENTUM.CRISIS ? 0.05 : 0), 0.03, 0.37);
    if (Math.random() < disasterChance) {
      const disasters = [
        {
          headline: "Injury scare slows rotation confidence.",
          effects: { teamRating: -2.4, franchiseValueB: -0.05, ownerPatience: -3.2, mediaHeat: 7, riskHeat: 2 }
        },
        {
          headline: "Cap shock: guaranteed money surprise appears.",
          effects: { payrollM: 3.2, franchiseValueB: -0.06, ownerPatience: -4.1, mediaHeat: 5, riskHeat: 3 }
        },
        {
          headline: "Locker room rumor heats up TV panels.",
          effects: { teamRating: -1.4, franchiseValueB: -0.04, ownerPatience: -2.8, mediaHeat: 9, riskHeat: 2 }
        }
      ];
      const incident = pickRandom(disasters);
      applyImpacts(incident.effects, "risk-disaster");
      addWeekHeadline(incident.headline);
    }

    const upsideChance = state.riskHeat >= 64 ? 0.16 : 0.05;
    if (Math.random() < upsideChance) {
      const boom = {
        teamRating: 1.7,
        franchiseValueB: 0.06,
        ownerPatience: 1.8,
        mediaHeat: -1,
        riskHeat: -1
      };
      applyImpacts(boom, "risk-boom");
      addWeekHeadline("High-risk strategy hits: upside event boosts momentum.");
    }
  }

  function decayRiskAndMedia() {
    state.riskHeat -= state.momentum === MOMENTUM.HOT ? 3.2 : 2;
    state.mediaHeat -= state.momentum === MOMENTUM.CRISIS ? -1.2 : 1.5;
  }

  function checkLoseCondition() {
    if (state.ownerPatience <= 0) {
      return "Owner Patience dropped to zero. You were fired.";
    }

    const meltdown = state.payroll > CONFIG.apronLine + 12 ||
      (state.capSpace < -40 && state.repeatTaxCount >= 2) ||
      (state.franchiseValueB < 1.4 && state.mediaHeat > 85);

    if (meltdown) {
      return "Cap Violation / Financial Meltdown triggered termination.";
    }

    return null;
  }

  function endRun(won, reason) {
    const dynastyScore = computeDynastyScore();
    const archetype = determineArchetype();
    const lessons = buildLessons();
    const suggestions = buildSuggestions(archetype);

    const finalRun = {
      dateISO: new Date().toISOString(),
      team: state.team.name,
      won,
      reason,
      dynastyScore,
      finalFranchiseValueB: roundTo(state.franchiseValueB, 3),
      finalTeamRating: roundTo(state.teamRating, 1),
      finalOwnerPatience: roundTo(state.ownerPatience, 1),
      archetype,
      decisions: state.decisionLog,
      weeklySnapshots: state.weeklySnapshots,
      completedGoals: state.ownerGoals.filter((g) => g.completeFn(state)).map((g) => g.title),
      tags: [...state.tags],
      taxWeeks: state.taxWeeks,
      repeatTaxCount: state.repeatTaxCount,
      lessons
    };

    localStorage.setItem(STORAGE.lastRun, JSON.stringify(finalRun));

    const previousBest = Number(localStorage.getItem(STORAGE.bestScore) || 0);
    if (state.franchiseValueB > previousBest) {
      localStorage.setItem(STORAGE.bestScore, state.franchiseValueB.toFixed(3));
    }

    renderEndScreen({ won, reason, dynastyScore, archetype, lessons, suggestions });
    showScreen("end");
  }

  function renderEndScreen(payload) {
    const best = Number(localStorage.getItem(STORAGE.bestScore) || state.franchiseValueB);
    ui.endTitle.textContent = payload.won
      ? `Season Complete: You Survived All 12 Weeks`
      : `Run Ended: ${payload.reason}`;
    ui.dynastyScoreText.textContent = payload.dynastyScore.toString();
    ui.finalValueText.textContent = `$${state.franchiseValueB.toFixed(2)}B`;
    ui.archetypeText.textContent = payload.archetype;
    ui.bestValueText.textContent = `$${best.toFixed(2)}B`;

    drawSingleLineChart(ui.valueChart, state.weeklySnapshots.weeks, state.weeklySnapshots.franchiseValue, "#6ea8ff", "Franchise Value", (v) => `$${v.toFixed(2)}B`);
    drawSingleLineChart(ui.ratingChart, state.weeklySnapshots.weeks, state.weeklySnapshots.teamRating, "#c9b06f", "Team Rating", (v) => `${v.toFixed(0)}`);
    drawSingleLineChart(ui.patienceChart, state.weeklySnapshots.weeks, state.weeklySnapshots.ownerPatience, "#79d2a2", "Owner Patience", (v) => `${v.toFixed(0)}`);
    drawPayrollChart(ui.payrollChart, state.weeklySnapshots.weeks, state.weeklySnapshots.payroll, state.weeklySnapshots.capLine, state.weeklySnapshots.taxLine);

    ui.decisionList.innerHTML = "";
    state.decisionLog.forEach((decision) => {
      const li = document.createElement("li");
      li.textContent = `Week ${decision.week}: ${decision.type} — ${decision.choice}`;
      ui.decisionList.appendChild(li);
    });

    ui.lessonsList.innerHTML = "";
    payload.lessons.forEach((lesson) => {
      const li = document.createElement("li");
      li.textContent = lesson;
      ui.lessonsList.appendChild(li);
    });

    ui.nextRunList.innerHTML = "";
    payload.suggestions.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      ui.nextRunList.appendChild(li);
    });
  }

  function drawSingleLineChart(canvas, labels, values, color, label, formatter) {
    drawLineChart(canvas, labels, [{ values, color, label }], formatter);
  }

  function drawPayrollChart(canvas, labels, payroll, capLine, taxLine) {
    drawLineChart(
      canvas,
      labels,
      [
        { values: payroll, color: "#6ea8ff", label: "Payroll" },
        { values: capLine, color: "#79d2a2", label: "Salary Cap" },
        { values: taxLine, color: "#c9b06f", label: "Tax Line" }
      ],
      (v) => `$${v.toFixed(0)}M`
    );
  }

  function drawLineChart(canvas, labels, series, formatter) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, rect.width * dpr);
    canvas.height = Math.max(1, rect.height * dpr);
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const pad = { top: 14, right: 12, bottom: 22, left: 32 };

    const allValues = series.flatMap((line) => line.values);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = Math.max(1, max - min);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const y = pad.top + ((height - pad.top - pad.bottom) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    }

    series.forEach((line) => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      line.values.forEach((value, idx) => {
        const x = pad.left + ((width - pad.left - pad.right) * idx) / Math.max(1, labels.length - 1);
        const y = pad.top + ((height - pad.top - pad.bottom) * (max - value)) / range;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "11px Trebuchet MS";
    ctx.fillText(formatter(max), 4, pad.top + 8);
    ctx.fillText(formatter(min), 4, height - pad.bottom);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const lastLabel = labels[labels.length - 1] ?? 0;
    ctx.fillText(`W${labels[0]} - W${lastLabel}`, width - 78, height - 6);
  }

  function computeDynastyScore() {
    const valueScore = clamp((state.franchiseValueB / 8) * 520, 0, 520);
    const ratingScore = clamp(state.teamRating * 2.4, 0, 240);
    const capHealth = clamp(130 - state.taxWeeks * 9 - Math.max(0, -state.capSpace) * 1.1, 0, 160);
    const goalsDone = state.ownerGoals.filter((g) => g.completeFn(state)).length;
    const goalScore = goalsDone * 70;
    return Math.round(valueScore + ratingScore + capHealth + goalScore);
  }

  function determineArchetype() {
    const riskMoves = state.decisionLog
      .map((decision) => decision.impact && typeof decision.impact.riskHeat === "number" ? decision.impact.riskHeat : null)
      .filter((value) => typeof value === "number");
    const avgRisk = riskMoves.length ? avg(riskMoves) : state.riskHeat / 2;
    const tradeCount = state.decisionLog.filter((d) => d.type === "Trade Deadline" || d.type === "Major" && d.title.includes("Trade")).length;
    const taxStress = state.taxWeeks;

    if (taxStress <= 2 && state.capSpace > 0 && state.repeatTaxCount <= 1) return "Cap Wizard";
    if (tradeCount >= 3 && (state.riskHeat > 70 || avgRisk > 6)) return "Chaos Trader";
    if (state.teamRating >= 86 && (state.riskHeat >= 50 || avgRisk > 3)) return "Win-Now Dealer";
    if (state.riskHeat <= 35 && avgRisk < 2 && [...state.tags].includes("Youth Movement")) return "Patient Builder";
    if (taxStress <= 1 && state.capSpace > -5) return "Tax Dodger";
    return "Cap Wizard";
  }

  function buildLessons() {
    const lessons = [];
    lessons.push("Cap space is flexibility. Even small savings open better legal trade paths later.");
    lessons.push("Luxury tax is not just a number. Repeated tax weeks stack owner pressure and value loss.");
    lessons.push("Trade matching matters: over-cap teams cannot absorb salary freely.");
    lessons.push("Risk Heat can unlock huge upside, but it also raises disaster odds.");
    lessons.push("Media Heat changes business outcomes, not just headlines.");
    if (state.taxWeeks > 3) {
      lessons.push("This run showed how fast tax penalties can snowball into a financial meltdown.");
    }
    return lessons.slice(0, 6);
  }

  function buildSuggestions(archetype) {
    if (archetype === "Cap Wizard") {
      return [
        "Try a large-market team and aim for top-5 Team Rating while still avoiding repeat tax.",
        "Use one risky option per month to raise value without exploding Risk Heat.",
        "At Week 7, test a counteroffer once to compare upside vs stability."
      ];
    }
    if (archetype === "Chaos Trader") {
      return [
        "Run it back with lower Risk Heat until Week 6, then strike once at the deadline.",
        "Prioritize durability and PR control before making your next blockbuster.",
        "Set a hard cap rule: no deal that pushes payroll past the apron."
      ];
    }
    if (archetype === "Win-Now Dealer") {
      return [
        "Try a patient owner team and see if you can win with fewer tax weeks.",
        "Aim for HOT momentum while keeping media heat below 65.",
        "Draft high-floor prospects next run to protect late-season rating drops."
      ];
    }
    if (archetype === "Patient Builder") {
      return [
        "Take one aggressive Week 7 counter to test a higher-ceiling style.",
        "Push sponsor upside choices when media heat is low.",
        "Use extensions earlier to avoid expensive panic decisions later."
      ];
    }
    return [
      "Try a team with a heavy tax sheet and focus purely on value preservation.",
      "Use more balanced options to keep Owner Patience stable each month.",
      "Experiment with hidden-goal planning before Week 6 reveal."
    ];
  }

  function generateOwnerGoals() {
    const pool = [
      {
        id: "avoid-tax",
        title: "Avoid luxury tax penalties",
        description: "Keep payroll at or under tax line most weeks.",
        progressFn: (s) => clamp(100 - (s.taxWeeks / Math.max(1, s.week)) * 100, 0, 100),
        completeFn: (s) => s.taxWeeks <= 3
      },
      {
        id: "rating-top",
        title: "Finish with top-tier Team Rating",
        description: "Reach Team Rating 88 by season end.",
        progressFn: (s) => clamp((s.teamRating / 88) * 100, 0, 100),
        completeFn: (s) => s.teamRating >= 88
      },
      {
        id: "value-growth",
        title: "Grow franchise value by +$0.8B",
        description: "Business growth is a public goal.",
        progressFn: (s) => clamp(((s.franchiseValueB - s.team.startingValueB) / 0.8) * 100, 0, 100),
        completeFn: (s) => s.franchiseValueB - s.team.startingValueB >= 0.8
      },
      {
        id: "cap-buffer",
        title: "Maintain positive cap space",
        description: "Stay near or above cap flexibility.",
        progressFn: (s) => clamp(((s.capSpace + 30) / 50) * 100, 0, 100),
        completeFn: (s) => s.capSpace >= 0
      },
      {
        id: "media-control",
        title: "Keep media heat under control",
        description: "Avoid runaway media narrative pressure.",
        progressFn: (s) => clamp(100 - s.mediaHeat, 0, 100),
        completeFn: (s) => s.mediaHeat <= 55
      },
      {
        id: "hot-streak",
        title: "Create a HOT momentum streak",
        description: "Reach HOT momentum at least twice.",
        progressFn: (s) => clamp((s.hotWeeks / 2) * 100, 0, 100),
        completeFn: (s) => s.hotWeeks >= 2
      }
    ];

    const picks = shuffle(pool).slice(0, 3).map((goal, idx) => ({
      ...goal,
      public: idx < 2,
      revealed: idx < 2,
      lastProgress: goal.progressFn(state || { week: 1, taxWeeks: 0, teamRating: 70, franchiseValueB: 0, team: { startingValueB: 0 }, capSpace: 0, mediaHeat: 30, hotWeeks: 0 })
    }));

    return picks;
  }

  function revealHiddenGoal() {
    const hidden = state.ownerGoals.find((g) => !g.public);
    if (!hidden) return;
    hidden.revealed = true;
    state.hiddenGoalRevealed = true;
    addWeekHeadline(`Hidden goal revealed: ${hidden.title}.`);
    state.currentWeekRecap.analyst = "Analyst Desk: Ownership just added a new target to your report card.";
  }

  function pickMajorEvent() {
    const eligible = eventLibrary.filter((event) => event.prereq(state));
    const fresh = eligible.filter((event) => !state.usedEventIds.has(event.id));
    const pool = fresh.length ? fresh : eligible;
    const selected = pickRandom(pool);
    state.usedEventIds.add(selected.id);
    if (state.usedEventIds.size > 40) {
      state.usedEventIds.clear();
    }

    const varied = selected.options.map((option, idx) => {
      const scale = 1 + ((state.week % 3) - 1) * 0.06 + idx * 0.02;
      const impacts = {
        payrollM: roundTo(option.impacts.payrollM * scale, 1),
        teamRating: roundTo(option.impacts.teamRating * scale, 1),
        franchiseValueB: roundTo(option.impacts.franchiseValueB * scale, 2),
        ownerPatience: roundTo(option.impacts.ownerPatience * scale, 1),
        riskHeat: roundTo(option.impacts.riskHeat * scale, 1),
        mediaHeat: roundTo(option.impacts.mediaHeat * scale, 1)
      };
      return { ...option, impacts };
    });

    return {
      ...selected,
      options: varied
    };
  }

  function pickMinorEvent() {
    return pickRandom(MINOR_EVENTS);
  }

  function generateTradeOffers() {
    const rosterBySalary = [...state.roster].sort((a, b) => b.salaryM - a.salaryM);
    const externalPool = gameData.players
      .filter((p) => p.team !== state.team.name)
      .filter((p) => !state.roster.some((r) => r.name === p.name))
      .sort((a, b) => b.overall - a.overall);

    const usedIncoming = new Set();
    const offers = [];

    const templates = [
      {
        title: "Star Swing",
        description: "Move two salaries for one higher-usage creator.",
        outgoing: [rosterBySalary[2], rosterBySalary[4]],
        incomingTargetOverall: state.momentum === MOMENTUM.HOT ? 90 : 87,
        fit: { offense: 3, defense: 1, chemistry: -1 }
      },
      {
        title: "Defense and Depth",
        description: "Swap one scoring piece for two defensive role fits.",
        outgoing: [rosterBySalary[3]],
        incomingTargetOverall: 81,
        incomingCount: 2,
        fit: { offense: 1, defense: 3, chemistry: 1 }
      },
      {
        title: "Cap Relief Pivot",
        description: "Reduce future tax risk and add a younger contract.",
        outgoing: [rosterBySalary[1]],
        incomingTargetOverall: 78,
        incomingCount: 2,
        fit: { offense: 0, defense: 1, chemistry: 2 }
      },
      {
        title: "Future Bet",
        description: "Trade a veteran for younger upside and flexibility.",
        outgoing: [rosterBySalary[0]],
        incomingTargetOverall: 82,
        incomingCount: 2,
        fit: { offense: 2, defense: 2, chemistry: -1 }
      }
    ];

    templates.forEach((template) => {
      const incomingCount = template.incomingCount || 1;
      const incomingPlayers = [];
      let idx = 0;
      while (incomingPlayers.length < incomingCount && idx < externalPool.length) {
        const candidate = externalPool[idx];
        const nearTarget = Math.abs(candidate.overall - template.incomingTargetOverall) < 7;
        if (nearTarget && !usedIncoming.has(candidate.name)) {
          incomingPlayers.push(candidate);
          usedIncoming.add(candidate.name);
        }
        idx += 1;
      }

      if (!incomingPlayers.length) {
        incomingPlayers.push(...externalPool.filter((p) => !usedIncoming.has(p.name)).slice(0, incomingCount));
      }

      offers.push({
        title: template.title,
        description: template.description,
        outgoingPlayers: template.outgoing.filter(Boolean),
        incomingPlayers,
        fitImpact: template.fit,
        counterAddRisk: 8,
        counterValueBoost: 0.03
      });
    });

    return offers;
  }

  function buildTradePackage(offer, useCounter) {
    const outgoing = [...offer.outgoingPlayers];
    const incoming = [...offer.incomingPlayers];

    if (useCounter) {
      const extraOut = [...state.roster]
        .sort((a, b) => a.salaryM - b.salaryM)
        .find((p) => !outgoing.some((o) => o.name === p.name));
      if (extraOut) outgoing.push(extraOut);

      const extraIn = gameData.players
        .filter((p) => p.team !== state.team.name)
        .filter((p) => !incoming.some((i) => i.name === p.name))
        .filter((p) => !state.roster.some((r) => r.name === p.name))
        .sort((a, b) => b.overall - a.overall)[0];

      if (extraIn) incoming.push(extraIn);
    }

    const outgoingSalaryM = sum(outgoing.map((p) => p.salaryM));
    const incomingSalaryM = sum(incoming.map((p) => p.salaryM));

    return {
      outgoingPlayers: outgoing,
      incomingPlayers: incoming,
      outgoingNames: outgoing.map((p) => p.name),
      incomingNames: incoming.map((p) => p.name),
      outgoingSalaryM,
      incomingSalaryM
    };
  }

  function isTradeLegal(outgoingSalaryM, incomingSalaryM) {
    syncPayrollAndCap();
    const overCap = state.payroll > CONFIG.salaryCap;
    if (overCap) {
      const maxIncoming = roundTo(outgoingSalaryM * 1.25 + 2, 2);
      return incomingSalaryM <= maxIncoming + 0.001;
    }
    const newPayroll = state.payroll - outgoingSalaryM + incomingSalaryM;
    return newPayroll <= CONFIG.salaryCap + CONFIG.underCapExceptionM;
  }

  function generateDraftProspects() {
    const names = shuffle(["Kieran Moss", "Ty Hale", "Jamal Rivers", "Noah Chen", "Devin Price", "Arlo Bennett", "Micah Stone", "Rafael Cruz", "Evan Ortega", "Dante Brooks"]).slice(0, 3);
    return [
      {
        name: names[0],
        position: "SF",
        archetype: "High Ceiling / Low Floor",
        summary: "Explosive tools and shot creation upside. Could become a star, could stay raw.",
        baseOverall: 77,
        impacts: { payrollM: 5.2, teamRating: 1.2, franchiseValueB: 0.07, ownerPatience: 0, riskHeat: 8, mediaHeat: 5 }
      },
      {
        name: names[1],
        position: "C",
        archetype: "High Floor / Role Fit",
        summary: "Reliable rotation fit who helps immediately and keeps volatility low.",
        baseOverall: 75,
        impacts: { payrollM: 4.1, teamRating: 1.0, franchiseValueB: 0.04, ownerPatience: 2, riskHeat: -3, mediaHeat: 1 }
      },
      {
        name: names[2],
        position: "PG",
        archetype: "Balanced",
        summary: "Steady upside with cleaner fit across multiple lineups.",
        baseOverall: 76,
        impacts: { payrollM: 4.6, teamRating: 1.1, franchiseValueB: 0.05, ownerPatience: 1, riskHeat: 1, mediaHeat: 2 }
      }
    ];
  }

  function getOffseasonOptions() {
    const bestFA = gameData.players
      .filter((p) => p.team === "Free Agent")
      .sort((a, b) => b.overall - a.overall)[0] || null;

    return [
      {
        label: bestFA ? `Sign FA: ${bestFA.name}` : "Sign Veteran Free Agent",
        description: "Use cap room and market pull for immediate talent.",
        impacts: { payrollM: 12.5, teamRating: 3.2, franchiseValueB: 0.11, ownerPatience: 2, riskHeat: 7, mediaHeat: 6 },
        contractAction: "none",
        tag: "Win-Now",
        addPlayer: bestFA,
        analyst: "Analyst Desk: The front office picked immediate talent over long-term cap comfort."
      },
      {
        label: "Extend Core Star",
        description: "Secure your best player and stabilize your identity.",
        impacts: { payrollM: 8.7, teamRating: 2.7, franchiseValueB: 0.09, ownerPatience: 3, riskHeat: 3, mediaHeat: 3 },
        contractAction: "extendMax",
        tag: "Stable Core",
        analyst: "Analyst Desk: Core continuity chosen. Ceiling depends on internal growth next run."
      },
      {
        label: "Reset the Books",
        description: "Clear expensive commitments and protect future flexibility.",
        impacts: { payrollM: -14.2, teamRating: -2.5, franchiseValueB: 0.06, ownerPatience: 4, riskHeat: -6, mediaHeat: -3 },
        contractAction: "salaryDump",
        tag: "Tax Dodger",
        analyst: "Analyst Desk: Hard reset mode. Value and flexibility win, short-term strength dips."
      }
    ];
  }

  function applyImpacts(impacts, source = "generic") {
    const adjusted = { ...impacts };

    if (adjusted.ownerPatience < 0) {
      const mediaSensitivity = 1 + state.mediaHeat / 220;
      adjusted.ownerPatience = roundTo(adjusted.ownerPatience * mediaSensitivity, 1);
    }

    if (typeof adjusted.payrollM === "number") {
      if (source === "trade-deadline" || source === "draft") {
        // payroll changes are already reflected by roster updates; keep no double count
      } else {
        state.deadCapM = clamp(state.deadCapM + Math.max(0, adjusted.payrollM * 0.02), 0, 45);
      }
    }

    state.teamRating += adjusted.teamRating || 0;
    state.franchiseValueB += adjusted.franchiseValueB || 0;
    state.ownerPatience += adjusted.ownerPatience || 0;
    state.riskHeat += adjusted.riskHeat || 0;
    state.mediaHeat += adjusted.mediaHeat || 0;

    if (source.startsWith("major") && adjusted.payrollM) {
      // simulate contract shift by adjusting one roster salary so cap sheet reflects the move.
      adjustOneContract(adjusted.payrollM);
    }

    if (typeof impacts.durabilityShift === "number") {
      state.roster.forEach((player) => {
        player.durability = clamp(player.durability + impacts.durabilityShift, 55, 98);
      });
    }

    syncPayrollAndCap();

    state.teamRating = clamp(state.teamRating, 45, 99);
    state.ownerPatience = clamp(state.ownerPatience, 0, 100);
    state.franchiseValueB = Math.max(0.8, state.franchiseValueB);
    state.riskHeat = clamp(state.riskHeat, 0, 100);
    state.mediaHeat = clamp(state.mediaHeat, 0, 100);
  }

  function applyContractAction(action, impacts) {
    if (!action || action === "none") return;

    if (action === "extendSmall") {
      const player = pickCoreExtensionCandidate();
      if (!player) return;
      player.yearsLeft += 1;
      player.salaryM += Math.max(1.2, Math.abs(impacts.payrollM || 2) * 0.45);
      return;
    }

    if (action === "extendCore") {
      const player = pickCoreExtensionCandidate();
      if (!player) return;
      player.yearsLeft += 2;
      player.salaryM += Math.max(2.4, Math.abs(impacts.payrollM || 4) * 0.52);
      return;
    }

    if (action === "extendMax") {
      const player = pickCoreExtensionCandidate();
      if (!player) return;
      player.yearsLeft += 3;
      player.salaryM += Math.max(4, Math.abs(impacts.payrollM || 8) * 0.6);
      return;
    }

    if (action === "declineOption") {
      const optionPlayer = state.roster
        .filter((p) => p.optionType === "player" || p.yearsLeft <= 1)
        .sort((a, b) => b.salaryM - a.salaryM)[0];
      if (optionPlayer) {
        state.roster = state.roster.filter((p) => p.name !== optionPlayer.name);
        state.deadCapM += optionPlayer.salaryM * 0.35;
      }
      return;
    }

    if (action === "adjustOption") {
      const optionPlayer = state.roster.find((p) => p.optionType === "player");
      if (optionPlayer) {
        optionPlayer.optionType = "none";
        optionPlayer.yearsLeft += 1;
        optionPlayer.salaryM += 1.2;
      }
      return;
    }

    if (action === "keepOption") {
      const optionPlayer = state.roster.find((p) => p.optionType === "player");
      if (optionPlayer) {
        optionPlayer.yearsLeft = Math.max(optionPlayer.yearsLeft, 1);
      }
      return;
    }

    if (action === "flipOption") {
      const optionPlayer = state.roster.find((p) => p.optionType === "player");
      if (optionPlayer) {
        optionPlayer.optionType = "none";
        optionPlayer.salaryM = Math.max(2, optionPlayer.salaryM - 2.4);
        optionPlayer.yearsLeft = 2;
      }
      return;
    }

    if (action === "salaryDump") {
      const target = [...state.roster].sort((a, b) => b.salaryM - a.salaryM)[0];
      if (target) {
        state.roster = state.roster.filter((p) => p.name !== target.name);
        state.deadCapM += target.salaryM * 0.4;
      }
      return;
    }

    if (action === "trimContract") {
      const target = [...state.roster].sort((a, b) => b.salaryM - a.salaryM)[0];
      if (target) {
        target.salaryM = Math.max(2, target.salaryM - 4.5);
      }
      return;
    }

    if (action === "holdCourse") {
      // intentionally no contract mutation
    }
  }

  function pickCoreExtensionCandidate() {
    return [...state.roster]
      .filter((p) => p.overall >= 80)
      .sort((a, b) => b.overall - a.overall)[0] || null;
  }

  function adjustOneContract(payrollDeltaM) {
    if (!payrollDeltaM) return;
    const target = [...state.roster]
      .sort((a, b) => b.salaryM - a.salaryM)[0];
    if (!target) return;

    const share = payrollDeltaM / 2;
    target.salaryM = Math.max(1.2, roundTo(target.salaryM + share, 1));
  }

  function updateMomentum() {
    const len = state.weeklySnapshots.teamRating.length;
    const previous = len > 1 ? state.weeklySnapshots.teamRating[len - 1] : state.teamRating;
    const trend = state.teamRating - previous;

    if (trend >= 1.6 && state.mediaHeat < 66 && state.ownerPatience > 35) {
      state.momentum = MOMENTUM.HOT;
      state.hotWeeks += 1;
    } else if (trend <= -1.6 || state.mediaHeat >= 78 || state.ownerPatience < 28) {
      state.momentum = MOMENTUM.CRISIS;
    } else {
      state.momentum = MOMENTUM.STABLE;
    }
  }

  function pushWeeklySnapshot() {
    state.weeklySnapshots.weeks.push(state.week);
    state.weeklySnapshots.franchiseValue.push(roundTo(state.franchiseValueB, 3));
    state.weeklySnapshots.teamRating.push(roundTo(state.teamRating, 2));
    state.weeklySnapshots.ownerPatience.push(roundTo(state.ownerPatience, 2));
    state.weeklySnapshots.payroll.push(roundTo(state.payroll, 2));
    state.weeklySnapshots.capLine.push(CONFIG.salaryCap);
    state.weeklySnapshots.taxLine.push(CONFIG.luxuryTaxLine);
  }

  function syncPayrollAndCap() {
    state.payroll = calcPayroll(state.roster, state.deadCapM);
    state.capSpace = roundTo(CONFIG.salaryCap - state.payroll, 2);
  }

  function calcPayroll(roster, deadCapM = 0) {
    return roundTo(sum(roster.map((p) => Number(p.salaryM) || 0)) + Number(deadCapM || 0), 2);
  }

  function calcRosterRating(roster) {
    const top = [...roster].sort((a, b) => b.overall - a.overall).slice(0, 8);
    if (!top.length) return 60;
    return roundTo(avg(top.map((p) => p.overall)), 1);
  }

  function averageDurability(roster) {
    if (!roster.length) return 80;
    return avg(roster.map((p) => p.durability || 80));
  }

  function projectedRecord(teamRating, momentum, mediaHeat) {
    const momentumBoost = momentum === MOMENTUM.HOT ? 5 : momentum === MOMENTUM.CRISIS ? -5 : 0;
    const base = Math.round((teamRating - 68) * 1.25 + 34 + momentumBoost - mediaHeat * 0.05);
    const wins = clamp(base, 18, 64);
    return { wins, losses: 82 - wins };
  }

  function estimateTaxBill() {
    if (state.payroll <= CONFIG.luxuryTaxLine) return 0;
    const overTax = state.payroll - CONFIG.luxuryTaxLine;
    const temperament = TEMPERAMENT_MOD[state.team.ownerTemperament] || 1;
    const multiplier = (1.15 + state.repeatTaxCount * 0.2) * temperament;
    return overTax * multiplier;
  }

  function capHeadlineFromPayroll() {
    if (state.payroll > CONFIG.apronLine) {
      return "Cap sheet alert: payroll above apron pressure zone.";
    }
    if (state.payroll > CONFIG.luxuryTaxLine) {
      return "Cap sheet update: over tax line, checks are getting larger.";
    }
    if (state.capSpace >= 0) {
      return "Cap sheet clean: room remains under the salary cap.";
    }
    return "Cap sheet tight: over cap but below tax line.";
  }

  function buildAnalystLine(event, option, swing) {
    const mood = swing.franchiseValueB >= 0 ? "positive" : "skeptical";
    const riskWord = option.tier.toLowerCase();
    const momentumWord = state.momentum.toLowerCase();
    return `Analyst Desk: ${mood} reaction to this ${riskWord} move in a ${momentumWord} momentum week. Keep watching owner tolerance and cap pressure.`;
  }

  function addWeekHeadline(text) {
    state.currentWeekRecap.headlines.push(text);
    state.tickerHeadlines.unshift(text);
    state.tickerHeadlines = state.tickerHeadlines.slice(0, 7);
    triggerBreakingVisual(text);
  }

  function mergeRecapDeltas(diff) {
    const d = state.currentWeekRecap.deltas;
    d.payrollM = roundTo(d.payrollM + (diff.payrollM || 0), 1);
    d.teamRating = roundTo(d.teamRating + (diff.teamRating || 0), 1);
    d.franchiseValueB = roundTo(d.franchiseValueB + (diff.franchiseValueB || 0), 2);
    d.ownerPatience = roundTo(d.ownerPatience + (diff.ownerPatience || 0), 1);
    d.riskHeat = roundTo(d.riskHeat + (diff.riskHeat || 0), 1);
    d.mediaHeat = roundTo(d.mediaHeat + (diff.mediaHeat || 0), 1);
  }

  function snapshotMetrics() {
    return {
      payrollM: state.payroll,
      teamRating: state.teamRating,
      franchiseValueB: state.franchiseValueB,
      ownerPatience: state.ownerPatience,
      riskHeat: state.riskHeat,
      mediaHeat: state.mediaHeat,
      capSpace: state.capSpace
    };
  }

  function diffSnapshots(before, after) {
    return {
      payrollM: roundTo((after.payrollM || 0) - (before.payrollM || 0), 1),
      teamRating: roundTo((after.teamRating || 0) - (before.teamRating || 0), 1),
      franchiseValueB: roundTo((after.franchiseValueB || 0) - (before.franchiseValueB || 0), 2),
      ownerPatience: roundTo((after.ownerPatience || 0) - (before.ownerPatience || 0), 1),
      riskHeat: roundTo((after.riskHeat || 0) - (before.riskHeat || 0), 1),
      mediaHeat: roundTo((after.mediaHeat || 0) - (before.mediaHeat || 0), 1),
      capSpace: roundTo((after.capSpace || 0) - (before.capSpace || 0), 1)
    };
  }

  function showSettings(open) {
    ui.settingsOverlay.classList.toggle("hidden", !open);
    ui.tooltipToggle.checked = settings.alwaysTooltips;
  }

  function renderTutorialStep() {
    const step = TUTORIAL_STEPS[state.tutorialStep];
    ui.tutorialStepTitle.textContent = step.title;
    ui.tutorialStepBody.textContent = step.body;
    ui.tutorialPrevBtn.disabled = state.tutorialStep === 0;
    ui.tutorialNextBtn.textContent = state.tutorialStep === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next";
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE.settings);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      settings.alwaysTooltips = Boolean(parsed.alwaysTooltips);
    } catch (_) {
      settings = { alwaysTooltips: false };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE.settings, JSON.stringify(settings));
  }

  function refreshTooltipMode() {
    document.body.classList.toggle("show-tooltips", settings.alwaysTooltips);
    if (settings.alwaysTooltips) hideTooltip();
  }

  function showTooltip(target, autoHide = false) {
    const text = target.dataset.tooltip;
    if (!text) return;
    const rect = target.getBoundingClientRect();
    ui.tooltipBubble.textContent = text;
    ui.tooltipBubble.classList.remove("hidden");
    ui.tooltipBubble.style.left = `${Math.min(window.innerWidth - 260, rect.left + 8)}px`;
    ui.tooltipBubble.style.top = `${Math.max(8, rect.bottom + 10)}px`;

    if (autoHide) {
      window.clearTimeout(showTooltip.hideTimer);
      showTooltip.hideTimer = window.setTimeout(hideTooltip, 2200);
    }
  }

  function hideTooltip() {
    ui.tooltipBubble.classList.add("hidden");
  }

  function showToastHeadline(text) {
    ui.topHeadline.textContent = text;
    triggerBreakingVisual(text);
  }

  function triggerBreakingVisual(text) {
    if (!ui.tickerBar || !ui.topHeadline) return;
    const urgent = /(breaking|deadline|shock|alert|fired|meltdown)/i.test(text || "");

    ui.topHeadline.classList.remove("headline-flash");
    void ui.topHeadline.offsetWidth;
    ui.topHeadline.classList.add("headline-flash");

    if (!urgent) return;
    ui.tickerBar.classList.remove("breaking-news");
    void ui.tickerBar.offsetWidth;
    ui.tickerBar.classList.add("breaking-news");
    window.clearTimeout(triggerBreakingVisual._timer);
    triggerBreakingVisual._timer = window.setTimeout(() => {
      ui.tickerBar.classList.remove("breaking-news");
    }, 520);
  }

  function playWeekTransition() {
    ui.gameScreen.classList.remove("week-transition");
    void ui.gameScreen.offsetWidth;
    ui.gameScreen.classList.add("week-transition");
    window.clearTimeout(playWeekTransition._timer);
    playWeekTransition._timer = window.setTimeout(() => {
      ui.gameScreen.classList.remove("week-transition");
    }, 360);
  }

  function normalizeTags() {
    const forceTags = [];
    if (state.payroll > CONFIG.luxuryTaxLine) forceTags.push("Cap Crunch");
    if (avg(state.roster.map((p) => p.age)) <= 25.5) forceTags.push("Youth Movement");
    if (state.teamRating >= 86) forceTags.push("Win-Now");
    if (state.riskHeat >= 70) forceTags.push("Locker Room Risk");
    if (state.riskHeat <= 35) forceTags.push("Cap Discipline");
    if (state.mediaHeat <= 35) forceTags.push("Analytics Darling");

    const merged = new Set([...state.tags, ...forceTags]);
    state.tags = new Set([...merged].slice(-8));
  }

  function buildEventLibrary(contentPack = null) {
    const library = [];
    const eventSeedSource = resolveEventSeedSource(contentPack);

    Object.entries(eventSeedSource).forEach(([category, seeds]) => {
      seeds.forEach((seed, idx) => {
        const profile = CATEGORY_PROFILES[category];
        if (!profile) return;
        const options = profile.base.map((base, optionIndex) => ({
          label: profile.labels[optionIndex],
          tier: optionIndex === 0 ? "Safe" : optionIndex === 1 ? "Balanced" : optionIndex === 2 ? "Risky" : "Wildcard",
          riskNote: profile.notes[optionIndex],
          impacts: {
            payrollM: base.payrollM,
            teamRating: base.teamRating,
            franchiseValueB: base.franchiseValueB,
            ownerPatience: base.ownerPatience,
            riskHeat: base.riskHeat,
            mediaHeat: base.mediaHeat,
            durabilityShift: base.durabilityShift || 0
          },
          volatility: base.volatility,
          tags: profile.tags[optionIndex] || [],
          contractAction: profile.contractAction[optionIndex] || "none",
          requiresWildcard: optionIndex === 3
        }));

        library.push({
          id: `${category}-${idx}`,
          category,
          title: seed[0],
          description: seed[1],
          prereq: profile.prereq,
          options
        });
      });
    });

    return library;
  }

  function resolveEventSeedSource(contentPack) {
    const merged = {};
    const external = contentPack && contentPack.eventSeeds ? contentPack.eventSeeds : {};
    const categories = new Set([...Object.keys(EVENT_SEEDS), ...Object.keys(external)]);

    categories.forEach((category) => {
      const fallback = EVENT_SEEDS[category] || [];
      const custom = Array.isArray(external[category]) ? external[category] : [];
      const seenTitles = new Set();
      const combined = [];

      [...custom, ...fallback].forEach((seed) => {
        if (!Array.isArray(seed) || seed.length < 2) return;
        const titleKey = String(seed[0]).trim().toLowerCase();
        if (!titleKey || seenTitles.has(titleKey)) return;
        seenTitles.add(titleKey);
        combined.push([String(seed[0]), String(seed[1])]);
      });

      if (combined.length) {
        merged[category] = combined;
      }
    });

    return merged;
  }

  function seedInitialTags(team, payroll, rating, roster) {
    const tags = [team.marketSize === "large" ? "Spotlight Market" : "Small-Market Grind"];
    if (payroll > CONFIG.luxuryTaxLine) tags.push("Cap Crunch");
    if (rating >= 84) tags.push("Win-Now");
    if (avg(roster.map((p) => p.age)) < 26) tags.push("Youth Movement");
    tags.push("Balanced Plan");
    return tags;
  }

  function createGeneratedPlayers() {
    const positions = ["PG", "SG", "SF", "PF", "C"];
    const out = [];
    let idx = 0;

    Object.entries(GENERATED_BY_TEAM).forEach(([teamName, names]) => {
      names.forEach((name, i) => {
        const base = 68 + ((idx + i) % 10);
        out.push({
          name,
          team: teamName,
          position: positions[(idx + i) % positions.length],
          overall: Math.min(81, base + (i % 2)),
          age: 21 + ((idx + i) % 11),
          salaryM: roundTo(2.2 + ((idx * 3 + i * 2) % 18) * 0.45, 1),
          yearsLeft: 1 + ((idx + i) % 3),
          optionType: (idx + i) % 5 === 0 ? "player" : "none",
          durability: 74 + ((idx + i * 3) % 21),
          source: "generated"
        });
      });
      idx += 1;
    });

    FREE_AGENT_NAMES.forEach((name, i) => {
      out.push({
        name,
        team: "Free Agent",
        position: positions[i % positions.length],
        overall: 69 + (i % 9),
        age: 22 + (i % 10),
        salaryM: roundTo(3 + (i % 7) * 0.8, 1),
        yearsLeft: 1 + (i % 2),
        optionType: i % 4 === 0 ? "player" : "none",
        durability: 76 + (i % 18),
        source: "generated"
      });
    });

    return out;
  }

  function categoryLabel(category) {
    const map = {
      extension: "Extension",
      option: "Player Option",
      tax: "Tax / Cap",
      trade: "Trade",
      injury: "Durability",
      pr: "Media / PR",
      breakout: "Breakout",
      sponsor: "Sponsor",
      philosophy: "Philosophy"
    };
    return map[category] || "Decision";
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function clonePlayer(player) {
    if (!player) return null;
    return {
      name: player.name,
      team: player.team,
      position: player.position,
      overall: Number(player.overall),
      age: Number(player.age),
      salaryM: Number(player.salaryM),
      yearsLeft: Number(player.yearsLeft),
      optionType: player.optionType,
      durability: Number(player.durability),
      source: player.source
    };
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function roundTo(value, decimals = 0) {
    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function sum(values) {
    return values.reduce((acc, value) => acc + Number(value || 0), 0);
  }

  function avg(values) {
    if (!values.length) return 0;
    return sum(values) / values.length;
  }

  function signed(value, decimals = 0) {
    const number = roundTo(value, decimals);
    return `${number >= 0 ? "+" : ""}${number.toFixed(decimals)}`;
  }

  function labelCase(input) {
    return `${input.charAt(0).toUpperCase()}${input.slice(1)}`;
  }
})();
