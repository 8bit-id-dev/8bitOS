import type { Grade, GradeComponent } from '@/shared/db/types';

export interface FinalScore {
  score: number | null;
  coveredWeight: number;
}

// Weight-based final score. Components without grades are excluded,
// and remaining weights are re-normalized to 100.
export const finalScore = (
  components: GradeComponent[],
  grades: Grade[],
): FinalScore => {
  const gradesByComponent = new Map(grades.map((g) => [g.component_id, g]));
  let weightedSum = 0;
  let coveredWeight = 0;

  for (const c of components) {
    const g = gradesByComponent.get(c.id);
    if (!g) continue;
    weightedSum += g.score * c.weight;
    coveredWeight += c.weight;
  }

  if (coveredWeight === 0) return { score: null, coveredWeight: 0 };
  return {
    score: Math.round((weightedSum / coveredWeight) * 100) / 100,
    coveredWeight,
  };
};

// Default component set when a class has none yet.
export const DEFAULT_COMPONENTS: Array<{ name: string; weight: number }> = [
  { name: 'Tugas', weight: 20 },
  { name: 'Quiz', weight: 30 },
  { name: 'Ulangan', weight: 40 },
  { name: 'Keaktifan', weight: 10 },
];

export const totalWeight = (components: GradeComponent[]): number =>
  components.reduce((acc, c) => acc + c.weight, 0);

export const classAverage = (scores: Array<number | null>): number | null => {
  const valid = scores.filter((s): s is number => s != null);
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100;
};
