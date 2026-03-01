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

type ConceptVoice = {
  quickScene: string;
  planningScene: string;
  tradeoffScene: string;
  pressureScene: string;
  decisionLens: string;
};

const CONCEPT_VOICES: Record<string, ConceptVoice> = {
  "luxury-tax": {
    quickScene: "a cap-table check before free agency",
    planningScene: "an ownership budget planning meeting",
    tradeoffScene: "a debate about keeping a contender together",
    pressureScene: "deadline calls while the team sits near the second apron",
    decisionLens: "tax penalties, apron limits, and future flexibility",
  },
  "extensions-options": {
    quickScene: "an agent call about extension language",
    planningScene: "a contract strategy meeting before the offseason",
    tradeoffScene: "a negotiation where player leverage and team control conflict",
    pressureScene: "the final hour before a player option decision",
    decisionLens: "player leverage, option structure, and control years",
  },
  "bri-revenue": {
    quickScene: "a finance desk briefing on BRI trends",
    planningScene: "a budget forecast meeting with ownership",
    tradeoffScene: "a debate on spending now versus preserving future cap room",
    pressureScene: "a midseason revenue drop update",
    decisionLens: "revenue swings, cap forecasts, and spending risk",
  },
  "trade-matching": {
    quickScene: "a trade machine salary check",
    planningScene: "a two-team package design session",
    tradeoffScene: "a negotiation balancing fit, salary, and pick value",
    pressureScene: "deadline calls with matching rules closing options",
    decisionLens: "matching math, aggregation limits, and asset timing",
  },
  analytics: {
    quickScene: "a pregame stats huddle",
    planningScene: "a film-plus-data scouting review",
    tradeoffScene: "a debate over small-sample results versus larger trends",
    pressureScene: "a late-night board meeting after a bad stretch",
    decisionLens: "sample quality, context, and predictive value",
  },
  "roster-health": {
    quickScene: "a training staff availability update",
    planningScene: "a load management planning session",
    tradeoffScene: "a debate over seeding urgency versus injury risk",
    pressureScene: "a back-to-back game decision with key players sore",
    decisionLens: "availability risk, workload limits, and recovery windows",
  },
  "rookie-scale": {
    quickScene: "a draft room contract briefing",
    planningScene: "a rookie development and cap planning meeting",
    tradeoffScene: "a decision on immediate minutes versus long-term growth",
    pressureScene: "the team option deadline on a young player",
    decisionLens: "rookie value curve, control years, and development runway",
  },
  "front-office-philosophy": {
    quickScene: "a staff alignment huddle on team identity",
    planningScene: "an offseason strategy session on roster direction",
    tradeoffScene: "a debate between talent maxing and culture fit",
    pressureScene: "a high-stakes decision after public pressure spikes",
    decisionLens: "identity coherence, culture fit, and long-term vision",
  },
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

function conceptLabel(conceptId: string): string {
  return conceptId
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}


function getConceptVoice(conceptId: string): ConceptVoice {
  const voice = CONCEPT_VOICES[conceptId];
  if (voice) return voice;
  return {
    quickScene: `a quick ${conceptLabel(conceptId)} rules huddle`,
    planningScene: `a ${conceptLabel(conceptId)} planning meeting`,
    tradeoffScene: `a ${conceptLabel(conceptId)} tradeoff discussion`,
    pressureScene: `a high-pressure ${conceptLabel(conceptId)} decision`,
    decisionLens: `${conceptLabel(conceptId)} constraints and long-term team impact`,
  };
}

function buildCorrectOption(
  objectiveFocus: string,
  termId: string,
  difficulty: DifficultyLevel,
  correctStatement?: string
): string {
  if (correctStatement) return correctStatement;
  const term = toHumanTerm(termId);
  if (difficulty === 1) {
    return `Use the ${term} rule first. Pick the option that shows the right idea.`;
  }
  if (difficulty === 2) {
    return `Look at team goals, money, and timing. Then use ${term} to pick the best plan.`;
  }
  if (difficulty === 3) {
    return `Think about now and later. Use ${term} to pick the better balance.`;
  }
  return `Even with pressure, use ${term} to choose the safest long-term decision.`;
}

function buildDistractor(
  tag: string,
  termId: string,
  focus: string,
  slot: number,
  misconceptionDescriptions?: [string, string, string]
): string {
  if (misconceptionDescriptions && slot >= 0 && slot <= 2) {
    return misconceptionDescriptions[slot];
  }
  const humanTerm = toHumanTerm(termId);
  const misconception = tag.replace(/-/g, " ");
  if (slot === 0) {
    return `This choice gets ${humanTerm} wrong. It assumes "${misconception}" is true.`;
  }
  if (slot === 1) {
    return `This choice sounds good, but it ignores part of ${humanTerm} and misses the main idea.`;
  }
  return `This choice chases a quick fix and skips ${humanTerm}, so the team likely makes a bad decision.`;
}

function buildQuestionStem(
  seed: AdaptiveConceptSeed,
  termId: string,
  objectiveFocus: string,
  difficulty: DifficultyLevel,
  variant: number
): string {
  const term = toHumanTerm(termId);
  const voice = getConceptVoice(seed.conceptId);
  if (difficulty === 1) {
    return variant === 1
      ? `In ${voice.quickScene}, which statement about ${term} is accurate?`
      : `In ${voice.quickScene}, which option correctly describes ${term}?`;
  }
  if (difficulty === 2) {
    return variant === 1
      ? `In ${voice.planningScene}, which plan correctly applies ${term}?`
      : `In ${voice.planningScene}, which approach shows the right understanding of ${term}?`;
  }
  if (difficulty === 3) {
    return variant === 1
      ? `In ${voice.tradeoffScene}, goals clash. Which option still applies ${term} correctly?`
      : `In ${voice.tradeoffScene}, which plan uses ${term} correctly under competing priorities?`;
  }
  return variant === 1
    ? `In ${voice.pressureScene}, pressure is high. Which decision correctly applies ${term}?`
    : `In ${voice.pressureScene}, which option shows the strongest understanding of ${term}?`;
}

function buildQuestionSetForConcept(seed: AdaptiveConceptSeed): AdaptiveQuestionSeed[] {
  const questions: AdaptiveQuestionSeed[] = [];
  seed.objectives.forEach((objective, objectiveIndex) => {
    DIFFICULTY_LEVELS.forEach((difficulty) => {
      QUESTION_VARIANTS.forEach((variant) => {
        const stem = buildQuestionStem(seed, objective.termId, objective.focus, difficulty, variant);
        const correctOption = buildCorrectOption(
          objective.focus,
          objective.termId,
          difficulty,
          objective.correctStatement
        );
        const distractors = objective.misconceptionTags.map((tag, slot) => ({
          text: buildDistractor(tag, objective.termId, objective.focus, slot, objective.misconceptionDescriptions),
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
          explanationCorrect: objective.correctStatement
            ? `Correct. ${objective.correctStatement}`
            : `Correct. This choice uses ${toHumanTerm(objective.termId)} correctly in context.`,
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
