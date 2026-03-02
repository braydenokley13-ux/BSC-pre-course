export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { FEATURE_ADAPTIVE_CHECKS_V1 } from "@/lib/features";
import {
  ADAPTIVE_MAX_QUESTIONS,
  ADAPTIVE_MIN_QUESTIONS,
  AdaptiveEngineState,
  applyAdaptiveAnswer,
  buildObjectiveBreakdown,
  chooseNextAdaptiveQuestion,
  masteryBandFromScore,
  parseDifficultyTrail,
  parseObjectiveCoverage,
  parseUsedQuestionIds,
  serializeDifficultyTrail,
  serializeObjectiveCoverage,
  serializeUsedQuestionIds,
} from "@/lib/adaptiveEngine";
import {
  getAdaptiveConceptSeeds,
  loadAdaptiveQuestionsFromDb,
} from "@/lib/adaptiveBank";

interface FeedbackPayload {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

interface CompletedPayload {
  done: true;
  masteryScore: number;
  uncertainty: number;
  questionCount: number;
  objectiveBreakdown: Array<{
    objectiveId: string;
    askedCount: number;
    correctCount: number;
    missRate: number;
  }>;
  misconceptionsTop: Array<{ tag: string; count: number }>;
  recommendationBand: "heavy" | "medium" | "light";
  lowConfidence: boolean;
  feedback?: FeedbackPayload;
}

function buildUsageCounts(questionIds: string[]): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const questionId of questionIds) {
    usage[questionId] = (usage[questionId] ?? 0) + 1;
  }
  return usage;
}

async function buildCompletedResponse(
  assessmentId: string
): Promise<CompletedPayload | null> {
  const assessment = await prisma.adaptiveAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      objectiveSnapshots: true,
      responses: {
        orderBy: { sequenceNum: "asc" },
        select: {
          misconceptionTag: true,
          isCorrect: true,
        },
      },
    },
  });
  if (!assessment || !assessment.completedAt) return null;

  const misconceptionCounts = new Map<string, number>();
  for (const response of assessment.responses) {
    if (response.isCorrect) continue;
    const tag = response.misconceptionTag || "unknown";
    misconceptionCounts.set(tag, (misconceptionCounts.get(tag) ?? 0) + 1);
  }
  const misconceptionsTop = Array.from(misconceptionCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const objectiveBreakdown = assessment.objectiveSnapshots
    .map((row) => ({
      objectiveId: row.objectiveId,
      askedCount: row.askedCount,
      correctCount: row.correctCount,
      missRate: Number((row.missRate * 100).toFixed(1)),
    }))
    .sort((a, b) => b.askedCount - a.askedCount);

  return {
    done: true,
    masteryScore: assessment.masteryScore,
    uncertainty: assessment.uncertaintyScore,
    questionCount: assessment.questionCount,
    objectiveBreakdown,
    misconceptionsTop,
    recommendationBand: (assessment.band as "heavy" | "medium" | "light") ?? "medium",
    lowConfidence: assessment.lowConfidence,
  };
}

function parseJsonArray(raw: string, fallback: string[]): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return fallback; }
}

async function awardBadgeIfEarned(teamId: string, conceptId: string, masteryScore: number) {
  if (masteryScore < 2.5) return;
  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { badges: true } });
  if (!team) return;
  const current = parseJsonArray(team.badges, []);
  if (current.includes(conceptId)) return;
  await prisma.team.update({
    where: { id: teamId },
    data: { badges: JSON.stringify([...current, conceptId]) },
  });
}

function parseStateFromAssessment(row: {
  masteryTheta: number;
  masteryScore: number;
  uncertaintyScore: number;
  questionCount: number;
  usedQuestionIdsJson: string;
  objectiveCoverageJson: string;
  recentDifficultyTrailJson: string;
  conceptSessionSeed: string;
}): AdaptiveEngineState {
  return {
    masteryTheta: row.masteryTheta,
    masteryScore: row.masteryScore,
    uncertainty: row.uncertaintyScore,
    askedCount: row.questionCount,
    usedQuestionIds: parseUsedQuestionIds(row.usedQuestionIdsJson),
    objectiveCoverage: parseObjectiveCoverage(row.objectiveCoverageJson),
    recentDifficultyTrail: parseDifficultyTrail(row.recentDifficultyTrailJson),
    conceptSessionSeed: row.conceptSessionSeed,
  };
}

