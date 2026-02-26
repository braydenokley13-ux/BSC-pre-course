export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { getMissionById, isLegacyMission, Mission } from "@/lib/missions";
import { getUnlockedMissions } from "@/lib/missionGraph";
import { applyRoundOptionMutations } from "@/lib/missionRound";
import { parseJson } from "@/lib/json";
import { recordTeamEvent } from "@/lib/teamEvents";

interface MissionRoundState {
  missionId: string;
  currentRoundId: string;
  completedRounds: Array<{
    roundId: string;
    winningOptionId: string;
    winningTags: string[];
  }>;
  allTags: string[];
  rivalFired: boolean;
  isResolved: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { missionId } = (await req.json()) as { missionId: string };
  if (!missionId) return NextResponse.json({ error: "missionId required" }, { status: 400 });

  const team = await prisma.team.findUnique({
    where: { id: student.teamId },
    include: { students: { select: { id: true, nickname: true, lastSeenAt: true } } },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const mission = getMissionById(missionId);
  if (!mission || isLegacyMission(mission)) {
    return NextResponse.json({ error: "Mission not found or not upgradeable" }, { status: 404 });
  }

  const completedMissions = JSON.parse(team.completedMissions) as string[];

  // Check mission is unlocked
  const unlocked = getUnlockedMissions(completedMissions);
  if (!unlocked.includes(missionId)) {
    return NextResponse.json({ error: "Mission not unlocked" }, { status: 403 });
  }

  const richMission = mission as Mission;

  // Assign roles to active students (active = lastSeen within 90s)
  // Fall back to all students if nobody has a recent ping (e.g. solo tester)
  const now = new Date();
  const cutoff = new Date(now.getTime() - 90_000);
  const recentStudents = team.students.filter((s) => s.lastSeenAt >= cutoff);
  const activeStudents = recentStudents.length > 0 ? recentStudents : team.students;

  const roles = shuffle(richMission.roles.map((r) => r.id));
  const roleAssignments: Record<string, string> = {};
  activeStudents.forEach((s, i) => {
    if (i < roles.length) {
      roleAssignments[s.id] = roles[i];
    }
  });

  // Find the first round (no dependsOnRoundId)
  const firstRound = richMission.rounds.find((r) => !r.dependsOnRoundId);
  if (!firstRound) {
    return NextResponse.json({ error: "Mission has no starting round" }, { status: 500 });
  }

  const roundState: MissionRoundState = {
    missionId,
    currentRoundId: firstRound.id,
    completedRounds: [],
    allTags: [],
    rivalFired: false,
    isResolved: false,
  };

  await prisma.team.update({
    where: { id: team.id },
    data: {
      roleAssignments: JSON.stringify(roleAssignments),
      missionRoundState: JSON.stringify(roundState),
      lastProgressAt: new Date(),
      teamStateVersion: { increment: 1 },
    },
  });

  // Build per-student role info
  const myRole = roleAssignments[student.id]
    ? richMission.roles.find((r) => r.id === roleAssignments[student.id]) ?? null
    : null;

  // ── Apply status-driven mutations and scenario injections ────────────────
  const teamStatus = parseJson<string[]>(team.teamStatus, []);

  // 1. Scenario injections — prepend matching context to the scenario
  let scenario = richMission.scenario;
  if (richMission.scenarioInjections) {
    const injections = richMission.scenarioInjections
      .filter((inj) => teamStatus.includes(inj.requiredStatus))
      .map((inj) => inj.prependText);
    if (injections.length > 0) {
      scenario = injections.join("") + scenario;
    }
  }

  // 2. Option mutations — patch labels/descriptions based on active statuses
  const patchedFirstRound = applyRoundOptionMutations(firstRound, teamStatus);

  await recordTeamEvent({
    sessionId: student.sessionId,
    teamId: team.id,
    eventType: "mission_started",
    payload: {
      missionId,
      roundId: firstRound.id,
      activeStudents: activeStudents.length,
    },
  });

  return NextResponse.json({
    ok: true,
    missionId,
    scenario,
    currentRound: patchedFirstRound,
    roleAssignments,
    myRole,
    roles: richMission.roles,
    infoCards: richMission.infoCards,
  });
}
