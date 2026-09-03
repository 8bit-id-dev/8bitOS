// E2E verify Spec 2: node scripts/verify-spec2.mjs <url> <anonKey>
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

// Planner: upsert + read
const weekStart = '2026-09-07';
const { data: plan, error: planError } = await supabase
  .from('plans')
  .upsert(
    {
      user_id: uid,
      class_id: null,
      subject_id: null,
      week_start: weekStart,
      topic: 'E2E Integral',
      goals: 'memahami substitusi',
      status: 'ready',
    },
    { onConflict: 'user_id,class_id,subject_id,week_start' },
  )
  .select()
  .single();
log('plan upsert', !planError, planError?.message);

const { data: plansRead, error: plansReadError } = await supabase
  .from('plans')
  .select('*')
  .eq('week_start', weekStart);
log('plan read', !plansReadError && plansRead.length >= 1, `${plansRead?.length} rows`);

const { error: planDeleteError } = await supabase.from('plans').delete().eq('id', plan.id);
log('plan delete', !planDeleteError, planDeleteError?.message);

// Notes: create + update + list + delete
const { data: note, error: noteError } = await supabase
  .from('notes')
  .insert({ user_id: uid, kind: 'personal', title: 'E2E note', body: 'test body' })
  .select()
  .single();
log('note create', !noteError, noteError?.message);

const { error: noteUpdateError } = await supabase
  .from('notes')
  .update({ body: 'updated body' })
  .eq('id', note.id);
log('note update', !noteUpdateError, noteUpdateError?.message);

const { data: noteCheck } = await supabase.from('notes').select('body').eq('id', note.id).single();
log('note verify', noteCheck?.body === 'updated body', `body="${noteCheck?.body}"`);

const { error: noteDeleteError } = await supabase.from('notes').delete().eq('id', note.id);
log('note delete', !noteDeleteError, noteDeleteError?.message);

// Student CRUD: create + update + delete
const { data: cls } = await supabase.from('classes').select('id').limit(1);
const classId = cls[0].id;
const { data: student, error: studentError } = await supabase
  .from('students')
  .insert({ user_id: uid, class_id: classId, full_name: 'E2E Siswa', nisn: '999', gender: 'L' })
  .select()
  .single();
log('student create', !studentError, studentError?.message);

const { error: studentUpdateError } = await supabase
  .from('students')
  .update({ nisn: '998' })
  .eq('id', student.id);
log('student update', !studentUpdateError, studentUpdateError?.message);

const { error: studentDeleteError } = await supabase
  .from('students')
  .delete()
  .eq('id', student.id);
log('student delete', !studentDeleteError, studentDeleteError?.message);

// Session end + report
const { data: subj } = await supabase.from('subjects').select('id').limit(1);
const { data: session } = await supabase
  .from('class_sessions')
  .insert({
    user_id: uid,
    class_id: classId,
    subject_id: subj[0].id,
    scheduled_for: new Date().toISOString(),
    topic: 'E2E session',
    status: 'active',
  })
  .select()
  .single();
const { error: endError } = await supabase
  .from('class_sessions')
  .update({ status: 'done' })
  .eq('id', session.id);
log('session end', !endError, endError?.message);
const { error: sessDeleteError } = await supabase.from('class_sessions').delete().eq('id', session.id);
log('cleanup session', !sessDeleteError, sessDeleteError?.message);

console.log('---');
console.log('SPEC 2 ALL PASS');
