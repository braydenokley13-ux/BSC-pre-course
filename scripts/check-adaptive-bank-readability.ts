export {};
import { getAdaptiveQuestionBank } from "../lib/adaptiveBank";

const MIN_GRADE = 6.0;
const MAX_GRADE = 8.0;

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

const questions = getAdaptiveQuestionBank();
const errors: string[] = [];
let waivedCount = 0;

for (const question of questions) {
  const text = `${question.stem}. ${question.options.join(". ")}`;
  const grade = Math.round(gradeFromText(text) * 100) / 100;
  const outOfRange = grade < MIN_GRADE || grade > MAX_GRADE;
  if (outOfRange && !question.readingWaived) {
    errors.push(`${question.id}: grade ${grade.toFixed(2)} is outside ${MIN_GRADE}-${MAX_GRADE}.`);
  }
  if (outOfRange && question.readingWaived) {
    waivedCount += 1;
  }
}

if (errors.length > 0) {
  console.error("[adaptive-readability] FAIL");
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(
  `[adaptive-readability] OK: ${questions.length} questions checked. waived=${waivedCount}.`
);