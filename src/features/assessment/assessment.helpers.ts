import type { Question, QuestionType } from '@/shared/db/types';

// Objective types auto-graded by exact match with answer_key.
export const OBJECTIVE_TYPES: QuestionType[] = ['mc', 'tf'];

export const isObjective = (q: Pick<Question, 'type'>): boolean =>
  OBJECTIVE_TYPES.includes(q.type);

// Grade one answer against its question. Returns score + is_correct.
export const gradeAnswer = (
  q: Pick<Question, 'type' | 'answer_key' | 'points'>,
  response: string | null,
): { score: number; isCorrect: boolean } => {
  if (response == null || q.answer_key == null) return { score: 0, isCorrect: false };
  const norm = (s: string) => s.trim().toUpperCase();
  const isCorrect = norm(response) === norm(q.answer_key);
  return { score: isCorrect ? q.points : 0, isCorrect };
};

export const attemptScore = (
  questions: Array<Pick<Question, 'id' | 'type' | 'answer_key' | 'points'>>,
  responses: Record<string, string | null>,
): { total: number; max: number } => {
  let total = 0;
  let max = 0;
  for (const q of questions) {
    max += q.points;
    if (!isObjective(q)) continue;
    total += gradeAnswer(q, responses[q.id] ?? null).score;
  }
  return { total, max };
};

// Normalize to 0-100 scale when max > 0.
export const toPercent = (score: number, max: number): number | null =>
  max > 0 ? Math.round((score / max) * 100) : null;

export const TYPE_LABEL: Record<QuestionType, string> = {
  mc: 'PG',
  mc_multi: 'PG KOMPLEKS',
  tf: 'B/S',
  short: 'ISIAN',
  essay: 'ESAI',
};

export const TYPE_OPTIONS: Array<{ value: QuestionType; label: string }> = (
  Object.keys(TYPE_LABEL) as QuestionType[]
).map((t) => ({ value: t, label: TYPE_LABEL[t] }));
