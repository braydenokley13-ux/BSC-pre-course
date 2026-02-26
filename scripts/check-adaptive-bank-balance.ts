import { getAdaptiveQuestionBank, getAdaptiveConceptSeeds } from "../lib/adaptiveBank";

const questions = getAdaptiveQuestionBank();
const concepts = getAdaptiveConceptSeeds();
const errors: string[] = [];

for (const concept of concepts) {
  const conceptQuestions = questions.filter((q) => q.conceptId === concept.conceptId);
  const distribution = [0, 0, 0, 0];
  let correctLengthTotal = 0;
  let wrongLengthTotal = 0;
  let wrongCount = 0;

  for (const question of conceptQuestions) {
    distribution[question.correctIndex] += 1;
    const correct = question.options[question.correctIndex];
    correctLengthTotal += correct.length;
    question.options.forEach((opt, idx) => {
      if (idx === question.correctIndex) return;
      wrongLengthTotal += opt.length;
      wrongCount += 1;
    });
  }

  const max = Math.max(...distribution);
  const min = Math.min(...distribution);
  const spreadAllowed = Math.ceil(conceptQuestions.length * 0.1);
  if (max - min > spreadAllowed) {
    errors.push(
      `${concept.conceptId}: correct index distribution is unbalanced (${distribution.join(
        ","
      )}), spread ${max - min} > allowed ${spreadAllowed}.`
    );
  }

  const avgCorrectLen = conceptQuestions.length === 0 ? 0 : correctLengthTotal / conceptQuestions.length;
  const avgWrongLen = wrongCount === 0 ? 0 : wrongLengthTotal / wrongCount;
  const ratio = avgWrongLen === 0 ? 0 : Math.abs(avgCorrectLen - avgWrongLen) / avgWrongLen;
  if (ratio > 0.35) {
    errors.push(
      `${concept.conceptId}: option length bias too large (correct ${avgCorrectLen.toFixed(
        1
      )} vs wrong ${avgWrongLen.toFixed(1)}).`
    );
  }
}

if (errors.length > 0) {
  console.error("[adaptive-balance] FAIL");
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log("[adaptive-balance] OK: answer distribution and option length balance checks passed.");
