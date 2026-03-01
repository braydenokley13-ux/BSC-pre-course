export type DifficultyLevel = 1 | 2 | 3 | 4;

export interface AdaptiveObjectiveSeed {
  objectiveId: string;
  termId: string;
  focus: string;
  misconceptionTags: [string, string, string];
  remediation: string;
  // When provided, these replace template-generated option text with actual content.
  // Provide both fields or neither; mixing one with template fallback creates obvious answer-giveaways.
  correctStatement?: string;
  misconceptionDescriptions?: [string, string, string];
}

export interface AdaptiveConceptSeed {
  conceptId: string;
  source: string;
  coreObjectiveIds: [string, string, string];
  objectives: AdaptiveObjectiveSeed[];
}

export interface AdaptiveQuestionSeed {
  id: string;
  conceptId: string;
  objectiveId: string;
  difficultyLevel: DifficultyLevel;
  stem: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  misconceptionTags: [string, string, string, string];
  explanationCorrect: string;
  explanationRemediation: string;
  readingLevel: number;
  active: boolean;
  version: number;
  source: string;
  readingWaived?: boolean;
}
