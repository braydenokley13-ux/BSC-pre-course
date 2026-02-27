export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { getMissionById, isLegacyMission } from "@/lib/missions";

interface CompletedRound {
  roundId: string;
  winningOptionId: string;
  winningTags: string[];
}

interface MissionStateJson {
  completedRounds?: CompletedRound[];
}

function parseMissionState(raw: string): MissionStateJson {
  try { return JSON.parse(raw) as MissionStateJson; } catch { return {}; }
}

export async function GET(req: NextRequest) {
  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Fetch all votes this student cast in the session, oldest first
  const votes = await prisma.vote.findMany({
    where: { studentId: student.id, sessionId: student.sessionId },
    orderBy: { createdAt: "asc" },
  });

  // Keep only the first vote per mission (first round = the direction decision)
  const firstVoteByMission = new Map<string, { optionIndex: number; roundId: string }>();
  for (const v of votes) {
    if (!firstVoteByMission.has(v.missionId)) {
      firstVoteByMission.set(v.missionId, { optionIndex: v.optionIndex, roundId: v.roundId });
    }
  }

  // Fetch team's completed mission progress
  const progressRows = (await prisma.missionProgress.findMany({
    where: { teamId: student.teamId, sessionId: student.sessionId },
    select: { missionId: true, stateJson: true, outcome: true },
  })) as Array<{ missionId: string; stateJson: string; outcome: number }>;
  const progressMap = new Map(progressRows.map((p) => [p.missionId, p]));

  const decisions: Array<{
    missionId: string;
    missionTitle: string;
    studentOptionLabel: string;
    teamOptionLabel: string;
    votedWithTeam: boolean;
  }> = [];

  for (const [missionId, vote] of Array.from(firstVoteByMission.entries())) {
    const mission = getMissionById(missionId);
    if (!mission) continue;

    let studentOptionLabel = `Option ${vote.optionIndex + 1}`;
    let teamOptionLabel = "—";
    let votedWithTeam = false;

    if (isLegacyMission(mission)) {
      // Legacy missions: options array, outcome = winning index
      const opt = mission.options[vote.optionIndex];
      if (opt) studentOptionLabel = opt.label;

      const progress = progressMap.get(missionId);
      if (progress) {
        const winningOpt = mission.options[progress.outcome];
        if (winningOpt) teamOptionLabel = winningOpt.label;
        votedWithTeam = vote.optionIndex === progress.outcome;
      }
    } else {
      // Rich multi-round missions: use first round options
      const firstRound = mission.rounds.find((r) => !r.dependsOnRoundId) ?? mission.rounds[0];
      if (firstRound) {
        const opt = firstRound.options[vote.optionIndex];
        if (opt) studentOptionLabel = opt.label;

        const progress = progressMap.get(missionId);
        if (progress) {
          const state = parseMissionState(progress.stateJson);
          const firstCompleted = state.completedRounds?.[0];
          if (firstCompleted) {
            // Find winning option in the first round
            const winningIdx = firstRound.options.findIndex(
              (o) => o.id === firstCompleted.winningOptionId
            );
            const winningOpt = winningIdx >= 0 ? firstRound.options[winningIdx] : null;
            if (winningOpt) teamOptionLabel = winningOpt.label;
            votedWithTeam = winningIdx >= 0 && vote.optionIndex === winningIdx;
          }
        }
      }
    }

    decisions.push({
      missionId,
      missionTitle: mission.title,
      studentOptionLabel,
      teamOptionLabel,
      votedWithTeam,
    });
  }

  const votedWithTeamCount = decisions.filter((d) => d.votedWithTeam).length;

  return NextResponse.json({
    decisions,
    votedWithTeamCount,
    totalDecisions: decisions.length,
  });
}
