type Tone = 'on' | 'off';

export interface StatusPillProps {
  tone: Tone;
  label: string;
}

export function StatusPill({ tone, label }: StatusPillProps) {
  const classes =
    tone === 'on' ? 'bg-fg text-bg border-fg' : 'bg-bg text-fg border-fg border-dashed';
  return (
    <span
      className={`inline-block px-3 py-1 font-pixel text-xs border-2 ${classes}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
