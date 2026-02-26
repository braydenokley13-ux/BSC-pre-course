import { parseJson } from "@/lib/json";
import { AdaptiveQuestionSeed } from "@/lib/adaptiveBankTypes";

export interface ObjectiveCoverageEntry {
  asked: number;
  correct: number;
  incorrect: number;
}

export type ObjectiveCoverage = Record<string, ObjectiveCoverageEntry>;

export interface AdaptiveEngineState {
  masteryTheta: number;
  masteryScore: number;
  uncertainty: number;
  askedCount: number;
  usedQuestionIds: string[];
  objectiveCoverage: ObjectiveCoverage;
  recentDifficultyTrail: number[];
  conceptSessionSeed: string;
}

export interface AdaptiveResponseUpdate {
  isCorrect: boolean;
  thetaBefore: number;
  thetaAfter: number;
  uncertaintyAfter: number;
  masteryScoreAfter: number;
  misconceptionTag: string;
  objectiveCoverage: ObjectiveCoverage;
  recentDifficultyTrail: number[];
  usedQuestionIds: string[];
  stop: boolean;
}

const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 7;
const THETA_STEP = 0.55;
const DIFFICULTY_TO_CHALLENGE: Record<number, number> = {
  1: -1.0,
  2: -0.3,
  3: 0.4,
  4: 1.0,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function informationAt(theta: number, challenge: number): number {
  const p = sigmoid(theta - challenge);
  return p * (1 - p);
}

export function thetaToMasteryScore(theta: number): number {
  const score = 1 + 3 * sigmoid(theta);
  return Math.round(clamp(score, 1.0, 4.0) * 100) / 100;
}

export function masteryBandFromScore(score: number): "heavy" | "medium" | "light" {
  if (score < 2.4) return "heavy";
  if (score < 3.1) return "medium";
  return "light";
}

export function parseUsedQuestionIds(raw: string): string[] {
  return parseJson<string[]>(raw, []);
}

export function parseObjectiveCoverage(raw: string): ObjectiveCoverage {
  return parseJson<ObjectiveCoverage>(raw, {});
}

export function parseDifficultyTrail(raw: string): number[] {
  return parseJson<number[]>(raw, []);
}

export function serializeObjectiveCoverage(coverage: ObjectiveCoverage): string {
  return JSON.stringify(coverage);
}

export function serializeUsedQuestionIds(ids: string[]): string {
  return JSON.stringify(ids);
}

export function serializeDifficultyTrail(trail: number[]): string {
  return JSON.stringify(trail);
}

export function createInitialEngineState(seed: string): AdaptiveEngineState {
  return {
    masteryTheta: 0,
    masteryScore: thetaToMasteryScore(0),
    uncertainty: 1,
    askedCount: 0,
    usedQuestionIds: [],
    objectiveCoverage: {},
    recentDifficultyTrail: [],
    conceptSessionSeed: seed,
  };
}

export function objectiveCountTouched(coverage: ObjectiveCoverage): number {
  return Object.keys(coverage).length;
}

export function shouldStopAdaptive(
  askedCount: number,
  uncertainty: number,
  coverage: ObjectiveCoverage
): boolean {
  if (askedCount >= MAX_QUESTIONS) return true;
  if (askedCount < MIN_QUESTIONS) return false;
  return uncertainty <= 0.38 && objectiveCountTouched(coverage) >= 3;
}

export function targetDifficultyFromTheta(theta: number, recentTrail: number[]): number {
  let target = 2;
  if (theta < -0.75) target = 1;
  else if (theta < 0) target = 2;
  else if (theta < 0.75) target = 3;
  else target = 4;

  const last = recentTrail[recentTrail.length - 1];
  if (typeof last === "number") {
    if (target > last + 1) target = last + 1;
    if (target < last - 1) target = last - 1;
  }
  return clamp(target, 1, 4);
}

export function chooseNextAdaptiveQuestion(
  questions: AdaptiveQuestionSeed[],
  state: AdaptiveEngineState,
  usageCounts: Record<string, number> = {},
  preferredObjectiveIds: string[] = []
): AdaptiveQuestionSeed | null {
  const used = new Set(state.usedQuestionIds);
  const candidates = questions.filter((question) => !used.has(question.id));
  if (candidates.length === 0) return null;

  const coverageByObjective = state.objectiveCoverage;
  const minCoverage = candidates.reduce((min, question) => {
    const asked = coverageByObjective[question.objectiveId]?.asked ?? 0;
    return Math.min(min, asked);
  }, Number.POSITIVE_INFINITY);

  const underCoveredObjectives = new Set(
    candidates
      .filter((question) => (coverageByObjective[question.objectiveId]?.asked ?? 0) === minCoverage)
      .map((question) => question.objectiveId)
  );

  const targetDifficulty = targetDifficultyFromTheta(
    state.masteryTheta,
    state.recentDifficultyTrail
  );

  const preferredSet = new Set(preferredObjectiveIds);
  const scored = candidates.map((question) => {
    const challenge = DIFFICULTY_TO_CHALLENGE[question.difficultyLevel] ?? 0;
    const info = informationAt(state.masteryTheta, challenge);
    const diffPenalty = Math.abs(question.difficultyLevel - targetDifficulty) * 0.15;
    const usagePenalty = (usageCounts[question.id] ?? 0) * 0.01;
    const coverageBoost = underCoveredObjectives.has(question.objectiveId) ? 0.35 : 0;
    const preferredBoost = preferredSet.has(question.objectiveId) ? 0.12 : 0;
    const tieNoise = (stableHash(`${state.conceptSessionSeed}:${question.id}`) % 997) / 1_000_000;
    const score = info + coverageBoost + preferredBoost - diffPenalty - usagePenalty + tieNoise;
    return { question, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.question ?? null;
}

export function applyAdaptiveAnswer(
  state: AdaptiveEngineState,
  question: AdaptiveQuestionSeed,
  selectedIndex: number
): AdaptiveResponseUpdate {
  const thetaBefore = state.masteryTheta;
  const challenge = DIFFICULTY_TO_CHALLENGE[question.difficultyLevel] ?? 0;
  const expected = sigmoid(thetaBefore - challenge);
  const actual = selectedIndex === question.correctIndex ? 1 : 0;
  const thetaAfter = clamp(thetaBefore + THETA_STEP * (actual - expected), -3, 3);
  const uncertaintyAfter = Math.max(0.22, state.uncertainty * 0.82);
  const masteryScoreAfter = thetaToMasteryScore(thetaAfter);

  const objectiveCoverage: ObjectiveCoverage = { ...state.objectiveCoverage };
  const existing = objectiveCoverage[question.objectiveId] ?? { asked: 0, correct: 0, incorrect: 0 };
  objectiveCoverage[question.objectiveId] = {
    asked: existing.asked + 1,
    correct: existing.correct + (actual === 1 ? 1 : 0),
    incorrect: existing.incorrect + (actual === 0 ? 1 : 0),
  };

  const recentDifficultyTrail = [...state.recentDifficultyTrail, question.difficultyLevel].slice(-6);
  const usedQuestionIds = [...state.usedQuestionIds, question.id];
  const askedCount = state.askedCount + 1;
  const stop = shouldStopAdaptive(askedCount, uncertaintyAfter, objectiveCoverage);

  return {
    isCorrect: actual === 1,
    thetaBefore,
    thetaAfter,
    uncertaintyAfter,
    masteryScoreAfter,
    misconceptionTag: question.misconceptionTags[selectedIndex] ?? "unknown",
    objectiveCoverage,
    recentDifficultyTrail,
    usedQuestionIds,
    stop,
  };
}

export function buildObjectiveBreakdown(coverage: ObjectiveCoverage) {
  return Object.entries(coverage).map(([objectiveId, stats]) => ({
    objectiveId,
    askedCount: stats.asked,
    correctCount: stats.correct,
    missRate: stats.asked === 0 ? 0 : Number(((stats.incorrect / stats.asked) * 100).toFixed(1)),
  }));
}

export const ADAPTIVE_MIN_QUESTIONS = MIN_QUESTIONS;
export const ADAPTIVE_MAX_QUESTIONS = MAX_QUESTIONS;
