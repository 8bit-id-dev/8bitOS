import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/db/supabase';
import type { ClassRow, Subject } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { todayInJakarta } from '@/shared/lib/time';
import type { JoinedSlot } from './dashboard.helpers';

interface ClassSubjectRow {
  id: string;
  class_id: string;
  subject_id: string;
  class: ClassRow | null;
  subject: Subject | null;
}

interface ScheduleRowRaw {
  id: string;
  user_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

const fetchTodaySchedule = async (userId: string): Promise<JoinedSlot[]> => {
  const { dayOfWeek: dowIso } = todayInJakarta(new Date());
  // DB uses 1=Sunday..7=Saturday (Postgres DOW convention).
  // `todayInJakarta` returns 0=Sun..6=Sat. Convert: add 1 so 0->1, 1->2, ... 6->7.
  const dow = dowIso + 1;

  const { data: slots, error: slotsError } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('day_of_week', dow)
    .eq('user_id', userId);

  if (slotsError) throw slotsError;
  const slotRows = (slots ?? []) as unknown as ScheduleRowRaw[];
  if (slotRows.length === 0) return [];

  const classIds = Array.from(new Set(slotRows.map((s) => s.class_id)));
  const subjectIds = Array.from(new Set(slotRows.map((s) => s.subject_id)));

  const { data: links, error: linksError } = await supabase
    .from('class_subjects')
    .select('id, class_id, subject_id, class:classes(id,name), subject:subjects(id,name)')
    .in('class_id', classIds)
    .in('subject_id', subjectIds);

  if (linksError) throw linksError;
  const linkRows = (links ?? []) as unknown as ClassSubjectRow[];

  const byPair = new Map<string, ClassSubjectRow>();
  for (const l of linkRows) {
    byPair.set(`${l.class_id}::${l.subject_id}`, l);
  }

  return slotRows.flatMap((slot): JoinedSlot[] => {
    const link = byPair.get(`${slot.class_id}::${slot.subject_id}`);
    if (!link?.class || !link.subject) return [];
    return [{ slot, classRow: link.class, subject: link.subject }];
  });
};

export const useTodaySchedule = () => {
  const { user } = useSession();
  return useQuery({
    queryKey: ['today-schedule', user?.id ?? 'anon'],
    queryFn: () => fetchTodaySchedule(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });
};
