import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center border border-dashed border-line-strong"
      role="status"
    >
      <p className="font-pixel text-pixel-sm text-gray-300 uppercase tracking-widest">{`[ ${title} ]`}</p>
      {hint && <p className="font-sans text-small text-gray-500 max-w-md">{hint}</p>}
      {action}
    </div>
  );
}