export async function POST(req: NextRequest) {
  if (!FEATURE_ADAPTIVE_CHECKS_V1) {
    return NextResponse.json(
      { error: "Adaptive checks are disabled", code: "FEATURE_DISABLED" },
      { status: 409 }
    );
  }

  const student = await getStudentFromRequest(req);
  if (!student) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json()) as {
    attemptId?: string;
    questionId?: string;
    selectedIndex?: number;
  };
  const attemptId = body.attemptId?.trim();
  const questionId = body.questionId?.trim();
  const selectedIndex = body.selectedIndex;

  if (!attemptId || !questionId || typeof selectedIndex !== "number") {
    return NextResponse.json(
      { error: "attemptId, questionId, and selectedIndex are required", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
  if (selectedIndex < 0 || selectedIndex > 3) {
    return NextResponse.json({ error: "selectedIndex must be 0-3", code: "BAD_REQUEST" }, { status: 400 });
  }

  const assessment = await prisma.adaptiveAssessment.findUnique({
    where: { id: attemptId },
  });
  if (!assessment || assessment.studentId !== student.id) {
    return NextResponse.json({ error: "Adaptive attempt not found", code: "NOT_FOUND" }, { status: 404 });
  }

  if (assessment.completedAt) {
    const completed = await buildCompletedResponse(assessment.id);
    if (!completed) {
      return NextResponse.json({ error: "Completed assessment not found", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(completed);
  }

  if (assessment.currentQuestionId !== questionId) {
    const alreadyAnswered = await prisma.adaptiveResponse.findFirst({
      where: { assessmentId: assessment.id, questionId },
      select: { id: true },
    });
    if (!alreadyAnswered) {
      return NextResponse.json(
        { error: "Out-of-sync question state. Refresh and continue.", code: "STATE_CONFLICT" },
        { status: 409 }
      );
    }

    if (!assessment.currentQuestionId) {
      const completed = await buildCompletedResponse(assessment.id);
      if (completed) return NextResponse.json(completed);
    }

    const questions = await loadAdaptiveQuestionsFromDb(prisma, assessment.conceptId);
    const current = questions.find((question) => question.id === assessment.currentQuestionId);
    if (!current) {
      return NextResponse.json(
        { error: "Current adaptive question not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      done: false,
      askedCount: assessment.questionCount + 1,
      minQuestions: ADAPTIVE_MIN_QUESTIONS,
      maxQuestions: ADAPTIVE_MAX_QUESTIONS,
      currentEstimate: {
        masteryScore: assessment.masteryScore,
        uncertainty: assessment.uncertaintyScore,
      },
      nextQuestion: {
        id: current.id,
        stem: current.stem,
        options: current.options,
      },
    });
  }

  const questions = await loadAdaptiveQuestionsFromDb(prisma, assessment.conceptId);
  const currentQuestion = questions.find((question) => question.id === questionId);
  if (!currentQuestion) {
    return NextResponse.json(
      { error: "Adaptive question not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const currentState = parseStateFromAssessment(assessment);
  const update = applyAdaptiveAnswer(currentState, currentQuestion, selectedIndex);

  const feedback: FeedbackPayload = {
    isCorrect: update.isCorrect,
    correctIndex: currentQuestion.correctIndex,
    explanation: update.isCorrect
      ? currentQuestion.explanationCorrect
      : currentQuestion.explanationRemediation,
  };

  try {
    await prisma.adaptiveResponse.create({
      data: {
        assessmentId: assessment.id,
        questionId: currentQuestion.id,
        sequenceNum: assessment.currentQuestionSequence,
        selectedIndex,
        isCorrect: update.isCorrect,
        difficultyLevel: currentQuestion.difficultyLevel,
        objectiveId: currentQuestion.objectiveId,
        misconceptionTag: update.misconceptionTag,
        thetaBefore: update.thetaBefore,
        thetaAfter: update.thetaAfter,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const completed = await buildCompletedResponse(assessment.id);
      if (completed) return NextResponse.json(completed);
      return NextResponse.json(
        { error: "Duplicate answer submission detected. Refresh and continue.", code: "STATE_CONFLICT" },
        { status: 409 }
      );
    }
    throw error;
  }

  const questionCount = assessment.questionCount + 1;
  const lowConfidence =
    questionCount >= ADAPTIVE_MAX_QUESTIONS && update.uncertaintyAfter > 0.38;
  const band = masteryBandFromScore(update.masteryScoreAfter);

  if (update.stop) {
    const objectiveBreakdown = buildObjectiveBreakdown(update.objectiveCoverage);
    await prisma.$transaction([
      prisma.adaptiveAssessment.update({
        where: { id: assessment.id },
        data: {
          masteryTheta: update.thetaAfter,
          masteryScore: update.masteryScoreAfter,
          uncertaintyScore: update.uncertaintyAfter,
          questionCount,
          band,
          lowConfidence,
          completedAt: new Date(),
          usedQuestionIdsJson: serializeUsedQuestionIds(update.usedQuestionIds),
          objectiveCoverageJson: serializeObjectiveCoverage(update.objectiveCoverage),
          recentDifficultyTrailJson: serializeDifficultyTrail(update.recentDifficultyTrail),
          currentQuestionId: null,
          currentQuestionSequence: assessment.currentQuestionSequence + 1,
        },
      }),
      prisma.adaptiveObjectiveMasterySnapshot.deleteMany({
        where: { assessmentId: assessment.id },
      }),
      prisma.adaptiveObjectiveMasterySnapshot.createMany({
        data: objectiveBreakdown.map((item) => ({
          assessmentId: assessment.id,
          objectiveId: item.objectiveId,
          askedCount: item.askedCount,
          correctCount: item.correctCount,
          missRate: item.askedCount === 0 ? 0 : (item.askedCount - item.correctCount) / item.askedCount,
          uncertaintyRate: update.uncertaintyAfter,
        })),
      }),
    ]);

    await awardBadgeIfEarned(assessment.teamId, assessment.conceptId, update.masteryScoreAfter);
    const completed = await buildCompletedResponse(assessment.id);
    if (!completed) {
      return NextResponse.json(
        { error: "Adaptive summary generation failed", code: "UNKNOWN" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ...completed, feedback });
  }

  const usageRows = await prisma.adaptiveResponse.findMany({
    where: { assessment: { conceptId: assessment.conceptId } },
    select: { questionId: true },
  });
  const usageCounts = buildUsageCounts(usageRows.map((row) => row.questionId));
  const conceptSeed = getAdaptiveConceptSeeds().find(
    (seed) => seed.conceptId === assessment.conceptId
  );
  const nextQuestion = chooseNextAdaptiveQuestion(
    questions,
    {
      masteryTheta: update.thetaAfter,
      masteryScore: update.masteryScoreAfter,
      uncertainty: update.uncertaintyAfter,
      askedCount: questionCount,
      usedQuestionIds: update.usedQuestionIds,
      objectiveCoverage: update.objectiveCoverage,
      recentDifficultyTrail: update.recentDifficultyTrail,
      conceptSessionSeed: assessment.conceptSessionSeed,
    },
    usageCounts,
    conceptSeed?.coreObjectiveIds ?? []
  );

  if (!nextQuestion) {
    const fallbackBand = masteryBandFromScore(update.masteryScoreAfter);
    const objectiveBreakdown = buildObjectiveBreakdown(update.objectiveCoverage);
    await prisma.$transaction([
      prisma.adaptiveAssessment.update({
        where: { id: assessment.id },
        data: {
          masteryTheta: update.thetaAfter,
          masteryScore: update.masteryScoreAfter,
          uncertaintyScore: update.uncertaintyAfter,
          questionCount,
          band: fallbackBand,
          lowConfidence,
          completedAt: new Date(),
          usedQuestionIdsJson: serializeUsedQuestionIds(update.usedQuestionIds),
          objectiveCoverageJson: serializeObjectiveCoverage(update.objectiveCoverage),
          recentDifficultyTrailJson: serializeDifficultyTrail(update.recentDifficultyTrail),
          currentQuestionId: null,
          currentQuestionSequence: assessment.currentQuestionSequence + 1,
        },
      }),
      prisma.adaptiveObjectiveMasterySnapshot.deleteMany({
        where: { assessmentId: assessment.id },
      }),
      prisma.adaptiveObjectiveMasterySnapshot.createMany({
        data: objectiveBreakdown.map((item) => ({
          assessmentId: assessment.id,
          objectiveId: item.objectiveId,
          askedCount: item.askedCount,
          correctCount: item.correctCount,
          missRate: item.askedCount === 0 ? 0 : (item.askedCount - item.correctCount) / item.askedCount,
          uncertaintyRate: update.uncertaintyAfter,
        })),
      }),
    ]);
    await awardBadgeIfEarned(assessment.teamId, assessment.conceptId, update.masteryScoreAfter);
    const completed = await buildCompletedResponse(assessment.id);
    if (completed) return NextResponse.json({ ...completed, feedback });
    return NextResponse.json({ error: "Unable to finalize adaptive attempt", code: "UNKNOWN" }, { status: 500 });
  }

  await prisma.adaptiveAssessment.update({
    where: { id: assessment.id },
    data: {
      masteryTheta: update.thetaAfter,
      masteryScore: update.masteryScoreAfter,
      uncertaintyScore: update.uncertaintyAfter,
      questionCount,
      band,
      lowConfidence,
      usedQuestionIdsJson: serializeUsedQuestionIds(update.usedQuestionIds),
      objectiveCoverageJson: serializeObjectiveCoverage(update.objectiveCoverage),
      recentDifficultyTrailJson: serializeDifficultyTrail(update.recentDifficultyTrail),
      currentQuestionId: nextQuestion.id,
      currentQuestionSequence: assessment.currentQuestionSequence + 1,
    },
  });

  return NextResponse.json({
    done: false,
    feedback,
    askedCount: questionCount + 1,
    minQuestions: ADAPTIVE_MIN_QUESTIONS,
    maxQuestions: ADAPTIVE_MAX_QUESTIONS,
    currentEstimate: {
      masteryScore: update.masteryScoreAfter,
      uncertainty: update.uncertaintyAfter,
    },
    nextQuestion: {
      id: nextQuestion.id,
      stem: nextQuestion.stem,
      options: nextQuestion.options,
    },
  });
}
