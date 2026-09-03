type Tone = 'on' | 'off' | 'error';

export interface StatusPillProps {
  tone: Tone;
  label: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  on: 'bg-accent text-bg border-accent shadow-glow',
  off: 'bg-transparent text-dim border-dashed border-dim',
  error: 'bg-transparent text-fg border-fg',
};

export function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-mono text-micro-label label-term border ${TONE_CLASSES[tone]}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
