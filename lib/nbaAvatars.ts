export interface NbaAvatar {
  id: string;
  name: string;
  abbr: string;
  color: string;     // primary jersey color (hex)
  textColor: string; // text on top of color
}

export const NBA_AVATARS: NbaAvatar[] = [
  { id: "hawks",        name: "Hawks",        abbr: "ATL", color: "#e03a3e", textColor: "#fff" },
  { id: "celtics",      name: "Celtics",      abbr: "BOS", color: "#007a33", textColor: "#fff" },
  { id: "nets",         name: "Nets",         abbr: "BKN", color: "#1d1160", textColor: "#fff" },
  { id: "hornets",      name: "Hornets",      abbr: "CHA", color: "#1d1160", textColor: "#00788c" },
  { id: "bulls",        name: "Bulls",        abbr: "CHI", color: "#ce1141", textColor: "#fff" },
  { id: "cavaliers",    name: "Cavaliers",    abbr: "CLE", color: "#860038", textColor: "#fdbb30" },
  { id: "mavericks",    name: "Mavericks",    abbr: "DAL", color: "#00538c", textColor: "#fff" },
  { id: "nuggets",      name: "Nuggets",      abbr: "DEN", color: "#0e2240", textColor: "#fec524" },
  { id: "pistons",      name: "Pistons",      abbr: "DET", color: "#c8102e", textColor: "#006bb6" },
  { id: "warriors",     name: "Warriors",     abbr: "GSW", color: "#1d428a", textColor: "#ffc72c" },
  { id: "rockets",      name: "Rockets",      abbr: "HOU", color: "#ce1141", textColor: "#fff" },
  { id: "pacers",       name: "Pacers",       abbr: "IND", color: "#002d62", textColor: "#fdbb30" },
  { id: "clippers",     name: "Clippers",     abbr: "LAC", color: "#c8102e", textColor: "#1d428a" },
  { id: "lakers",       name: "Lakers",       abbr: "LAL", color: "#552583", textColor: "#fdb927" },
  { id: "grizzlies",    name: "Grizzlies",    abbr: "MEM", color: "#5d76a9", textColor: "#12173f" },
  { id: "heat",         name: "Heat",         abbr: "MIA", color: "#98002e", textColor: "#f9a01b" },
  { id: "bucks",        name: "Bucks",        abbr: "MIL", color: "#00471b", textColor: "#eee1c6" },
  { id: "timberwolves", name: "Timberwolves", abbr: "MIN", color: "#0c2340", textColor: "#78be20" },
  { id: "pelicans",     name: "Pelicans",     abbr: "NOP", color: "#0c2340", textColor: "#c8102e" },
  { id: "knicks",       name: "Knicks",       abbr: "NYK", color: "#006bb6", textColor: "#f58426" },
  { id: "thunder",      name: "Thunder",      abbr: "OKC", color: "#007ac1", textColor: "#ef3b24" },
  { id: "magic",        name: "Magic",        abbr: "ORL", color: "#0077c0", textColor: "#c4ced4" },
  { id: "76ers",        name: "76ers",        abbr: "PHI", color: "#006bb6", textColor: "#ed174c" },
  { id: "suns",         name: "Suns",         abbr: "PHX", color: "#1d1160", textColor: "#e56020" },
  { id: "blazers",      name: "Trail Blazers", abbr: "POR", color: "#e03a3e", textColor: "#fff" },
  { id: "kings",        name: "Kings",        abbr: "SAC", color: "#5a2d81", textColor: "#63727a" },
  { id: "spurs",        name: "Spurs",        abbr: "SAS", color: "#c4ced4", textColor: "#1a1a1b" },
  { id: "raptors",      name: "Raptors",      abbr: "TOR", color: "#ce1141", textColor: "#000" },
  { id: "jazz",         name: "Jazz",         abbr: "UTA", color: "#002b5c", textColor: "#00471b" },
  { id: "wizards",      name: "Wizards",      abbr: "WAS", color: "#002b5c", textColor: "#e31837" },
];

export function getAvatar(id: string): NbaAvatar {
  return NBA_AVATARS.find((a) => a.id === id) ?? NBA_AVATARS[0];
}
