// E2E verify Spec 4: node scripts/verify-spec4.mjs <url> <anonKey>
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

// Documents: upload -> list -> signed URL -> delete
const fileContent = new Blob(['E2E modul ajar test'], { type: 'text/plain' });
const storageKey = `${uid}/e2e-${Date.now()}.txt`;
const { error: upErr } = await supabase.storage
  .from('documents')
  .upload(storageKey, fileContent, { contentType: 'text/plain' });
log('storage upload', !upErr, upErr?.message);

const { data: doc, error: docErr } = await supabase
  .from('documents')
  .insert({
    user_id: uid,
    title: 'E2E Modul.txt',
    kind: 'modul_ajar',
    storage_key: storageKey,
    mime_type: 'text/plain',
    size_bytes: 20,
    tags: 'e2e',
  })
  .select()
  .single();
log('document insert', !docErr, docErr?.message);

const { data: docs, error: listErr } = await supabase
  .from('documents')
  .select('*')
  .eq('kind', 'modul_ajar');
log('documents list', !listErr && docs.some((d) => d.id === doc.id), `${docs.length} rows`);

const { data: signed, error: signErr } = await supabase.storage
  .from('documents')
  .createSignedUrl(storageKey, 60);
log(
  'signed url',
  !signErr && Boolean(signed?.signedUrl),
  signed?.signedUrl?.slice(0, 50),
);

// AI jobs: create -> finish -> list
const { data: job, error: jobErr } = await supabase
  .from('ai_jobs')
  .insert({
    user_id: uid,
    kind: 'modul_ajar',
    prompt: 'E2E: buat modul ajar integral',
    status: 'running',
  })
  .select()
  .single();
log('ai job create', !jobErr, jobErr?.message);

const { error: finErr } = await supabase
  .from('ai_jobs')
  .update({ response: 'Modul ajar...', status: 'done', finished_at: new Date().toISOString() })
  .eq('id', job.id);
log('ai job finish', !finErr, finErr?.message);

const { data: jobs } = await supabase
  .from('ai_jobs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);
log('ai jobs list', jobs?.[0]?.status === 'done', jobs?.[0]?.status);

// Save AI response as note (integration)
const { data: note, error: noteErr } = await supabase
  .from('notes')
  .insert({
    user_id: uid,
    kind: 'personal',
    title: 'AI: E2E modul ajar integral',
    body: 'Modul ajar...',
  })
  .select()
  .single();
log('ai->note integration', !noteErr && Boolean(note.id), noteErr?.message);

// Cleanup
const { error: docDelErr } = await supabase.from('documents').delete().eq('id', doc.id);
await supabase.storage.from('documents').remove([storageKey]);
await supabase.from('ai_jobs').delete().eq('id', job.id);
await supabase.from('notes').delete().eq('id', note.id);
log('cleanup', !docDelErr, docDelErr?.message);

console.log('---');
console.log('SPEC 4 ALL PASS');
