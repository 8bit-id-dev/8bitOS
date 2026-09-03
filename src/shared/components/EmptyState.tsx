import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center border border-dashed border-line-strong"
      role="status"
    >
      <p className="font-mono text-xs label-term text-dim">{`[ ${title} ]`}</p>
      {hint && <p className="text-xs text-dimmer max-w-md">{hint}</p>}
      {action}
    </div>
  );
}
