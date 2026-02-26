import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import { getMissionById, isLegacyMission } from "@/lib/missions";

export interface TeacherAlert {
  teamId: string;
  severity: "low" | "medium" | "high";
  type: "inactive-team" | "round-near-timeout" | "round-waiting-votes";
  ageSeconds: number;
  message: string;
}

export interface TeacherAnalytics {
  sessionId: string;
  participationRate: number;
  medianVoteLatencySeconds: number | null;
  decisionInsights: Array<{
    missionId: string;
    missionTitle: string;
    roundId: string;
    totalVotes: number;
    options: Array<{
      optionIndex: number;
      label: string;
      picks: number;
      pickRate: number;
    }>;
  }>;
  conceptInsights: Array<{
    conceptId: string;
    attempts: number;
    studentsAttempted: number;
    passRate: number;
    avgAttemptsToPass: number | null;
    teachingPriority: "heavy" | "medium" | "light";
  }>;
  focusRecommendations: {
    heavyConcepts: string[];
    mediumConcepts: string[];
    lightConcepts: string[];
  };
  missionBottlenecks: Array<{
    missionId: string;
    missionTitle: string;
    medianSeconds: number;
    samples: number;
  }>;
  totals: {
    students: number;
    votes: number;
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function severityWeight(value: TeacherAlert["severity"]): number {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

export async function getTeacherAlerts(sessionId: string): Promise<TeacherAlert[]> {
  const teams = await prisma.team.findMany({
    where: { sessionId },
    include: {
      students: {
        select: { id: true, lastSeenAt: true },
      },
    },
  });

  const nowMs = Date.now();
  const activeCutoff = new Date(nowMs - 60_000);
  const alerts: TeacherAlert[] = [];

  for (const team of teams) {
    if (team.completedAt) continue;
    const ageSeconds = Math.floor((nowMs - team.lastProgressAt.getTime()) / 1000);

    if (ageSeconds >= 180) {
      alerts.push({
        teamId: team.id,
        severity: ageSeconds >= 600 ? "high" : "medium",
        type: "inactive-team",
        ageSeconds,
        message: `${team.name} has no progress for ${ageSeconds}s.`,
      });
    }

    const roundState = parseJson<{ missionId?: string; currentRoundId?: string; isResolved?: boolean }>(
      team.missionRoundState,
      {}
    );
    const hasActiveRound = !!roundState.missionId && !roundState.isResolved && !!roundState.currentRoundId;
    if (!hasActiveRound) continue;

    const activeIds = team.students.filter((student) => student.lastSeenAt >= activeCutoff).map((s) => s.id);
    const voteCount = await prisma.vote.count({
      where: {
        teamId: team.id,
        missionId: roundState.missionId!,
        roundId: roundState.currentRoundId!,
      },
    });

    if (ageSeconds >= 120) {
      alerts.push({
        teamId: team.id,
        severity: ageSeconds >= 300 ? "high" : "medium",
        type: "round-near-timeout",
        ageSeconds,
        message: `${team.name} has been in round ${roundState.currentRoundId} for ${ageSeconds}s.`,
      });
    }

    if (activeIds.length > 0 && voteCount < activeIds.length && ageSeconds >= 90) {
      alerts.push({
        teamId: team.id,
        severity: "low",
        type: "round-waiting-votes",
        ageSeconds,
        message: `${team.name} is waiting on votes (${voteCount}/${activeIds.length}).`,
      });
    }
  }

  return alerts.sort((a, b) => {
    const bySeverity = severityWeight(b.severity) - severityWeight(a.severity);
    if (bySeverity !== 0) return bySeverity;
    return b.ageSeconds - a.ageSeconds;
  });
}

interface TeamEventPayload {
  missionId?: string;
  roundId?: string;
}

export async function getTeacherAnalytics(sessionId: string): Promise<TeacherAnalytics> {
  const [students, votes, catalogAttempts, teamEvents] = await Promise.all([
    prisma.student.findMany({
      where: { sessionId },
      select: { id: true },
    }),
    prisma.vote.findMany({
      where: { sessionId },
      select: {
        studentId: true,
        missionId: true,
        roundId: true,
        optionIndex: true,
      },
    }),
    prisma.catalogAttempt.findMany({
      where: { sessionId },
      select: {
        conceptId: true,
        studentId: true,
        passed: true,
        attemptNum: true,
      },
    }),
    prisma.teamEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: {
        teamId: true,
        eventType: true,
        payloadJson: true,
        createdAt: true,
      },
    }),
  ]);

  const studentIds = new Set(students.map((s) => s.id));
  const studentVotes = new Set(votes.filter((vote) => studentIds.has(vote.studentId)).map((vote) => vote.studentId));
  const participationRate =
    students.length === 0 ? 0 : Math.round((studentVotes.size / students.length) * 100);

  const optionCounts = new Map<string, number>();
  const roundVoteTotals = new Map<string, number>();
  for (const vote of votes) {
    const optionKey = `${vote.missionId}|${vote.roundId}|${vote.optionIndex}`;
    optionCounts.set(optionKey, (optionCounts.get(optionKey) ?? 0) + 1);
    const roundKey = `${vote.missionId}|${vote.roundId}`;
    roundVoteTotals.set(roundKey, (roundVoteTotals.get(roundKey) ?? 0) + 1);
  }

  const decisionMap = new Map<
    string,
    {
      missionId: string;
      missionTitle: string;
      roundId: string;
      totalVotes: number;
      options: Array<{
        optionIndex: number;
        label: string;
        picks: number;
        pickRate: number;
      }>;
    }
  >();

  for (const [optionKey, picks] of Array.from(optionCounts.entries())) {
    const [missionId, roundId, optionIndexRaw] = optionKey.split("|");
    const optionIndex = Number(optionIndexRaw);
    const roundKey = `${missionId}|${roundId}`;
    const totalVotes = roundVoteTotals.get(roundKey) ?? 0;
    const mission = getMissionById(missionId);
    const missionTitle =
      mission && !isLegacyMission(mission) ? mission.title : mission?.title ?? missionId;

    let optionLabel = `Option ${optionIndex + 1}`;
    if (mission && !isLegacyMission(mission)) {
      const round =
        mission.rounds.find((item) => item.id === roundId) ??
        (roundId === "rival-response" ? mission.rivalCounter?.responseRound : undefined);
      optionLabel = round?.options[optionIndex]?.label ?? optionLabel;
    }

    if (!decisionMap.has(roundKey)) {
      decisionMap.set(roundKey, {
        missionId,
        missionTitle,
        roundId,
        totalVotes,
        options: [],
      });
    }
    decisionMap.get(roundKey)!.options.push({
      optionIndex,
      label: optionLabel,
      picks,
      pickRate: totalVotes === 0 ? 0 : Math.round((picks / totalVotes) * 100),
    });
  }

  const decisionInsights = Array.from(decisionMap.values())
    .map((item) => ({
      ...item,
      options: item.options.sort((a, b) => b.picks - a.picks),
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const conceptMap = new Map<
    string,
    {
      attempts: number;
      studentsAttempted: Set<string>;
      studentsPassed: Set<string>;
      firstPassAttemptByStudent: Map<string, number>;
    }
  >();

  for (const attempt of catalogAttempts) {
    if (!conceptMap.has(attempt.conceptId)) {
      conceptMap.set(attempt.conceptId, {
        attempts: 0,
        studentsAttempted: new Set<string>(),
        studentsPassed: new Set<string>(),
        firstPassAttemptByStudent: new Map<string, number>(),
      });
    }
    const row = conceptMap.get(attempt.conceptId)!;
    row.attempts += 1;
    row.studentsAttempted.add(attempt.studentId);
    if (attempt.passed) {
      row.studentsPassed.add(attempt.studentId);
      const existing = row.firstPassAttemptByStudent.get(attempt.studentId);
      if (existing == null || attempt.attemptNum < existing) {
        row.firstPassAttemptByStudent.set(attempt.studentId, attempt.attemptNum);
      }
    }
  }

  const conceptInsights = Array.from(conceptMap.entries())
    .map(([conceptId, row]) => {
      const studentsAttempted = row.studentsAttempted.size;
      const studentsPassed = row.studentsPassed.size;
      const passRate = studentsAttempted === 0 ? 0 : Math.round((studentsPassed / studentsAttempted) * 100);
      const firstPassAttempts = Array.from(row.firstPassAttemptByStudent.values());
      const avgAttemptsToPass =
        firstPassAttempts.length === 0
          ? null
          : Math.round((firstPassAttempts.reduce((acc, value) => acc + value, 0) / firstPassAttempts.length) * 10) / 10;
      const teachingPriority: "heavy" | "medium" | "light" =
        passRate < 60 ? "heavy" : passRate < 80 ? "medium" : "light";

      return {
        conceptId,
        attempts: row.attempts,
        studentsAttempted,
        passRate,
        avgAttemptsToPass,
        teachingPriority,
      };
    })
    .sort((a, b) => a.passRate - b.passRate || b.attempts - a.attempts);

  const focusRecommendations = {
    heavyConcepts: conceptInsights
      .filter((item) => item.teachingPriority === "heavy")
      .map((item) => item.conceptId),
    mediumConcepts: conceptInsights
      .filter((item) => item.teachingPriority === "medium")
      .map((item) => item.conceptId),
    lightConcepts: conceptInsights
      .filter((item) => item.teachingPriority === "light")
      .map((item) => item.conceptId),
  };

  const startByTeamMission = new Map<string, Date>();
  const voteLatencies: number[] = [];
  const missionDurations = new Map<string, number[]>();

  for (const event of teamEvents) {
    const payload = parseJson<TeamEventPayload>(event.payloadJson, {});
    const missionId = payload.missionId;
    if (!missionId) continue;
    const key = `${event.teamId}:${missionId}`;

    if (event.eventType === "mission_started") {
      startByTeamMission.set(key, event.createdAt);
      continue;
    }

    if (event.eventType === "vote_cast") {
      const startedAt = startByTeamMission.get(key);
      if (!startedAt) continue;
      const latencySeconds = Math.max(
        0,
        Math.floor((event.createdAt.getTime() - startedAt.getTime()) / 1000)
      );
      voteLatencies.push(latencySeconds);
      continue;
    }

    if (event.eventType === "mission_completed") {
      const startedAt = startByTeamMission.get(key);
      if (!startedAt) continue;
      const elapsedSeconds = Math.max(
        0,
        Math.floor((event.createdAt.getTime() - startedAt.getTime()) / 1000)
      );
      const arr = missionDurations.get(missionId) ?? [];
      arr.push(elapsedSeconds);
      missionDurations.set(missionId, arr);
    }
  }

  const missionBottlenecks = Array.from(missionDurations.entries())
    .map(([missionId, values]) => {
      const mission = getMissionById(missionId);
      const title =
        mission && !isLegacyMission(mission) ? mission.title : mission?.title ?? missionId;
      return {
        missionId,
        missionTitle: title,
        medianSeconds: median(values) ?? 0,
        samples: values.length,
      };
    })
    .sort((a, b) => b.medianSeconds - a.medianSeconds)
    .slice(0, 5);

  return {
    sessionId,
    participationRate,
    medianVoteLatencySeconds: median(voteLatencies),
    decisionInsights,
    conceptInsights,
    focusRecommendations,
    missionBottlenecks,
    totals: {
      students: students.length,
      votes: votes.length,
    },
  };
}
