import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import { getMissionById, getMissionNode, isLegacyMission } from "@/lib/missions";
import { masteryBandFromScore } from "@/lib/adaptiveEngine";

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
    avgMastery: number;
    studentsMeasured: number;
    heavyPct: number;
    mediumPct: number;
    lightPct: number;
    priorityScore: number;
    teachingPriority: "heavy" | "medium" | "light";
  }>;
  classConceptMastery: Array<{
    conceptId: string;
    avgMastery: number;
    meanUncertainty: number;
    studentsMeasured: number;
    heavyCount: number;
    mediumCount: number;
    lightCount: number;
    priorityScore: number;
    teachingPriority: "heavy" | "medium" | "light";
  }>;
  teamConceptMastery: Array<{
    teamId: string;
    teamName: string;
    conceptId: string;
    avgMastery: number;
    variance: number;
    studentsMeasured: number;
  }>;
  objectiveWeakness: Array<{
    conceptId: string;
    objectiveId: string;
    missRate: number;
    uncertaintyRate: number;
    topMisconceptions: string[];
    recommendedAction: string;
  }>;
  decisionVsMastery: Array<{
    missionId: string;
    missionTitle: string;
    roundId: string;
    lowBandTopOption: string | null;
    highBandTopOption: string | null;
    divergence: number;
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
    adaptiveAssessments: number;
  };
}

interface TeamEventPayload {
  missionId?: string;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = average(values);
  return average(values.map((value) => (value - mean) ** 2));
}

