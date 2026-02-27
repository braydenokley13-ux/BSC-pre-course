export {};
import { getAdaptiveQuestionBank, getAdaptiveConceptSeeds } from "../lib/adaptiveBank";

const MIN_PER_CONCEPT = 48;
const MIN_PER_DIFFICULTY = 12;
const MIN_OBJECTIVES = 6;
const MIN_PER_OBJECTIVE_DIFFICULTY = 2;

const questions = getAdaptiveQuestionBank();
const seeds = getAdaptiveConceptSeeds();

const errors: string[] = [];

for (const seed of seeds) {
  const conceptQuestions = questions.filter((q) => q.conceptId === seed.conceptId);
  if (conceptQuestions.length < MIN_PER_CONCEPT) {
    errors.push(
      `${seed.conceptId}: has ${conceptQuestions.length} questions, needs at least ${MIN_PER_CONCEPT}.`
    );
  }

  const objectiveIds = new Set(conceptQuestions.map((q) => q.objectiveId));
  if (objectiveIds.size < MIN_OBJECTIVES) {
    errors.push(
      `${seed.conceptId}: has ${objectiveIds.size} objectives, needs at least ${MIN_OBJECTIVES}.`
    );
  }

  for (const difficulty of [1, 2, 3, 4]) {
    const count = conceptQuestions.filter((q) => q.difficultyLevel === difficulty).length;
    if (count < MIN_PER_DIFFICULTY) {
      errors.push(
        `${seed.conceptId}: difficulty ${difficulty} has ${count}, needs at least ${MIN_PER_DIFFICULTY}.`
      );
    }
  }

  for (const objectiveId of Array.from(objectiveIds)) {
    for (const difficulty of [1, 2, 3, 4]) {
      const count = conceptQuestions.filter(
        (q) => q.objectiveId === objectiveId && q.difficultyLevel === difficulty
      ).length;
      if (count < MIN_PER_OBJECTIVE_DIFFICULTY) {
        errors.push(
          `${seed.conceptId}/${objectiveId}: difficulty ${difficulty} has ${count}, needs ${MIN_PER_OBJECTIVE_DIFFICULTY}.`
        );
      }
    }
  }

  for (const question of conceptQuestions) {
    if (question.misconceptionTags.length !== 4) {
      errors.push(`${question.id}: misconceptionTags must have exactly 4 entries.`);
    }
  }
}

if (errors.length > 0) {
  console.error("[adaptive-coverage] FAIL");
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`[adaptive-coverage] OK: ${questions.length} questions across ${seeds.length} concepts.`);