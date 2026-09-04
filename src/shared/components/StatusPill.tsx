type Tone = 'on' | 'off' | 'error';

export interface StatusPillProps {
  tone: Tone;
  label: string;
}

// Status by label, not color (Doc 05 v2 §3)
const TONE_CLASSES: Record<Tone, string> = {
  on: 'bg-fg text-bg border-fg',
  off: 'bg-transparent text-gray-300 border border-dashed border-gray-500',
  error: 'bg-fg text-bg border-fg',
};

export function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <span
      className={`inline-block px-2 py-1 micro-pixel border ${TONE_CLASSES[tone]}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
