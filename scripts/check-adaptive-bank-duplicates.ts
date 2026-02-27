export {};
import { getAdaptiveQuestionBank } from "../lib/adaptiveBank";

const questions = getAdaptiveQuestionBank();
const errors: string[] = [];
const stemByConcept = new Map<string, Set<string>>();

for (const question of questions) {
  const key = question.conceptId;
  if (!stemByConcept.has(key)) stemByConcept.set(key, new Set<string>());
  const bucket = stemByConcept.get(key)!;
  const normalizedStem = question.stem.trim().toLowerCase();
  if (bucket.has(normalizedStem)) {
    errors.push(`${question.id}: duplicate stem in concept ${question.conceptId}.`);
  } else {
    bucket.add(normalizedStem);
  }

  const optionSet = new Set(question.options.map((opt) => opt.trim().toLowerCase()));
  if (optionSet.size !== 4) {
    errors.push(`${question.id}: options must be unique.`);
  }

  if (question.correctIndex < 0 || question.correctIndex > 3) {
    errors.push(`${question.id}: correctIndex must be 0..3.`);
  }

  for (let idx = 0; idx < question.misconceptionTags.length; idx += 1) {
    const tag = question.misconceptionTags[idx];
    if (idx === question.correctIndex && tag !== "correct") {
      errors.push(`${question.id}: correct option must use misconception tag 'correct'.`);
    }
    if (idx !== question.correctIndex && tag === "correct") {
      errors.push(`${question.id}: distractor option cannot use 'correct' tag.`);
    }
  }
}

if (errors.length > 0) {
  console.error("[adaptive-duplicates] FAIL");
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`[adaptive-duplicates] OK: ${questions.length} questions validated.`);