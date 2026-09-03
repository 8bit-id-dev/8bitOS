import { useTodaySchedule } from './dashboard.queries';
import { PixelCard } from '@/shared/components/PixelCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { sortSlotsByStart, findNextSlot } from './dashboard.helpers';
import { formatJakartaTime, formatJakartaDate } from '@/shared/lib/time';
import { Link } from 'react-router-dom';
import { PixelButton } from '@/shared/components/PixelButton';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { StatusPill } from '@/shared/components/StatusPill';
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
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-mono font-bold text-lg text-accent text-glow label-term">
          ~/dashboard
        </h1>
        <span className="font-mono text-xs text-dim">
          {formatJakartaDate(nowIso)} · {formatJakartaTime(nowIso)}
        </span>
      </header>

      <div className="flex gap-2 items-center">
        <StatusPill tone={online ? 'on' : 'off'} label={online ? 'ONLINE' : 'OFFLINE'} />
        {pending > 0 && (
          <button
            type="button"
            onClick={() => void handleFlush()}
            className="font-mono text-xs text-accent border border-accent-dim px-2 py-0.5 hover:shadow-glow"
          >
            SYNC {pending} PENDING → RETRY
          </button>
        )}
      </div>

      <PixelCard title="next_class">
        {next ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono font-bold text-md text-accent text-glow">
                {next.subject.name.toUpperCase()}
              </p>
              <p className="font-mono text-xs text-dim">
                {next.classRow.name} · {next.slot.start_time.slice(0, 5)} · {next.slot.room || '—'}
              </p>
            </div>
            <Link to={`/classroom/${next.classRow.id}`}>
              <PixelButton>MULAI KBM →</PixelButton>
            </Link>
          </div>
        ) : (
          <p className="font-mono text-xs text-dim">no upcoming class</p>
        )}
      </PixelCard>

      <PixelCard title="jadwal_hari_ini">
        {isLoading && <p className="font-mono text-xs text-dim">loading…</p>}
        {!isLoading && slots.length === 0 && (
          <EmptyState
            title="NO SCHEDULE TODAY"
            hint="Add schedule slots in Classroom to see today's classes here."
          />
        )}
        <ul className="flex flex-col">
          {slots.map((row) => (
            <li
              key={row.slot.id}
              className="flex items-center gap-3 border-b border-line last:border-b-0 py-1.5 font-mono text-xs"
            >
              <span className="text-accent w-12">{row.slot.start_time.slice(0, 5)}</span>
              <span className="flex-1 text-fg">{row.subject.name}</span>
              <span className="text-dim">{row.classRow.name}</span>
              <span className="text-dimmer w-14 text-right">{row.slot.room || '—'}</span>
            </li>
          ))}
        </ul>
      </PixelCard>

      <div>
        <p className="font-mono text-micro-label label-term text-dim mb-1.5">quick_actions</p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/classroom">
            <PixelButton variant="secondary">CLASSROOM</PixelButton>
          </Link>
          <Link to="/planner">
            <PixelButton variant="secondary">PLANNER</PixelButton>
          </Link>
          <Link to="/notes">
            <PixelButton variant="secondary">NOTES</PixelButton>
          </Link>
          <PixelButton variant="ghost" disabled>
            quiz [soon]
          </PixelButton>
          <PixelButton variant="ghost" disabled>
            nilai [soon]
          </PixelButton>
        </div>
      </div>
    </main>
  );
}
