export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getStudentFromRequest } from "@/lib/getStudent";
import { getConceptCard } from "@/lib/concepts";
import { FEATURE_ADAPTIVE_CHECKS_V1 } from "@/lib/features";
import {
  chooseNextAdaptiveQuestion,
  createInitialEngineState,
  ADAPTIVE_MIN_QUESTIONS,
  ADAPTIVE_MAX_QUESTIONS,
} from "@/lib/adaptiveEngine";
import {
  ensureAdaptiveQuestionBankForConcept,
  getAdaptiveConceptSeeds,
  loadAdaptiveQuestionsFromDb,
} from "@/lib/adaptiveBank";

function buildUsageCounts(questionIds: string[]): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const questionId of questionIds) {
    usage[questionId] = (usage[questionId] ?? 0) + 1;
  }
  return usage;
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

  const body = (await req.json()) as { conceptId?: string };
  const conceptId = body.conceptId?.trim();
  if (!conceptId) {
    return NextResponse.json({ error: "conceptId is required", code: "BAD_REQUEST" }, { status: 400 });
  }

  const conceptCard = getConceptCard(conceptId);
  if (!conceptCard) {
    return NextResponse.json({ error: "Unknown concept", code: "NOT_FOUND" }, { status: 404 });
  }

  await ensureAdaptiveQuestionBankForConcept(prisma, conceptId);
  const questions = await loadAdaptiveQuestionsFromDb(prisma, conceptId);
  if (questions.length === 0) {
    return NextResponse.json(
      { error: "Adaptive question bank is not available for this concept", code: "CONFIG_ERROR" },
      { status: 409 }
    );
  }

  const existing = await prisma.adaptiveAssessment.findFirst({
    where: {
      studentId: student.id,
      conceptId,
      completedAt: null,
    },
    orderBy: { startedAt: "desc" },
  });

  if (existing?.currentQuestionId) {
    const currentQuestion = questions.find((question) => question.id === existing.currentQuestionId);
    if (currentQuestion) {
      return NextResponse.json({
        attemptId: existing.id,
        question: {
          id: currentQuestion.id,
          stem: currentQuestion.stem,
          options: currentQuestion.options,
        },
        askedCount: existing.questionCount + 1,
        minQuestions: ADAPTIVE_MIN_QUESTIONS,
        maxQuestions: ADAPTIVE_MAX_QUESTIONS,
        currentEstimate: {
          masteryScore: existing.masteryScore,
          uncertainty: existing.uncertaintyScore,
        },
      });
    }
  }

  const seed = nanoid(12);
  const initialState = createInitialEngineState(seed);
  const usageRows = await prisma.adaptiveResponse.findMany({
    where: { assessment: { conceptId } },
    select: { questionId: true },
  });
  const usageCounts = buildUsageCounts(usageRows.map((row) => row.questionId));

  const conceptSeed = getAdaptiveConceptSeeds().find((seedRow) => seedRow.conceptId === conceptId);
  const firstQuestion = chooseNextAdaptiveQuestion(
    questions,
    initialState,
    usageCounts,
    conceptSeed?.coreObjectiveIds ?? []
  );

  if (!firstQuestion) {
    return NextResponse.json(
      { error: "No adaptive question could be selected", code: "CONFIG_ERROR" },
      { status: 409 }
    );
  }

  const assessment = await prisma.adaptiveAssessment.create({
    data: {
      sessionId: student.sessionId,
      teamId: student.teamId,
      studentId: student.id,
      conceptId,
      masteryScore: initialState.masteryScore,
      masteryTheta: initialState.masteryTheta,
      uncertaintyScore: initialState.uncertainty,
      questionCount: 0,
      usedQuestionIdsJson: JSON.stringify([]),
      objectiveCoverageJson: JSON.stringify({}),
      recentDifficultyTrailJson: JSON.stringify([]),
      conceptSessionSeed: seed,
      currentQuestionId: firstQuestion.id,
      currentQuestionSequence: 1,
    },
  });

  return NextResponse.json({
    attemptId: assessment.id,
    question: {
      id: firstQuestion.id,
      stem: firstQuestion.stem,
      options: firstQuestion.options,
    },
    askedCount: 1,
    minQuestions: ADAPTIVE_MIN_QUESTIONS,
    maxQuestions: ADAPTIVE_MAX_QUESTIONS,
    currentEstimate: {
      masteryScore: assessment.masteryScore,
      uncertainty: assessment.uncertaintyScore,
    },
  });
}
