export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkTeacherPassword } from "@/lib/auth";
import { nanoid } from "nanoid";

const NBA_TEAM_NAMES = [
  "Hawks", "Celtics", "Nets", "Hornets", "Bulls",
  "Cavaliers", "Mavericks", "Nuggets", "Pistons", "Warriors",
  "Rockets", "Pacers", "Clippers", "Lakers", "Grizzlies",
  "Heat", "Bucks", "Timberwolves", "Pelicans", "Knicks",
  "Thunder", "Magic", "76ers", "Suns", "Trail Blazers",
  "Kings", "Spurs", "Raptors", "Jazz", "Wizards",
];

function generateJoinCode(teamName: string): string {
  const word = teamName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const num = Math.floor(10 + Math.random() * 90);
  return `${word}${num}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, password, teamCount = 6 } = body as {
    title: string;
    password: string;
    teamCount?: number;
  };

  const authed = await checkTeacherPassword(password);
  if (!authed) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
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
      title: title || "BSC Pre-Course Game",
      teacherKeyHash: password,
      teams: {
        create: selectedNames.map((name) => ({
          name,
          joinCode: generateJoinCode(name),
          currentNodeId: "m1_cap_crunch",
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
    teams: session.teams.map((t) => ({ id: t.id, name: t.name, joinCode: t.joinCode })),
  });
}
