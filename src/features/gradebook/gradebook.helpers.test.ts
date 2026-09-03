import { describe, expect, it } from 'vitest';
import { classAverage, finalScore, totalWeight } from './gradebook.helpers';
import type { Grade, GradeComponent } from '@/shared/db/types';

const comp = (id: string, name: string, weight: number): GradeComponent =>
  ({ id, user_id: 'u', class_id: 'c', name, weight, created_at: '' }) as GradeComponent;

const grade = (componentId: string, studentId: string, score: number): Grade =>
  ({ id: `g-${componentId}-${studentId}`, user_id: 'u', component_id: componentId, student_id: studentId, score, note: '', recorded_at: '' }) as Grade;

describe('gradebook.helpers', () => {
  it('finalScore computes weighted average of graded components', () => {
    const components = [comp('t', 'Tugas', 20), comp('q', 'Quiz', 30), comp('u', 'Ulangan', 40), comp('k', 'Keaktifan', 10)];
    const grades = [
      grade('t', 's1', 80),
      grade('q', 's1', 90),
      grade('u', 's1', 85),
      grade('k', 's1', 100),
    ];
    const result = finalScore(components, grades);
    // (80*20 + 90*30 + 85*40 + 100*10) / 100 = 87
    expect(result.score).toBe(87);
    expect(result.coveredWeight).toBe(100);
  });

  it('finalScore re-normalizes when some components ungraded', () => {
    const components = [comp('t', 'Tugas', 20), comp('u', 'Ulangan', 40)];
    const grades = [grade('t', 's1', 100)];
    // only Tugas graded: 100 * 20 / 20 = 100
    expect(finalScore(components, grades)).toEqual({ score: 100, coveredWeight: 20 });
  });

  it('finalScore returns null when nothing graded', () => {
    expect(finalScore([comp('t', 'Tugas', 20)], [])).toEqual({ score: null, coveredWeight: 0 });
  });

  it('totalWeight sums component weights', () => {
    expect(totalWeight([comp('a', 'A', 20), comp('b', 'B', 30.5)])).toBe(50.5);
  });

  it('classAverage ignores nulls and rounds', () => {
    expect(classAverage([80, 90, null, 70])).toBe(80);
    expect(classAverage([])).toBeNull();
    expect(classAverage([null, null])).toBeNull();
  });
});
