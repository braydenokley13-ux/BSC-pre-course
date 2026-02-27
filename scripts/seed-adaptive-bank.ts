export {};
import { PrismaClient } from "@prisma/client";
import { getAdaptiveQuestionBank, toAdaptiveQuestionRecord } from "../lib/adaptiveBank";

async function main() {
  const prisma = new PrismaClient();
  const questions = getAdaptiveQuestionBank();

  for (const question of questions) {
    const record = toAdaptiveQuestionRecord(question);
    await prisma.adaptiveQuestion.upsert({
      where: { id: question.id },
      update: record,
      create: record,
    });
  }

  console.log(`[adaptive-seed] Upserted ${questions.length} adaptive questions.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("[adaptive-seed] FAIL", error);
  process.exitCode = 1;
});