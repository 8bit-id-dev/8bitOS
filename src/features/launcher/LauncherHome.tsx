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
import { SessionIndicator } from '@/features/classroom/SessionIndicator';
import { useSessionContext } from '@/features/classroom/sessionContext';
import { AiPanel } from '@/features/ai/AiPanel';

const MODULES = [
  { to: '/classroom', label: 'KELAS', glyph: '▤' },
  { to: '/planner', label: 'PLANNER', glyph: '◈' },
  { to: '/notes', label: 'NOTES', glyph: '▧' },
  { to: '/browser', label: 'BROWSER', glyph: '⌘' },
  { to: '/assessment', label: 'QUIZ', glyph: '◉' },
  { to: '/gradebook', label: 'NILAI', glyph: '▦' },
  { to: '/whiteboard', label: 'BOARD', glyph: '▩' },
  { to: '/tools', label: 'TOOLS', glyph: '▣' },
];

export function LauncherHome() {
  const navigate = useNavigate();
  const { data: schedule } = useTodaySchedule();
  const [nowIso, setNowIso] = useState(new Date().toISOString());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const [search, setSearch] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const activeSession = useSessionContext((s) => s.active);

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
    <div className="min-h-screen bg-bg text-fg font-sans flex flex-col p-6 gap-6 select-none">
      {/* Persistent session indicator (Doc 06 §4) */}
      <SessionIndicator />

      {/* Top status strip */}
      <header className="flex items-center justify-between text-pixel-sm">
        <span className="text-fg font-bold">8bitOS</span>
        <span className="text-gray-300">
          {date} <span className="text-fg">{time}</span>
          {pending > 0 && <span className="ml-2 text-fg"> SYNC {pending}</span>}
        </span>
      </header>

      {/* Clock block  pixel display (Doc 05 v2 4.2) */}
      <section className="mt-4">
        <p className="micro-pixel text-gray-300">GOOD MORNING, TEACHER</p>
        <h1 className="font-pixel text-display leading-none font-bold text-fg tracking-wide">
          {time}
        </h1>
      </section>

      {/* Next class hero */}
      {next ? (
        <section className="panel-strong p-4 max-w-md">
          <p className="micro-pixel text-gray-300 label-pixel mb-1">next_session</p>
          <p className="text-body font-bold text-fg">
            {next.subject.name.toUpperCase()}  {next.classRow.name}
          </p>
          <p className="text-pixel-sm text-gray-300 mt-0.5">
            {next.slot.start_time.slice(0, 5)}  ruang {next.slot.room || ''}
          </p>
          <Link to={`/classroom/${next.classRow.id}`} className="inline-block mt-3">
            <PixelButton>MULAI KBM  </PixelButton>
          </Link>
        </section>
      ) : (
        <section className="panel p-4 max-w-md">
          <p className="text-pixel-sm text-gray-300">no more classes today</p>
        </section>
      )}

      {/* Module grid */}
      <section className="mt-2">
        <p className="micro-pixel text-gray-300 label-pixel mb-2">modules</p>
        <div className="grid grid-cols-6 gap-2 max-w-3xl">
          {MODULES.map((m) => (
            <Link
              key={m.label}
              to={m.to}
              className="panel h-20 flex flex-col items-center justify-center gap-1.5 hover:border-fg hover: transition-colors"
            >
              <span className="text-pixel-xl text-fg">{m.glyph}</span>
              <span className="micro-pixel text-gray-300">{m.label}</span>
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
          className="font-sans text-pixel-sm text-gray-300 border border-line-strong px-3 py-1.5 hover:border-fg hover:text-fg transition-colors"
        >
           ALL APPS
        </button>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="font-sans text-pixel-sm text-gray-300 border border-line-strong px-3 py-1.5 hover:border-fg hover:text-fg transition-colors"
          >
            R" CARI (ctrl+k)
          </Link>
          <Link
            to="/"
            className="font-sans text-pixel-sm text-gray-300 border border-line-strong px-3 py-1.5 hover:border-fg hover:text-fg transition-colors"
          >
            WORKSPACE  
          </Link>
        </div>
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
              className="flex-1 max-w-sm bg-bg text-fg border border-line-strong px-3 py-2 font-sans text-small focus-visible:border-fg"
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="font-sans text-pixel-sm text-gray-300 hover:text-fg px-2"
              aria-label="Close drawer"
            >
              [X] CLOSE
            </button>
          </div>

          {!isLauncherNative() && (
            <p className="text-pixel-sm text-gray-500">
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
                  className="panel h-24 flex flex-col items-center justify-center gap-2 hover:border-fg transition-colors"
                >
                  <span className="text-xl text-fg">▣</span>
                  <span className="micro-pixel text-gray-300 text-center px-1 leading-tight">
                    {a.label}
                  </span>
                </button>
              ))}
              {isLauncherNative() && filteredApps.length === 0 && (
                <p className="text-pixel-sm text-gray-500 col-span-full">no apps found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Class Mode quick strip (Doc 08 §38-39): sesi aktif → buka absensi; AI FAB */}
      <div className="flex items-center justify-between gap-3">
        {activeSession ? (
          <Link
            to={`/classroom/${activeSession.classId}/attendance/${activeSession.sessionId}`}
            className="pixel-cut bg-fg text-bg border border-fg px-3 py-2 label-pixel font-pixel text-pixel-xs hover:bg-surface hover:text-fg"
          >
            ▶ LANJUTKAN {activeSession.subjectName.toUpperCase()} · {activeSession.className}
          </Link>
        ) : (
          <span className="micro-pixel text-gray-500">CLASS MODE muncul saat sesi dimulai</span>
        )}
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="pixel-cut bg-fg text-bg border border-fg h-11 w-11 font-pixel text-pixel-md font-bold label-pixel hover:bg-surface hover:text-fg"
          aria-label="Buka 8bit AI"
        >
          AI
        </button>
      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* noop navigate guard */}
      <span className="hidden">{typeof navigate === 'function' ? '' : ''}</span>
    </div>
  );
}
