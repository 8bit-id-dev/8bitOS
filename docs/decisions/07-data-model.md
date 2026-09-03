# Decision: Spec 1 data model (InsForge tables)

**Date:** 2026-09-03
**Status:** DEFAULT — user can override column names

All tables in `public` schema, RLS-enabled, owned by `auth.uid()`.

## Tables

### `subjects` (used by future specs; minimal seed in Spec 1)

```
id uuid pk
user_id uuid
name text
color_token text
created_at timestamptz
```

### `classes`

```
id uuid pk
user_id uuid
name text                  -- e.g. "XI IPA 1"
grade_level int            -- 10/11/12
homeroom text              -- wali kelas
academic_year text         -- "2026/2027"
created_at timestamptz
```

### `class_subjects` (m:n, future use)

```
id uuid pk
class_id uuid fk
subject_id uuid fk
created_at timestamptz
unique(class_id, subject_id)
```

### `students`

```
id uuid pk
user_id uuid
class_id uuid fk
full_name text
nisn text
gender text check in ('L','P')
created_at timestamptz
```

### `schedule_slots` (recurring weekly)

```
id uuid pk
user_id uuid
class_id uuid fk
subject_id uuid fk
day_of_week smallint 0-6
start_time time
end_time time
room text
effective_from date
effective_to date null
created_at timestamptz
```

### `class_sessions` (one per KBM meeting)

```
id uuid pk
user_id uuid
class_id uuid fk
subject_id uuid fk
scheduled_for timestamptz
duration_minutes int
topic text
status text check in ('planned','active','done')
created_at timestamptz
```

### `attendance_records`

```
id uuid pk
session_id uuid fk
student_id uuid fk
status text check in ('hadir','izin','sakit','alpha')
note text
recorded_at timestamptz
unique(session_id, student_id)
```

## Indexes

- `students(class_id)`
- `schedule_slots(user_id, day_of_week)`
- `class_sessions(user_id, scheduled_for)`
- `attendance_records(session_id)`

## RLS

- `public.is_owner(row_user_id uuid) returns boolean` — SECURITY DEFINER, stable
- Every table: `select` policy + `write` policy using `is_owner(user_id)`
- `attendance_records` policies join through `class_sessions` to check ownership
