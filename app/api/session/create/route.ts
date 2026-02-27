export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher, validateTeacherPassword } from "@/lib/teacherAuth";
import { errorResponse } from "@/lib/apiErrors";

const NBA_TEAM_NAMES = [
  "Hawks", "Celtics", "Nets", "Hornets", "Bulls",
  "Cavaliers", "Mavericks", "Nuggets", "Pistons", "Warriors",
  "Rockets", "Pacers", "Clippers", "Lakers", "Grizzlies",
  "Heat", "Bucks", "Timberwolves", "Pelicans", "Knicks",
  "Thunder", "Magic", "76ers", "Suns", "Trail Blazers",
  "Kings", "Spurs", "Raptors", "Jazz", "Wizards",
];

// Auto-assign a jersey color based on the NBA team name
const NBA_TEAM_COLORS: Record<string, string> = {
  "Hawks": "red",
  "Celtics": "green",
  "Nets": "black",
  "Hornets": "teal",
  "Bulls": "red",
  "Cavaliers": "gold",
  "Mavericks": "blue",
  "Nuggets": "gold",
  "Pistons": "blue",
  "Warriors": "gold",
  "Rockets": "red",
  "Pacers": "gold",
  "Clippers": "red",
  "Lakers": "purple",
  "Grizzlies": "teal",
  "Heat": "red",
  "Bucks": "green",
  "Timberwolves": "blue",
  "Pelicans": "blue",
  "Knicks": "blue",
  "Thunder": "blue",
  "Magic": "blue",
  "76ers": "blue",
  "Suns": "orange",
  "Trail Blazers": "red",
  "Kings": "purple",
  "Spurs": "black",
  "Raptors": "red",
  "Jazz": "blue",
  "Wizards": "blue",
};

function generateJoinCode(teamName: string): string {
  const word = teamName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const num = Math.floor(10 + Math.random() * 90);
  return `${word}${num}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    title?: string;
    password?: string;
    teamCount?: number;
    track?: string;
  };
  const title = body.title?.trim() || "BSC Pre-Course Game";
  const password = body.password?.trim();
  const track = body.track === "101" ? "101" : "201";
  const teamCount =
    typeof body.teamCount === "number" && Number.isFinite(body.teamCount)
      ? Math.max(1, Math.min(Math.floor(body.teamCount), 8))
      : 6;

  const auth = await requireTeacher(req, { allowLegacyHeader: true });
  let authedByPassword = false;
  if (!auth && password) {
    authedByPassword = await validateTeacherPassword(password);
  }
  if (!auth && !authedByPassword) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  // Archive any existing active session
  await prisma.session.updateMany({
    where: { status: "active" },
    data: { status: "archived", archivedAt: new Date() },
  });

  // Pick random team names
  const shuffled = [...NBA_TEAM_NAMES].sort(() => Math.random() - 0.5);
  const selectedNames = shuffled.slice(0, Math.min(teamCount, 8));

  const session = await prisma.session.create({
    data: {
      title,
      teacherKeyHash: auth?.teacher.id ?? "legacy-password",
      track,
      teams: {
        create: selectedNames.map((name) => ({
          name,
          joinCode: generateJoinCode(name),
          color: NBA_TEAM_COLORS[name] ?? "blue",
          currentNodeId: "cap-crunch",
          branchStateJson: JSON.stringify({
            capFlex: 0,
            starPower: 0,
            dataTrust: 0,
            culture: 0,
            riskHeat: 0,
          }),
          runoffStateJson: null,
        })),
      },
    },
    include: { teams: true },
  });

  return NextResponse.json({
    sessionId: session.id,
    title: session.title,
    track: session.track,
    teams: session.teams.map((t) => ({
      id: t.id,
      name: t.name,
      joinCode: t.joinCode,
      color: t.color,
    })),
  });
}