function severityWeight(value: TeacherAlert["severity"]): number {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function computeTeachingPriority(
  avgMastery: number,
  objectiveMissRate: number,
  uncertaintyRate: number
): {
  priorityScore: number;
  teachingPriority: "heavy" | "medium" | "light";
} {
  const priorityScore = Number(
    ((3.1 - avgMastery) + 0.45 * objectiveMissRate + 0.25 * uncertaintyRate).toFixed(3)
  );
  if (priorityScore >= 1.15) return { priorityScore, teachingPriority: "heavy" };
  if (priorityScore >= 0.65) return { priorityScore, teachingPriority: "medium" };
  return { priorityScore, teachingPriority: "light" };
}

function missionTitleForId(missionId: string): string {
  const mission = getMissionById(missionId);
  if (mission && !isLegacyMission(mission)) return mission.title;
  return mission?.title ?? getMissionNode(missionId)?.title ?? missionId;
}

function optionLabelForVote(missionId: string, roundId: string, optionIndex: number): string {
  const mission = getMissionById(missionId);
  if (mission && !isLegacyMission(mission)) {
    const round =
      mission.rounds.find((item) => item.id === roundId) ??
      (roundId === "rival-response" ? mission.rivalCounter?.responseRound : undefined);
    return round?.options[optionIndex]?.label ?? `Option ${optionIndex + 1}`;
  }
  return getMissionNode(missionId)?.options[optionIndex]?.label ?? `Option ${optionIndex + 1}`;
}

export async function getTeacherAlerts(sessionId: string): Promise<TeacherAlert[]> {
  const teams = await prisma.team.findMany({
    where: { sessionId },
    include: { students: { select: { id: true, lastSeenAt: true } } },
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
    if (!roundState.missionId || !roundState.currentRoundId || roundState.isResolved) continue;

    const activeIds = team.students.filter((student) => student.lastSeenAt >= activeCutoff).map((s) => s.id);
    const voteCount = await prisma.vote.count({
      where: {
        teamId: team.id,
        missionId: roundState.missionId,
        roundId: roundState.currentRoundId,
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

export async function getTeacherAnalytics(sessionId: string): Promise<TeacherAnalytics> {
  const [students, votes, adaptiveAssessmentsRaw, adaptiveResponses, teamEvents] =
    await Promise.all([
      prisma.student.findMany({
        where: { sessionId },
        select: {
          id: true,
          teamId: true,
          team: { select: { id: true, name: true } },
        },
      }),
      prisma.vote.findMany({
        where: { sessionId },
        select: { studentId: true, missionId: true, roundId: true, optionIndex: true },
      }),
      prisma.adaptiveAssessment.findMany({
        where: {
          sessionId,
          completedAt: { not: null },
        },
        include: {
          team: { select: { id: true, name: true } },
          objectiveSnapshots: true,
        },
        orderBy: { completedAt: "desc" },
      }),
      prisma.adaptiveResponse.findMany({
        where: { assessment: { sessionId } },
        select: {
          assessmentId: true,
          objectiveId: true,
          misconceptionTag: true,
          isCorrect: true,
        },
      }),
      prisma.teamEvent.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        select: { teamId: true, eventType: true, payloadJson: true, createdAt: true },
      }),
    ]);

  const latestByStudentConcept = new Map<string, (typeof adaptiveAssessmentsRaw)[number]>();
  for (const assessment of adaptiveAssessmentsRaw) {
    const key = `${assessment.studentId}:${assessment.conceptId}`;
    if (!latestByStudentConcept.has(key)) latestByStudentConcept.set(key, assessment);
  }
  const latestAssessments = Array.from(latestByStudentConcept.values());
  const latestAssessmentIds = new Set(latestAssessments.map((row) => row.id));
  const responsesForLatest = adaptiveResponses.filter((row) => latestAssessmentIds.has(row.assessmentId));

  const participationStudents = new Set(votes.map((vote) => vote.studentId));
  const participationRate =
    students.length === 0 ? 0 : Math.round((participationStudents.size / students.length) * 100);

  const decisionMap = new Map<
    string,
    {
      missionId: string;
      missionTitle: string;
      roundId: string;
      totalVotes: number;
      options: Map<number, number>;
    }
  >();

  for (const vote of votes) {
    const key = `${vote.missionId}|${vote.roundId}`;
    if (!decisionMap.has(key)) {
      decisionMap.set(key, {
        missionId: vote.missionId,
        missionTitle: missionTitleForId(vote.missionId),
        roundId: vote.roundId,
        totalVotes: 0,
        options: new Map<number, number>(),
      });
    }
    const row = decisionMap.get(key)!;
    row.totalVotes += 1;
    row.options.set(vote.optionIndex, (row.options.get(vote.optionIndex) ?? 0) + 1);
  }

  const decisionInsights = Array.from(decisionMap.values())
    .map((row) => ({
      missionId: row.missionId,
      missionTitle: row.missionTitle,
      roundId: row.roundId,
      totalVotes: row.totalVotes,
      options: Array.from(row.options.entries())
        .map(([optionIndex, picks]) => ({
          optionIndex,
          label: optionLabelForVote(row.missionId, row.roundId, optionIndex),
          picks,
          pickRate: row.totalVotes === 0 ? 0 : Math.round((picks / row.totalVotes) * 100),
        }))
        .sort((a, b) => b.picks - a.picks),
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const classConceptMap = new Map<
    string,
    {
      mastery: number[];
      uncertainty: number[];
      heavyCount: number;
      mediumCount: number;
      lightCount: number;
      objectiveAsked: number;
      objectiveMisses: number;
    }
  >();

  for (const assessment of latestAssessments) {
    if (!classConceptMap.has(assessment.conceptId)) {
      classConceptMap.set(assessment.conceptId, {
        mastery: [],
        uncertainty: [],
        heavyCount: 0,
        mediumCount: 0,
        lightCount: 0,
        objectiveAsked: 0,
        objectiveMisses: 0,
      });
    }
    const row = classConceptMap.get(assessment.conceptId)!;
    row.mastery.push(assessment.masteryScore);
    row.uncertainty.push(assessment.uncertaintyScore);
    const band = masteryBandFromScore(assessment.masteryScore);
    if (band === "heavy") row.heavyCount += 1;
    else if (band === "medium") row.mediumCount += 1;
    else row.lightCount += 1;
    for (const snapshot of assessment.objectiveSnapshots) {
      row.objectiveAsked += snapshot.askedCount;
      row.objectiveMisses += snapshot.askedCount - snapshot.correctCount;
    }
  }

  const classConceptMastery = Array.from(classConceptMap.entries())
    .map(([conceptId, row]) => {
      const avgMastery = Number(average(row.mastery).toFixed(2));
      const meanUncertainty = Number(average(row.uncertainty).toFixed(3));
      const objectiveMissRate =
        row.objectiveAsked === 0 ? 0 : row.objectiveMisses / row.objectiveAsked;
      const { priorityScore, teachingPriority } = computeTeachingPriority(
        avgMastery,
        objectiveMissRate,
        meanUncertainty
      );
      return {
        conceptId,
        avgMastery,
        meanUncertainty,
        studentsMeasured: row.mastery.length,
        heavyCount: row.heavyCount,
        mediumCount: row.mediumCount,
        lightCount: row.lightCount,
        priorityScore,
        teachingPriority,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const conceptInsights = classConceptMastery.map((row) => ({
    conceptId: row.conceptId,
    avgMastery: row.avgMastery,
    studentsMeasured: row.studentsMeasured,
    heavyPct: row.studentsMeasured === 0 ? 0 : Math.round((row.heavyCount / row.studentsMeasured) * 100),
    mediumPct: row.studentsMeasured === 0 ? 0 : Math.round((row.mediumCount / row.studentsMeasured) * 100),
    lightPct: row.studentsMeasured === 0 ? 0 : Math.round((row.lightCount / row.studentsMeasured) * 100),
    priorityScore: row.priorityScore,
    teachingPriority: row.teachingPriority,
  }));

  const teamConceptMap = new Map<
    string,
    { teamId: string; teamName: string; conceptId: string; mastery: number[] }
  >();
  for (const assessment of latestAssessments) {
    const teamName = assessment.team.name;
    const key = `${assessment.teamId}|${assessment.conceptId}`;
    if (!teamConceptMap.has(key)) {
      teamConceptMap.set(key, {
        teamId: assessment.teamId,
        teamName,
        conceptId: assessment.conceptId,
        mastery: [],
      });
    }
    teamConceptMap.get(key)!.mastery.push(assessment.masteryScore);
  }
  const teamConceptMastery = Array.from(teamConceptMap.values())
    .map((row) => ({
      teamId: row.teamId,
      teamName: row.teamName,
      conceptId: row.conceptId,
      avgMastery: Number(average(row.mastery).toFixed(2)),
      variance: Number(variance(row.mastery).toFixed(3)),
      studentsMeasured: row.mastery.length,
    }))
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  const objectiveMap = new Map<
    string,
    {
      conceptId: string;
      objectiveId: string;
      asked: number;
      incorrect: number;
      uncertainty: number[];
      misconceptionCounts: Map<string, number>;
    }
  >();
  const assessmentById = new Map(latestAssessments.map((assessment) => [assessment.id, assessment]));

  for (const assessment of latestAssessments) {
    for (const snapshot of assessment.objectiveSnapshots) {
      const key = `${assessment.conceptId}|${snapshot.objectiveId}`;
      if (!objectiveMap.has(key)) {
        objectiveMap.set(key, {
          conceptId: assessment.conceptId,
          objectiveId: snapshot.objectiveId,
          asked: 0,
          incorrect: 0,
          uncertainty: [],
          misconceptionCounts: new Map<string, number>(),
        });
      }
      const row = objectiveMap.get(key)!;
      row.asked += snapshot.askedCount;
      row.incorrect += snapshot.askedCount - snapshot.correctCount;
      row.uncertainty.push(snapshot.uncertaintyRate);
    }
  }

  for (const response of responsesForLatest) {
    if (response.isCorrect) continue;
    const assessment = assessmentById.get(response.assessmentId);
    if (!assessment) continue;
    const key = `${assessment.conceptId}|${response.objectiveId}`;
    if (!objectiveMap.has(key)) continue;
    const row = objectiveMap.get(key)!;
    row.misconceptionCounts.set(
      response.misconceptionTag,
      (row.misconceptionCounts.get(response.misconceptionTag) ?? 0) + 1
    );
  }

  const objectiveWeakness = Array.from(objectiveMap.values())
    .map((row) => {
      const missRate = row.asked === 0 ? 0 : row.incorrect / row.asked;
      const uncertaintyRate = average(row.uncertainty);
      const topMisconceptions = Array.from(row.misconceptionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);
      const recommendedAction =
        missRate >= 0.45
          ? `Re-teach ${row.objectiveId} with worked examples and one guided team drill.`
          : missRate >= 0.28
          ? `Review ${row.objectiveId} with short correction prompts before next mission.`
          : `Light reinforcement for ${row.objectiveId} is enough.`;

      return {
        conceptId: row.conceptId,
        objectiveId: row.objectiveId,
        missRate: Number((missRate * 100).toFixed(1)),
        uncertaintyRate: Number(uncertaintyRate.toFixed(3)),
        topMisconceptions,
        recommendedAction,
      };
    })
    .sort((a, b) => b.missRate - a.missRate);

  const masteryByStudent = new Map<string, number>();
  const studentMasteryBuckets = new Map<string, number[]>();
  for (const assessment of latestAssessments) {
    const arr = studentMasteryBuckets.get(assessment.studentId) ?? [];
    arr.push(assessment.masteryScore);
    studentMasteryBuckets.set(assessment.studentId, arr);
  }
  for (const [studentId, values] of Array.from(studentMasteryBuckets.entries())) {
    masteryByStudent.set(studentId, average(values));
  }

  const decisionBandMap = new Map<
    string,
    { missionId: string; roundId: string; low: Map<number, number>; high: Map<number, number> }
  >();
  for (const vote of votes) {
    const studentMastery = masteryByStudent.get(vote.studentId);
    if (studentMastery == null) continue;
    const key = `${vote.missionId}|${vote.roundId}`;
    if (!decisionBandMap.has(key)) {
      decisionBandMap.set(key, {
        missionId: vote.missionId,
        roundId: vote.roundId,
        low: new Map<number, number>(),
        high: new Map<number, number>(),
      });
    }
    const row = decisionBandMap.get(key)!;
    if (studentMastery < 2.4) {
      row.low.set(vote.optionIndex, (row.low.get(vote.optionIndex) ?? 0) + 1);
    }
    if (studentMastery >= 3.1) {
      row.high.set(vote.optionIndex, (row.high.get(vote.optionIndex) ?? 0) + 1);
    }
  }

  const decisionVsMastery = Array.from(decisionBandMap.values())
    .map((row) => {
      const lowTotal = Array.from(row.low.values()).reduce((sum, value) => sum + value, 0);
      const highTotal = Array.from(row.high.values()).reduce((sum, value) => sum + value, 0);

      const lowTop = Array.from(row.low.entries()).sort((a, b) => b[1] - a[1])[0];
      const highTop = Array.from(row.high.entries()).sort((a, b) => b[1] - a[1])[0];

      const lowRate = !lowTop || lowTotal === 0 ? 0 : lowTop[1] / lowTotal;
      const highRate = !highTop || highTotal === 0 ? 0 : highTop[1] / highTotal;
      const divergence = Number((Math.abs(lowRate - highRate) * 100).toFixed(1));

      return {
        missionId: row.missionId,
        missionTitle: missionTitleForId(row.missionId),
        roundId: row.roundId,
        lowBandTopOption:
          lowTop == null ? null : optionLabelForVote(row.missionId, row.roundId, lowTop[0]),
        highBandTopOption:
          highTop == null ? null : optionLabelForVote(row.missionId, row.roundId, highTop[0]),
        divergence,
      };
    })
    .sort((a, b) => b.divergence - a.divergence);

  const focusRecommendations = {
    heavyConcepts: classConceptMastery
      .filter((row) => row.teachingPriority === "heavy")
      .map((row) => row.conceptId),
    mediumConcepts: classConceptMastery
      .filter((row) => row.teachingPriority === "medium")
      .map((row) => row.conceptId),
    lightConcepts: classConceptMastery
      .filter((row) => row.teachingPriority === "light")
      .map((row) => row.conceptId),
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
      voteLatencies.push(Math.max(0, Math.floor((event.createdAt.getTime() - startedAt.getTime()) / 1000)));
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
    .map(([missionId, values]) => ({
      missionId,
      missionTitle: missionTitleForId(missionId),
      medianSeconds: median(values) ?? 0,
      samples: values.length,
    }))
    .sort((a, b) => b.medianSeconds - a.medianSeconds)
    .slice(0, 5);

  return {
    sessionId,
    participationRate,
    medianVoteLatencySeconds: median(voteLatencies),
    decisionInsights,
    conceptInsights,
    classConceptMastery,
    teamConceptMastery,
    objectiveWeakness,
    decisionVsMastery,
    focusRecommendations,
    missionBottlenecks,
    totals: {
      students: students.length,
      votes: votes.length,
      adaptiveAssessments: latestAssessments.length,
    },
  };
}
