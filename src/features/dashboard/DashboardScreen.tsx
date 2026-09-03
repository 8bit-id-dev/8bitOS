import { useTodaySchedule } from './dashboard.queries';
import { PixelCard } from '@/shared/components/PixelCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { sortSlotsByStart, findNextSlot } from './dashboard.helpers';
import { formatJakartaTime } from '@/shared/lib/time';
import { Link } from 'react-router-dom';
import { PixelButton } from '@/shared/components/PixelButton';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { StatusPill } from '@/shared/components/StatusPill';
import { formatJakartaDate } from '@/shared/lib/time';
import { useEffect, useState } from 'react';
import { count } from '@/shared/db/outbox';
import { flushOutbox } from '@/shared/db/flushOutbox';

export function DashboardScreen() {
  const { data, isLoading } = useTodaySchedule();
  const online = useOnlineStatus();
  const [pending, setPending] = useState<number>(0);
  const [nowIso, setNowIso] = useState<string>(new Date().toISOString());

  useEffect(() => {
    void count().then(setPending);
    const t = setInterval(() => setNowIso(new Date().toISOString()), 30_000);
    return () => clearInterval(t);
  }, []);

  const slots = sortSlotsByStart(data ?? []);
  const next = findNextSlot(slots, { hhmm: formatJakartaTime(nowIso) });

  const handleFlush = async () => {
    await flushOutbox();
    setPending(await count());
  };

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="font-pixel text-2xl">DASHBOARD</h1>
        <span className="text-xs text-gray-300 font-pixel">{formatJakartaDate(nowIso)}</span>
      </header>

      <div className="flex gap-2 items-center">
        <StatusPill tone={online ? 'on' : 'off'} label={online ? 'ONLINE' : 'OFFLINE'} />
        <span className="text-xs text-gray-300 font-pixel">DEMO TEACHER</span>
      </div>

      {pending > 0 && (
        <div className="border-2 border-fg p-3 bg-bg flex items-center justify-between gap-3">
          <span className="font-pixel text-xs">
            PULIHKAN SINDIKASI? · {pending} ITEM BELUM TERKIRIM
          </span>
          <PixelButton onClick={handleFlush}>RETRY</PixelButton>
        </div>
      )}

      <PixelCard>
        <h2 className="font-pixel text-sm mb-3">NEXT CLASS</h2>
        {next ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-pixel text-2xl">{next.subject.name.toUpperCase()}</p>
              <p className="text-gray-300 text-sm">{next.classRow.name}</p>
              <p className="text-gray-500 text-xs">
                {next.slot.start_time.slice(0, 5)} · {next.slot.room || '—'}
              </p>
            </div>
            <Link to={`/classroom/${next.classRow.id}`}>
              <PixelButton>MULAI KBM</PixelButton>
            </Link>
          </div>
        ) : (
          <p className="text-gray-300 text-xs font-pixel">NO UPCOMING CLASS</p>
        )}
      </PixelCard>

      <PixelCard>
        <h2 className="font-pixel text-sm mb-3">JADWAL HARI INI</h2>
        {isLoading && <p className="text-gray-300 text-xs">LOADING…</p>}
        {!isLoading && slots.length === 0 && (
          <EmptyState
            title="NO SCHEDULE TODAY"
            hint="Add schedule slots in Classroom to see today's classes here."
          />
        )}
        <ul className="flex flex-col gap-2">
          {slots.map((row) => (
            <li
              key={row.slot.id}
              className="flex items-center gap-3 border-2 border-fg p-2 text-sm"
            >
              <span className="font-pixel">{row.slot.start_time.slice(0, 5)}</span>
              <span className="flex-1">{row.subject.name}</span>
              <span className="text-gray-300">{row.classRow.name}</span>
              <span className="text-gray-500 text-xs">{row.slot.room || '—'}</span>
            </li>
          ))}
        </ul>
      </PixelCard>

      <div>
        <h2 className="font-pixel text-sm mb-2">QUICK ACTIONS</h2>
        <div className="flex gap-2 flex-wrap">
          <Link to="/classroom">
            <PixelButton variant="secondary">CLASSROOM</PixelButton>
          </Link>
          <PixelButton variant="secondary" disabled>
            MATERI <span className="ml-2 text-[10px]">[ SOON ]</span>
          </PixelButton>
          <PixelButton variant="secondary" disabled>
            QUIZ <span className="ml-2 text-[10px]">[ SOON ]</span>
          </PixelButton>
          <PixelButton variant="secondary" disabled>
            NILAI <span className="ml-2 text-[10px]">[ SOON ]</span>
          </PixelButton>
        </div>
      </div>
    </main>
  );
}
