import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTodaySchedule } from '@/features/dashboard/dashboard.queries';
import { sortSlotsByStart, findNextSlot } from '@/features/dashboard/dashboard.helpers';
import { formatJakartaTime, formatJakartaDate } from '@/shared/lib/time';
import { PixelButton } from '@/shared/components/PixelButton';
import {
  isLauncherNative,
  listAndroidApps,
  launchAndroidApp,
  type LauncherApp,
} from '@/shared/lib/launcherApps';
import { count } from '@/shared/db/outbox';

const MODULES = [
  { to: '/classroom', label: 'KELAS', glyph: '▤' },
  { to: '/', label: 'PLANNER', glyph: '◈' },
  { to: '/', label: 'NOTES', glyph: '▧' },
  { to: '/', label: 'BROWSER', glyph: '⌘' },
  { to: '/', label: 'QUIZ', glyph: '◉' },
  { to: '/', label: 'NILAI', glyph: '▦' },
];

export function LauncherHome() {
  const navigate = useNavigate();
  const { data: schedule } = useTodaySchedule();
  const [nowIso, setNowIso] = useState(new Date().toISOString());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNowIso(new Date().toISOString()), 1_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    void count().then(setPending);
  }, []);

  const slots = useMemo(() => sortSlotsByStart(schedule ?? []), [schedule]);
  const next = useMemo(
    () => findNextSlot(slots, { hhmm: formatJakartaTime(nowIso) }),
    [slots, nowIso],
  );

  const { data: apps } = useQuery({
    queryKey: ['android-apps'],
    queryFn: listAndroidApps,
    enabled: isLauncherNative(),
    staleTime: 60_000,
  });

  const filteredApps = useMemo(() => {
    if (!apps) return [];
    const q = search.trim().toLowerCase();
    const sorted = [...apps].sort((a, b) => a.label.localeCompare(b.label));
    if (!q) return sorted;
    return sorted.filter(
      (a) => a.label.toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q),
    );
  }, [apps, search]);

  const time = formatJakartaTime(nowIso);
  const date = formatJakartaDate(nowIso);

  return (
    <div className="min-h-screen bg-bg text-fg font-mono flex flex-col p-6 gap-6 select-none">
      {/* Top status strip */}
      <header className="flex items-center justify-between text-xs">
        <span className="text-accent text-glow font-bold">8bitOS</span>
        <span className="text-dim">
          {date} · <span className="text-accent">{time}</span>
          {pending > 0 && <span className="ml-2 text-accent">· SYNC {pending}</span>}
        </span>
      </header>

      {/* Clock block */}
      <section className="mt-4">
        <p className="text-dim text-xs">good morning, teacher</p>
        <h1 className="text-[64px] leading-none font-bold text-accent text-glow tracking-tight">
          {time}
        </h1>
      </section>

      {/* Next class hero */}
      {next ? (
        <section className="panel-accent p-4 max-w-md">
          <p className="text-micro-label text-dim label-term mb-1">next_session</p>
          <p className="text-md font-bold text-fg">
            {next.subject.name.toUpperCase()} · {next.classRow.name}
          </p>
          <p className="text-xs text-dim mt-0.5">
            {next.slot.start_time.slice(0, 5)} · ruang {next.slot.room || '—'}
          </p>
          <Link to={`/classroom/${next.classRow.id}`} className="inline-block mt-3">
            <PixelButton>MULAI KBM →</PixelButton>
          </Link>
        </section>
      ) : (
        <section className="panel p-4 max-w-md">
          <p className="text-xs text-dim">no more classes today</p>
        </section>
      )}

      {/* Module grid */}
      <section className="mt-2">
        <p className="text-micro-label text-dim label-term mb-2">modules</p>
        <div className="grid grid-cols-6 gap-2 max-w-3xl">
          {MODULES.map((m) => (
            <Link
              key={m.label}
              to={m.to}
              className="panel h-20 flex flex-col items-center justify-center gap-1.5 hover:border-accent-dim hover:shadow-glow transition-colors"
            >
              <span className="text-lg text-accent">{m.glyph}</span>
              <span className="text-micro-label text-dim">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex-1" />

      {/* Bottom bar */}
      <footer className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="font-mono text-xs text-dim border border-line-strong px-3 py-1.5 hover:border-accent-dim hover:text-fg transition-colors"
        >
          ▤ ALL APPS
        </button>
        <Link
          to="/"
          className="font-mono text-xs text-dim border border-line-strong px-3 py-1.5 hover:border-accent-dim hover:text-fg transition-colors"
        >
          WORKSPACE →
        </Link>
      </footer>

      {/* App drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg/95 flex flex-col p-6 gap-4"
          role="dialog"
          aria-label="App drawer"
        >
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search apps…"
              autoFocus
              className="flex-1 max-w-sm bg-bg text-fg border border-line-strong px-3 py-2 font-mono text-small focus-visible:border-accent"
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="font-mono text-xs text-dim hover:text-accent px-2"
              aria-label="Close drawer"
            >
              [X] CLOSE
            </button>
          </div>

          {!isLauncherNative() && (
            <p className="text-xs text-dimmer">
              app drawer hanya tersedia di Android native — jalankan via APK/Capacitor
            </p>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 pb-6">
              {filteredApps.map((a: LauncherApp) => (
                <button
                  key={a.packageName}
                  type="button"
                  onClick={() => void launchAndroidApp(a.packageName)}
                  className="panel h-24 flex flex-col items-center justify-center gap-2 hover:border-accent-dim hover:shadow-glow transition-colors"
                >
                  <span className="text-xl text-accent">▣</span>
                  <span className="text-micro-label text-dim text-center px-1 leading-tight">
                    {a.label}
                  </span>
                </button>
              ))}
              {isLauncherNative() && filteredApps.length === 0 && (
                <p className="text-xs text-dimmer col-span-full">no apps found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* noop navigate guard */}
      <span className="hidden">{typeof navigate === 'function' ? '' : ''}</span>
    </div>
  );
}
