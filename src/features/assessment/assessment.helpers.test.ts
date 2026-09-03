import { describe, expect, it } from 'vitest';
import {
  attemptScore,
  gradeAnswer,
  isObjective,
  toPercent,
} from './assessment.helpers';

const q = (type: 'mc' | 'tf' | 'essay', answerKey: string | null, points = 1) =>
  ({ id: `q-${type}`, type, answer_key: answerKey, points }) as const;

describe('assessment.helpers', () => {
  it('grades MC exact match (case-insensitive)', () => {
    expect(gradeAnswer(q('mc', 'C'), 'c')).toEqual({ score: 1, isCorrect: true });
    expect(gradeAnswer(q('mc', 'C'), 'D')).toEqual({ score: 0, isCorrect: false });
  });

  it('grades TF true/false', () => {
    expect(gradeAnswer(q('tf', 'BENAR'), 'benar ').isCorrect).toBe(true);
    expect(gradeAnswer(q('tf', 'BENAR'), 'salah').isCorrect).toBe(false);
  });

  it('returns zero for null response or null key', () => {
    expect(gradeAnswer(q('mc', 'C'), null)).toEqual({ score: 0, isCorrect: false });
    expect(gradeAnswer(q('mc', null), 'C')).toEqual({ score: 0, isCorrect: false });
  });

  it('isObjective only mc/tf', () => {
    expect(isObjective({ type: 'mc' })).toBe(true);
    expect(isObjective({ type: 'tf' })).toBe(true);
    expect(isObjective({ type: 'essay' })).toBe(false);
    expect(isObjective({ type: 'mc_multi' })).toBe(false);
  });

  it('attemptScore sums objective only, essay excluded from total but in max', () => {
    const questions = [
      q('mc', 'A', 2),
      q('tf', 'BENAR', 3),
      q('essay', null, 5),
    ];
    const responses = { 'q-mc': 'A', 'q-tf': 'SALAH', 'q-essay': 'sebuah esai' };
    expect(attemptScore(questions, responses)).toEqual({ total: 2, max: 10 });
  });

  it('toPercent normalizes and handles zero max', () => {
    expect(toPercent(2, 10)).toBe(20);
    expect(toPercent(0, 0)).toBeNull();
  });
});
