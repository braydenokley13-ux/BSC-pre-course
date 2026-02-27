export {};
import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const MIN_OVERALL_GRADE = 5.0;
const MAX_OVERALL_GRADE = 8.1;

const filesToCheck = [
  "app/join/page.tsx",
  "app/lobby/page.tsx",
  "app/play/page.tsx",
  "app/catalog/page.tsx",
  "app/complete/page.tsx",
  "app/teacher/page.tsx",
  "app/teacher/setup/page.tsx",
  "app/teacher/dashboard/page.tsx",
  "lib/missions.ts",
  "lib/concepts.ts",
  "lib/checks.ts",
].map((p) => join(root, p));

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  const trimmed = cleaned.replace(/(?:es|ed|e)$/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function gradeFromText(text: string): number {
  const words: string[] = text.match(/\b[a-zA-Z][a-zA-Z'-]*\b/g) ?? [];
  const sentenceSplits = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

  if (words.length === 0 || sentenceSplits.length === 0) return 0;

  const syllables = words.reduce<number>((sum, word) => sum + countSyllables(word), 0);
  const wordsPerSentence = words.length / sentenceSplits.length;
  const syllablesPerWord = syllables / words.length;

  return 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
}

function extractReadableStrings(source: string): string[] {
  const out: string[] = [];
  const regex = /(["'`])([\s\S]*?)\1/gm;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    let text = match[2]
      .replace(/\\n/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\$\{[^}]+\}/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length < 24) continue;
    if (!/[a-zA-Z]/.test(text)) continue;
    if (!/\s/.test(text)) continue;
    if (/className|text-\[|bg-\[|border-\[|\/api\/|http|^\.?\/?[\w\-.\/]+$/.test(text)) continue;

    out.push(text);
  }

  return out;
}

const perFileGrades: { file: string; grade: number; words: number }[] = [];
const allText: string[] = [];

for (const file of filesToCheck) {
  const source = readFileSync(file, "utf8");
  const strings = extractReadableStrings(source);
  const joined = strings.join(". ");
  const words = joined.match(/\b[a-zA-Z][a-zA-Z'-]*\b/g)?.length ?? 0;
  const grade = gradeFromText(joined);

  perFileGrades.push({ file, grade, words });
  if (joined) allText.push(joined);
}

const overallText = allText.join(". ");
const overallGrade = gradeFromText(overallText);

for (const item of perFileGrades) {
  if (item.words < 40) continue;
  console.log(`[readability] ${item.file.replace(root + "/", "")} -> grade ${item.grade.toFixed(2)} (${item.words} words)`);
}

console.log(`[readability] overall grade ${overallGrade.toFixed(2)}`);

if (overallGrade < MIN_OVERALL_GRADE || overallGrade > MAX_OVERALL_GRADE) {
  console.error(
    `[readability] FAIL: overall grade must stay between ${MIN_OVERALL_GRADE.toFixed(1)} and ${MAX_OVERALL_GRADE.toFixed(1)}.`
  );
  process.exit(1);
}

console.log(
  `[readability] OK: overall grade is within ${MIN_OVERALL_GRADE.toFixed(1)}-${MAX_OVERALL_GRADE.toFixed(1)} band.`
);