import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="font-pixel text-lg">{title}</p>
      {hint && <p className="text-gray-300 text-sm">{hint}</p>}
      {action}
    </div>
  );
}
