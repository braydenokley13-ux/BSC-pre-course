export {};
import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

const glossaryFile = join(root, "lib/concepts.ts");
const referenceFiles = [
  join(root, "lib/missions.ts"),
  join(root, "lib/concepts.ts"),
  join(root, "lib/checks.ts"),
];

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function extractGlossaryIds(source: string): string[] {
  const ids: string[] = [];
  const regex = /id:\s*"([a-z0-9-]+)"\s*,\s*term:/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

function extractTermIds(source: string): string[] {
  const ids: string[] = [];
  const blockRegex = /termIds:\s*\[([\s\S]*?)\]/gm;
  let block: RegExpExecArray | null;

  while ((block = blockRegex.exec(source)) !== null) {
    const idRegex = /"([a-z0-9-]+)"/g;
    let idMatch: RegExpExecArray | null;
    while ((idMatch = idRegex.exec(block[1])) !== null) {
      ids.push(idMatch[1]);
    }
  }

  return ids;
}

const glossarySource = readFileSync(glossaryFile, "utf8");
const glossaryIds = extractGlossaryIds(glossarySource);
const glossaryUnique = unique(glossaryIds);

const duplicateGlossaryIds = glossaryIds.filter((id, idx) => glossaryIds.indexOf(id) !== idx);

const referencedIds = unique(
  referenceFiles.flatMap((file) => extractTermIds(readFileSync(file, "utf8")))
);

const missingInGlossary = referencedIds.filter((id) => !glossaryUnique.includes(id));
const unusedGlossaryIds = glossaryUnique.filter((id) => !referencedIds.includes(id));

if (duplicateGlossaryIds.length > 0) {
  console.error("[glossary] Duplicate glossary ids found:");
  for (const id of unique(duplicateGlossaryIds)) {
    console.error(` - ${id}`);
  }
  process.exit(1);
}

if (missingInGlossary.length > 0) {
  console.error("[glossary] Referenced termIds missing from glossary:");
  for (const id of missingInGlossary) {
    console.error(` - ${id}`);
  }
  process.exit(1);
}

if (unusedGlossaryIds.length > 0) {
  console.error("[glossary] Glossary ids not used by content termIds:");
  for (const id of unusedGlossaryIds) {
    console.error(` - ${id}`);
  }
  process.exit(1);
}

console.log(`[glossary] OK: ${glossaryUnique.length} terms, full reference coverage.`);