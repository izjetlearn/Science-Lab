export type ExperimentCategory = 'Chemistry' | 'Geology' | 'Earth Science' | 'Physics' | 'Genetics';

export interface ExperimentParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
}

export interface PresetConfig {
  name: string;
  description: string;
  params: Record<string, number>;
}

export interface QuizQuestion {
  q: string;
  a: string[];
  c: number; // 0-based index of correct answer
  e: string; // detailed explanation
}

export interface ExperimentDef {
  id: string;
  title: string;
  category: ExperimentCategory;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  parameters: ExperimentParamDef[];
  presets: PresetConfig[];
  principles: string;
  equation?: string;
  formulaLabel?: string;
  safetyNote?: string;
}

export interface LabLogEntry {
  id: string;
  experimentId: string;
  experimentTitle: string;
  timestamp: number;
  params: Record<string, number>;
  metrics: Record<string, string | number>;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'experiments' | 'quiz' | 'mastery';
  threshold: number;
  unlocked: boolean;
}
