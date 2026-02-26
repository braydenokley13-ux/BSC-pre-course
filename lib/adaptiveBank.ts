import { ADAPTIVE_CONCEPT_SEEDS } from "../data/adaptive-bank";
import {
  AdaptiveConceptSeed,
  AdaptiveQuestionSeed,
  DifficultyLevel,
} from "./adaptiveBankTypes";

type AdaptiveQuestionRecord = {
  id: string;
  conceptId: string;
  objectiveId: string;
  difficultyLevel: number;
  stem: string;
  optionsJson: string;
  correctIndex: number;
  misconceptionTagsJson: string;
  explanationCorrect: string;
  explanationRemediation: string;
  readingLevel: number;
  active: boolean;
  version: number;
  source: string;
};

type AdaptiveQuestionStore = {
  adaptiveQuestion: {
    count(args: { where: { conceptId: string } }): Promise<number>;
    upsert(args: {
      where: { id: string };
      update: AdaptiveQuestionRecord;
      create: AdaptiveQuestionRecord;
    }): Promise<unknown>;
    findMany(args: {
      where: { conceptId: string; active: boolean };
      orderBy: { id: "asc" };
    }): Promise<
      Array<{
        id: string;
        conceptId: string;
        objectiveId: string;
        difficultyLevel: number;
        stem: string;
        optionsJson: string;
        correctIndex: number;
        misconceptionTagsJson: string;
        explanationCorrect: string;
        explanationRemediation: string;
        readingLevel: number;
        active: boolean;
        version: number;
        source: string;
      }>
    >;
  };
};

const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3, 4];
const QUESTION_VARIANTS = [1, 2] as const;

