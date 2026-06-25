import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'warning' | 'danger';
  onClick?: () => void;
}

const TONE_BORDER: Record<string, string> = {
  default: 'border-line',
  warning: 'border-warning/40',
  danger: 'border-danger/40',
};

export function StatCard({ label, value, hint, tone = 'default', onClick }: StatCardProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1 rounded-lg border bg-surface p-4 text-left shadow-sm transition-shadow',
        TONE_BORDER[tone],
        onClick && 'cursor-pointer hover:shadow-md',
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <span className="font-display text-2xl text-ink">{value}</span>
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </Comp>
  );
}
