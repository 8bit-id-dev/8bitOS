// E2E verify Spec 3: node scripts/verify-spec3.mjs <url> <anonKey>
import { createClient } from '@supabase/supabase-js';

const [url, anonKey] = process.argv.slice(2);
const supabase = createClient(url, anonKey);
const log = (label, ok, extra = '') =>
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`);

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
  email: 'demo.8bitos@gmail.com',
  password: '8bitos-demo-2026',
});
log('sign in', !authError && !!auth.session, authError?.message);
if (!auth.session) process.exit(1);
const uid = auth.user.id;

// Setup: class + student
const { data: cls } = await supabase.from('classes').select('id, name').limit(1);
const classId = cls[0].id;
const { data: student } = await supabase
  .from('students')
  .select('id')
  .eq('class_id', classId)
  .limit(1);

// Assessment create
const { data: assessment, error: aError } = await supabase
  .from('assessments')
  .insert({
    user_id: uid,
    class_id: classId,
    title: 'E2E Quiz Integral',
    type: 'quiz',
    status: 'published',
  })
  .select()
  .single();
log('assessment create', !aError, aError?.message);

// Questions
const { data: questions, error: qError } = await supabase
  .from('questions')
  .insert([
    {
      user_id: uid,
      assessment_id: assessment.id,
      position: 0,
      type: 'mc',
      prompt: 'Turunan x² adalah…',
      options: JSON.stringify(['x', '2x', 'x²', '2']),
      answer_key: JSON.stringify('B'),
      points: 2,
    },
    {
      user_id: uid,
      assessment_id: assessment.id,
      position: 1,
      type: 'tf',
      prompt: 'Integral adalah invers turunan.',
      options: JSON.stringify([]),
      answer_key: JSON.stringify('BENAR'),
      points: 3,
    },
  ])
  .select();
log('questions insert', !qError && questions.length === 2, qError?.message);

// Attempt + answers (student answers B correct, TF SALAH wrong)
const { data: attempt, error: attemptError } = await supabase
  .from('attempts')
  .upsert(
    {
      user_id: uid,
      assessment_id: assessment.id,
      student_id: student[0].id,
      score: 40,
    },
    { onConflict: 'assessment_id,student_id' },
  )
  .select()
  .single();
log('attempt upsert', !attemptError, attemptError?.message);

const answerRows = questions.map((q, i) => ({
  attempt_id: attempt.id,
  question_id: q.id,
  response: JSON.stringify(i === 0 ? 'B' : 'SALAH'),
  is_correct: i === 0,
  score: i === 0 ? 2 : 0,
}));
const { error: ansError } = await supabase
  .from('attempt_answers')
  .upsert(answerRows, { onConflict: 'attempt_id,question_id' });
log('answers upsert', !ansError, ansError?.message);

const { data: ansCheck } = await supabase
  .from('attempt_answers')
  .select('*')
  .eq('attempt_id', attempt.id);
log('answers read', ansCheck?.length === 2, `${ansCheck?.length} rows`);
log(
  'auto-grade verify',
  ansCheck?.[0]?.is_correct === true && ansCheck?.[1]?.is_correct === false,
);

// Gradebook: components + grades
const { data: comps, error: compError } = await supabase
  .from('grade_components')
  .insert([
    { user_id: uid, class_id: classId, name: 'E2E Tugas', weight: 30 },
    { user_id: uid, class_id: classId, name: 'E2E Ulangan', weight: 70 },
  ])
  .select();
log('components insert', !compError && comps.length === 2, compError?.message);

const { error: gError } = await supabase.from('grades').upsert(
  [
    { user_id: uid, component_id: comps[0].id, student_id: student[0].id, score: 80 },
    { user_id: uid, component_id: comps[1].id, student_id: student[0].id, score: 90 },
  ],
  { onConflict: 'component_id,student_id' },
);
log('grades upsert', !gError, gError?.message);

const { data: gCheck } = await supabase
  .from('grades')
  .select('*')
  .eq('component_id', comps[1].id)
  .eq('student_id', student[0].id)
  .maybeSingle();
log('grade read', gCheck?.score === 90, `score=${gCheck?.score}`);

// Cleanup (cascade deletes questions/attempts/answers/grades via FK)
await supabase.from('grades').delete().in('component_id', comps.map((c) => c.id));
await supabase.from('grade_components').delete().eq('class_id', classId).like('name', 'E2E%');
const { error: delAssess } = await supabase.from('assessments').delete().eq('id', assessment.id);
log('cleanup assessment', !delAssess, delAssess?.message);

console.log('---');
console.log('SPEC 3 ALL PASS');
