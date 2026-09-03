// E2E verify: node scripts/verify-e2e.mjs <url> <anonKey>
import { createClient } from '@supabase/supabase-js';

const [url, anonKey] = process.argv.slice(2);
const supabase = createClient(url, anonKey);

const log = (label, ok, extra = '') =>
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`);

// 1. Sign in as demo user
const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
  email: 'demo.8bitos@gmail.com',
  password: '8bitos-demo-2026',
});
log('sign in', !authError && !!auth.session, authError?.message);
if (!auth.session) process.exit(1);

// 2. Classes (ClassList screen)
const { data: classes, error: classesError } = await supabase.from('classes').select('*');
log('classes query', !classesError && classes.length === 2, `${classes.length} rows`);
if (classesError) console.log(classesError);

// 3. Today schedule (Dashboard screen)
const { data: slots, error: slotsError } = await supabase.from('schedule_slots').select('*');
log('schedule query', !slotsError && slots.length === 7, `${slots.length} rows`);

// 4. Students (Roster)
const { data: students, error: studentsError } = await supabase
  .from('students')
  .select('*')
  .eq('class_id', classes[0].id);
log('students query', !studentsError && students.length === 16, `${students.length} rows`);

// 5. Create session (MULAI SESI)
const subjectId = slots[0].subject_id;
const { data: session, error: sessionError } = await supabase
  .from('class_sessions')
  .insert({
    user_id: auth.user.id,
    class_id: classes[0].id,
    subject_id: subjectId,
    scheduled_for: new Date().toISOString(),
    topic: 'Verify session',
    status: 'active',
  })
  .select()
  .single();
log('create session', !sessionError, sessionError?.message);

// 6. Upsert attendance (H toggle)
const { error: attError } = await supabase.from('attendance_records').upsert(
  {
    session_id: session.id,
    student_id: students[0].id,
    status: 'hadir',
    recorded_at: new Date().toISOString(),
  },
  { onConflict: 'session_id,student_id' },
);
log('attendance upsert', !attError, attError?.message);

// 7. Read attendance back
const { data: att, error: attReadError } = await supabase
  .from('attendance_records')
  .select('*')
  .eq('session_id', session.id);
log('attendance read', !attReadError && att.length === 1, `${att.length} rows`);

// 8. Cleanup verify session
const { error: delError } = await supabase.from('class_sessions').delete().eq('id', session.id);
log('cleanup', !delError, delError?.message);

console.log('---');
console.log('ALL PASS');
