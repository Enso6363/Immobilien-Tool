import { cn } from '@/lib/utils';

export type PillTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_CLASSES: Record<PillTone, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-2 text-ink-soft',
};

export function StatusPill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}

const BOOKING_TONE: Record<string, PillTone> = {
  angefragt: 'warning',
  bestätigt: 'info',
  laufend: 'success',
  abgereist: 'neutral',
  storniert: 'danger',
};

const CLEANING_TONE: Record<string, PillTone> = {
  geplant: 'warning',
  erledigt: 'success',
  nicht_erschienen: 'danger',
};

const MAINT_TONE: Record<string, PillTone> = {
  offen: 'warning',
  in_bearbeitung: 'info',
  erledigt: 'success',
};

const PRIORITY_TONE: Record<string, PillTone> = {
  niedrig: 'neutral',
  mittel: 'info',
  hoch: 'warning',
  dringend: 'danger',
};

export function bookingTone(status: string): PillTone {
  return BOOKING_TONE[status] ?? 'neutral';
}
export function cleaningTone(status: string): PillTone {
  return CLEANING_TONE[status] ?? 'neutral';
}
export function maintTone(status: string): PillTone {
  return MAINT_TONE[status] ?? 'neutral';
}
export function priorityTone(priority: string): PillTone {
  return PRIORITY_TONE[priority] ?? 'neutral';
}
