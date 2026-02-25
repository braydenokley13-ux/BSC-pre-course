export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { MISSIONS } from "@/lib/missions";
import { generateTeamClaimCode } from "@/lib/claimCode";

export async function POST(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: student.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const mission = MISSIONS[team.missionIndex];
  if (!mission) return NextResponse.json({ error: "No active mission" }, { status: 400 });

  // Check if already resolved
  const existing = await prisma.missionProgress.findUnique({
    where: { teamId_missionId: { teamId: team.id, missionId: mission.id } },
  });
  if (existing) {
    return NextResponse.json({ outcome: existing.outcome, missionId: mission.id, alreadyResolved: true });
  }

  // Get all votes for this mission
  const votes = await prisma.vote.findMany({
    where: { teamId: team.id, missionId: mission.id },
  });

  if (votes.length === 0) {
    return NextResponse.json({ error: "No votes cast yet" }, { status: 400 });
  }

  // Tally votes
  const tally = [0, 0, 0, 0];
  for (const v of votes) tally[v.optionIndex]++;

  const maxVotes = Math.max(...tally);
  const winners = tally.reduce<number[]>((acc, count, i) => {
    if (count === maxVotes) acc.push(i);
    return acc;
  }, []);

  // Break ties by lowest index (deterministic)
  const outcome = winners[0];
  const selectedOption = mission.options[outcome];

  // Compute new score
  const newScore = team.score + selectedOption.outcome.scoreΔ;
  const newMissionIndex = team.missionIndex + 1;
  const newBadges = JSON.parse(team.badges) as string[];
  newBadges.push(mission.conceptId);

  const isComplete = newMissionIndex >= MISSIONS.length;
  const teamClaimCode = isComplete ? generateTeamClaimCode(team.id, newBadges) : undefined;

  // Save progress
  await prisma.missionProgress.create({
    data: {
      sessionId: student.sessionId,
      teamId: team.id,
      missionId: mission.id,
      outcome,
      stateJson: JSON.stringify({ tally, scoreΔ: selectedOption.outcome.scoreΔ }),
    },
  });

  await prisma.team.update({
    where: { id: team.id },
    data: {
      missionIndex: newMissionIndex,
      score: newScore,
      badges: JSON.stringify(newBadges),
      lastProgressAt: new Date(),
      ...(isComplete && {
        completedAt: new Date(),
        claimCode: teamClaimCode,
      }),
    },
  });

  return NextResponse.json({
    outcome,
    tally,
    narrative: selectedOption.outcome.narrative,
    scoreΔ: selectedOption.outcome.scoreΔ,
    conceptId: mission.conceptId,
    missionId: mission.id,
    isComplete,
  });
}