const DIFFICULTY_CONTEXT: Record<DifficultyLevel, string> = {
  1: "basic rules check",
  2: "team planning decision",
  3: "tradeoff-heavy decision",
  4: "high-pressure executive decision",
};

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  const trimmed = cleaned.replace(/(?:es|ed|e)$/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function gradeFromText(text: string): number {
  const words = Array.from(text.match(/\b[a-zA-Z][a-zA-Z'-]*\b/g) ?? []);
  const sentenceSplits = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  if (words.length === 0 || sentenceSplits.length === 0) return 0;
  let syllables = 0;
  for (const word of words) {
    syllables += countSyllables(word);
  }
  const wordsPerSentence = words.length / sentenceSplits.length;
  const syllablesPerWord = syllables / words.length;
  return 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
}

function toHumanTerm(termId: string): string {
  return termId.replace(/-/g, " ");
}

function buildCorrectOption(seed: AdaptiveConceptSeed, objectiveId: string, difficulty: DifficultyLevel): string {
  if (difficulty === 1) {
    return `Use ${objectiveId.replace(
      /-/g,
      " "
    )} rules first, then check cap impact and timeline before finalizing this ${seed.conceptId} move.`;
  }
  if (difficulty === 2) {
    return `Apply ${objectiveId.replace(
      /-/g,
      " "
    )} with cap and timeline context before committing to one team plan.`;
  }
  if (difficulty === 3) {
    return `Balance ${objectiveId.replace(
      /-/g,
      " "
    )} against short-term pressure while protecting long-term flexibility.`;
  }
  return `Use ${objectiveId.replace(
    /-/g,
    " "
  )} to choose the move with strongest multi-year risk and flexibility control.`;
}

function buildDistractor(tag: string, termId: string, focus: string): string {
  const humanTerm = toHumanTerm(termId);
  const misconception = tag.replace(/-/g, " ");
  if (tag.includes("always")) {
    return `Always choose the biggest immediate move and ignore ${humanTerm}; this assumes ${misconception} and ignores long-term cap and roster tradeoffs.`;
  }
  if (tag.includes("never")) {
    return `Never adjust for ${humanTerm}; this assumes ${misconception} and ignores real team constraints.`;
  }
  if (tag.includes("myth") || tag.includes("is-soft")) {
    return `Treat ${humanTerm} as a minor suggestion; this assumes ${misconception} and ignores penalties teams still face.`;
  }
  if (tag.includes("only")) {
    return `Only use ${humanTerm} late in the season; this assumes ${misconception} and misses early planning tradeoffs.`;
  }
  if (tag.includes("irrelevant")) {
    return `Ignore ${humanTerm} and ${focus}; this assumes ${misconception} and removes key evidence from the decision.`;
  }
  if (tag.includes("fixed")) {
    return `${humanTerm} is fixed every year; this assumes ${misconception} and skips annual context updates.`;
  }
  return `Use a shortcut instead of ${humanTerm}; this assumes ${misconception} and skips a full risk check.`;
}

function buildQuestionStem(
  seed: AdaptiveConceptSeed,
  objectiveFocus: string,
  difficulty: DifficultyLevel,
  variant: number
): string {
  return `In a ${DIFFICULTY_CONTEXT[difficulty]} (${variant}/2) for ${seed.conceptId}, which choice best applies ${objectiveFocus}?`;
}

function buildQuestionSetForConcept(seed: AdaptiveConceptSeed): AdaptiveQuestionSeed[] {
  const questions: AdaptiveQuestionSeed[] = [];
  seed.objectives.forEach((objective, objectiveIndex) => {
    DIFFICULTY_LEVELS.forEach((difficulty) => {
      QUESTION_VARIANTS.forEach((variant) => {
        const stem = buildQuestionStem(seed, objective.focus, difficulty, variant);
        const correctOption = buildCorrectOption(seed, objective.objectiveId, difficulty);
        const distractors = objective.misconceptionTags.map((tag) => ({
          text: buildDistractor(tag, objective.termId, objective.focus),
          tag,
        }));
        const correctIndex = ((objectiveIndex + difficulty + variant) % 4) as 0 | 1 | 2 | 3;

        const options = ["", "", "", ""] as [string, string, string, string];
        const misconceptionTags = ["", "", "", ""] as [string, string, string, string];
        let distractorIdx = 0;
        for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
          if (optionIndex === correctIndex) {
            options[optionIndex] = correctOption;
            misconceptionTags[optionIndex] = "correct";
            continue;
          }
          options[optionIndex] = distractors[distractorIdx].text;
          misconceptionTags[optionIndex] = distractors[distractorIdx].tag;
          distractorIdx += 1;
        }

        const readingLevel = Math.round(gradeFromText(`${stem}. ${options.join(". ")}`) * 100) / 100;
        questions.push({
          id: `${seed.conceptId}__${objective.objectiveId}__d${difficulty}__v${variant}`,
          conceptId: seed.conceptId,
          objectiveId: objective.objectiveId,
          difficultyLevel: difficulty,
          stem,
          options,
          correctIndex,
          misconceptionTags,
          explanationCorrect: `Correct. This choice uses ${toHumanTerm(
            objective.termId
          )} correctly in context.`,
          explanationRemediation: objective.remediation,
          readingLevel,
          readingWaived: readingLevel < 6 || readingLevel > 8,
          active: true,
          version: 1,
          source: seed.source,
        });
      });
    });
  });
  return questions;
}

const ADAPTIVE_QUESTION_BANK: AdaptiveQuestionSeed[] = ADAPTIVE_CONCEPT_SEEDS.flatMap((seed) =>
  buildQuestionSetForConcept(seed)
);

const BANK_BY_ID = new Map(ADAPTIVE_QUESTION_BANK.map((question) => [question.id, question]));
const BANK_BY_CONCEPT = new Map<string, AdaptiveQuestionSeed[]>();
for (const question of ADAPTIVE_QUESTION_BANK) {
  const existing = BANK_BY_CONCEPT.get(question.conceptId) ?? [];
  existing.push(question);
  BANK_BY_CONCEPT.set(question.conceptId, existing);
}
for (const [conceptId, questions] of Array.from(BANK_BY_CONCEPT.entries())) {
  BANK_BY_CONCEPT.set(
    conceptId,
    [...questions].sort((a, b) => a.id.localeCompare(b.id))
  );
}

export function getAdaptiveConceptSeeds(): AdaptiveConceptSeed[] {
  return ADAPTIVE_CONCEPT_SEEDS;
}

export function getAdaptiveQuestionBank(): AdaptiveQuestionSeed[] {
  return ADAPTIVE_QUESTION_BANK;
}

export function getAdaptiveQuestionBankForConcept(conceptId: string): AdaptiveQuestionSeed[] {
  return BANK_BY_CONCEPT.get(conceptId) ?? [];
}

export function getAdaptiveQuestionById(questionId: string): AdaptiveQuestionSeed | undefined {
  return BANK_BY_ID.get(questionId);
}

export function toAdaptiveQuestionRecord(question: AdaptiveQuestionSeed): AdaptiveQuestionRecord {
  return {
    id: question.id,
    conceptId: question.conceptId,
    objectiveId: question.objectiveId,
    difficultyLevel: question.difficultyLevel,
    stem: question.stem,
    optionsJson: JSON.stringify(question.options),
    correctIndex: question.correctIndex,
    misconceptionTagsJson: JSON.stringify(question.misconceptionTags),
    explanationCorrect: question.explanationCorrect,
    explanationRemediation: question.explanationRemediation,
    readingLevel: question.readingLevel,
    active: question.active,
    version: question.version,
    source: question.source,
  };
}

export async function ensureAdaptiveQuestionBankForConcept(
  store: AdaptiveQuestionStore,
  conceptId: string
): Promise<void> {
  const questions = getAdaptiveQuestionBankForConcept(conceptId);
  if (questions.length === 0) return;

  const existingCount = await store.adaptiveQuestion.count({
    where: { conceptId },
  });
  if (existingCount >= questions.length) return;

  for (const question of questions) {
    const record = toAdaptiveQuestionRecord(question);
    await store.adaptiveQuestion.upsert({
      where: { id: question.id },
      update: record,
      create: record,
    });
  }
}

export async function loadAdaptiveQuestionsFromDb(
  store: AdaptiveQuestionStore,
  conceptId: string
): Promise<AdaptiveQuestionSeed[]> {
  await ensureAdaptiveQuestionBankForConcept(store, conceptId);
  const rows = await store.adaptiveQuestion.findMany({
    where: {
      conceptId,
      active: true,
    },
    orderBy: { id: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    conceptId: row.conceptId,
    objectiveId: row.objectiveId,
    difficultyLevel: row.difficultyLevel as DifficultyLevel,
    stem: row.stem,
    options: JSON.parse(row.optionsJson) as [string, string, string, string],
    correctIndex: row.correctIndex as 0 | 1 | 2 | 3,
    misconceptionTags: JSON.parse(row.misconceptionTagsJson) as [string, string, string, string],
    explanationCorrect: row.explanationCorrect,
    explanationRemediation: row.explanationRemediation,
    readingLevel: row.readingLevel,
    active: row.active,
    version: row.version,
    source: row.source,
  }));
}
