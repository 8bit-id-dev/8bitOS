// Seed demo data for 8bitOS Spec 1.
// Usage: node scripts/seed-demo.mjs <SUPABASE_URL> <SUPABASE_ANON_KEY>
// Requires: schema.sql already applied, email confirmation disabled in Supabase Auth.

import { createClient } from '@supabase/supabase-js';

const DEMO_EMAIL = 'demo.8bitos@gmail.com';
const DEMO_PASSWORD = '8bitos-demo-2026';

const url = process.argv[2];
const anonKey = process.argv[3];

if (!url || !anonKey) {
  console.error('Usage: node scripts/seed-demo.mjs <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const ensureDemoUser = async () => {
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (!signInError && signIn.session) {
    console.log('signed in existing demo user');
    return;
  }

  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (signUpError) {
    console.error('signUp failed:', signUpError.message);
    process.exit(1);
  }
  if (!signUp.session) {
    console.error(
      'signUp returned no session — email confirmation is likely ON. ' +
        'Disable it: Dashboard → Authentication → Providers → Email → untick "Confirm email", then re-run.',
    );
    process.exit(1);
  }
  console.log('created demo user:', signUp.user?.id);
};

const seed = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error('no authenticated user');
    process.exit(1);
  }
  const uid = user.id;

  const { data: existing } = await supabase.from('classes').select('id').eq('user_id', uid).limit(1);
  if (existing && existing.length > 0) {
    console.log('demo data already seeded for user', uid, '— nothing to do');
    return;
  }

  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .insert([
      { user_id: uid, name: 'Matematika', color_token: 'fg' },
      { user_id: uid, name: 'Fisika', color_token: 'fg' },
      { user_id: uid, name: 'Biologi', color_token: 'fg' },
    ])
    .select('id, name');
  if (subjectsError) {
    console.error('subjects insert failed:', subjectsError.message);
    process.exit(1);
  }
  const subj = Object.fromEntries(subjects.map((s) => [s.name, s.id]));
  console.log('subjects ok');

  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .insert([
      { user_id: uid, name: 'XI IPA 1', grade_level: 11, homeroom: 'Bu Sari', academic_year: '2026/2027' },
      { user_id: uid, name: 'XI IPA 2', grade_level: 11, homeroom: 'Pak Budi', academic_year: '2026/2027' },
    ])
    .select('id, name');
  if (classesError) {
    console.error('classes insert failed:', classesError.message);
    process.exit(1);
  }
  const cls = Object.fromEntries(classes.map((c) => [c.name, c.id]));
  console.log('classes ok');

  const { error: linksError } = await supabase.from('class_subjects').insert([
    { user_id: uid, class_id: cls['XI IPA 1'], subject_id: subj['Matematika'] },
    { user_id: uid, class_id: cls['XI IPA 1'], subject_id: subj['Fisika'] },
    { user_id: uid, class_id: cls['XI IPA 1'], subject_id: subj['Biologi'] },
    { user_id: uid, class_id: cls['XI IPA 2'], subject_id: subj['Matematika'] },
    { user_id: uid, class_id: cls['XI IPA 2'], subject_id: subj['Fisika'] },
  ]);
  if (linksError) {
    console.error('class_subjects insert failed:', linksError.message);
    process.exit(1);
  }
  console.log('class_subjects ok');

  const studentNames = [
    'Ahmad Fauzi', 'Budi Santoso', 'Citra Lestari', 'Deni Kurniawan', 'Eka Putri',
    'Fajar Ramadhan', 'Gita Wijaya', 'Hendra Saputra', 'Indah Permatasari', 'Joko Susilo',
    'Kirana Ayu', 'Lukman Hakim', 'Maya Sari', 'Nanda Pratama', 'Oki Firmansyah',
    'Putri Andini', 'Rizky Aditya', 'Sinta Bella', 'Tegar Bayu', 'Umi Kalsum',
  ];
  const studentsXi1 = studentNames.slice(0, 16).map((n, i) => ({
    user_id: uid,
    class_id: cls['XI IPA 1'],
    full_name: n,
    nisn: `00${11 + i}`,
    gender: i % 2 === 0 ? 'L' : 'P',
  }));
  const studentsXi2 = studentNames.slice(16).map((n, i) => ({
    user_id: uid,
    class_id: cls['XI IPA 2'],
    full_name: n,
    nisn: `00${31 + i}`,
    gender: i % 2 === 0 ? 'L' : 'P',
  }));
  const { error: studentsError } = await supabase
    .from('students')
    .insert([...studentsXi1, ...studentsXi2]);
  if (studentsError) {
    console.error('students insert failed:', studentsError.message);
    process.exit(1);
  }
  console.log('students ok (20)');

  // day_of_week: 1=Sunday..7=Saturday (Postgres convention). Today-driven demo:
  // schedule every day 1-5 so the dashboard always shows slots.
  const slot = (classId, subjectId, dow, start, end, room) => ({
    user_id: uid,
    class_id: classId,
    subject_id: subjectId,
    day_of_week: dow,
    start_time: start,
    end_time: end,
    room,
  });
  const { error: slotsError } = await supabase.from('schedule_slots').insert([
    slot(cls['XI IPA 1'], subj['Matematika'], 2, '07:00', '08:30', 'R.12'),
    slot(cls['XI IPA 1'], subj['Fisika'], 2, '09:00', '10:30', 'R.12'),
    slot(cls['XI IPA 1'], subj['Biologi'], 3, '07:00', '08:30', 'R.12'),
    slot(cls['XI IPA 1'], subj['Matematika'], 4, '10:00', '11:30', 'R.12'),
    slot(cls['XI IPA 2'], subj['Matematika'], 2, '10:30', '12:00', 'R.14'),
    slot(cls['XI IPA 2'], subj['Fisika'], 3, '09:00', '10:30', 'R.14'),
    slot(cls['XI IPA 2'], subj['Matematika'], 5, '07:00', '08:30', 'R.14'),
  ]);
  if (slotsError) {
    console.error('schedule_slots insert failed:', slotsError.message);
    process.exit(1);
  }
  console.log('schedule_slots ok (7)');

  console.log('SEED COMPLETE — user:', uid);
};

try {
  await ensureDemoUser();
  await seed();
} catch (err) {
  console.error('unexpected error:', err);
  process.exit(1);
}
