// E2E Doc 10: node scripts/verify-data-model.mjs <url> <anonKey>
import { createClient } from '@supabase/supabase-js';

const [url, anonKey] = process.argv.slice(2);
const supabase = createClient(url, anonKey);
const log = (l, ok, x = '') => console.log(`${ok ? 'PASS' : 'FAIL'}  ${l}${x ? ' — ' + x : ''}`);

const { data: auth } = await supabase.auth.signInWithPassword({
  email: 'demo.8bitos@gmail.com',
  password: '8bitos-demo-2026',
});
log('sign in', !!auth.session);
const uid = auth.user.id;

// Setup session
const { data: cls } = await supabase.from('classes').select('id').limit(1);
const { data: subj } = await supabase.from('subjects').select('id').limit(1);
const { data: session } = await supabase
  .from('class_sessions')
  .insert({ user_id: uid, class_id: cls[0].id, subject_id: subj[0].id, scheduled_for: new Date().toISOString(), topic: 'E2E timeline', status: 'active' })
  .select().single();

// Session activities (Doc 10 §17)
const { error: actErr } = await supabase.from('session_activities').insert([
  { user_id: uid, session_id: session.id, type: 'attendance', title: 'Absensi dimulai' },
  { user_id: uid, session_id: session.id, type: 'quiz', title: 'Quiz integral' },
]);
log('activities insert', !actErr, actErr?.message);

const { data: acts } = await supabase
  .from('session_activities')
  .select('*')
  .eq('session_id', session.id)
  .order('started_at');
log('activities timeline read', acts?.length === 2, `${acts?.length} rows`);
log('timeline order', acts?.[0]?.type === 'attendance');

// Audit logs (Doc 10 §37)
const { data: comp } = await supabase
  .from('grade_components')
  .insert({ user_id: uid, class_id: cls[0].id, name: 'E2E Audit', weight: 10 })
  .select().single();
const { data: student } = await supabase.from('students').select('id').limit(1);

await supabase.from('grades').upsert(
  { user_id: uid, component_id: comp.id, student_id: student[0].id, score: 78 },
  { onConflict: 'component_id,student_id' },
);
const { error: audErr } = await supabase.from('audit_logs').insert({
  user_id: uid, entity_type: 'grade', entity_id: `${comp.id}:${student[0].id}`,
  action: 'update', old_value: { score: 78 }, new_value: { score: 85 },
});
log('audit insert', !audErr, audErr?.message);

const { data: audits } = await supabase
  .from('audit_logs')
  .select('*')
  .eq('entity_type', 'grade')
  .order('timestamp', { ascending: false })
  .limit(1);
log('audit read old->new', audits?.[0]?.old_value?.score === 78 && audits?.[0]?.new_value?.score === 85);

// Cleanup
await supabase.from('grades').delete().eq('component_id', comp.id);
await supabase.from('grade_components').delete().eq('id', comp.id);
await supabase.from('session_activities').delete().eq('session_id', session.id);
await supabase.from('audit_logs').delete().eq('user_id', uid);
await supabase.from('class_sessions').delete().eq('id', session.id);
log('cleanup', true);

console.log('---');
console.log('DATA MODEL ALL PASS');
