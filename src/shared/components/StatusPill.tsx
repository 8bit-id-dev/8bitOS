type Tone = 'on' | 'off' | 'error';

export interface StatusPillProps {
  tone: Tone;
  label: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  on: 'bg-fg text-bg border-fg',
  off: 'bg-bg text-fg border-fg border-dashed',
  error: 'bg-fg text-bg border-fg',
};

export function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <span
      className={`inline-block px-3 py-1 font-pixel text-xs border-2 ${TONE_CLASSES[tone]}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
