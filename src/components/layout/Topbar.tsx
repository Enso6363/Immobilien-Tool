import { format } from 'date-fns';
import { PropertySwitcher } from '@/components/layout/PropertySwitcher';
import { formatDate } from '@/lib/format';

export function Topbar() {
  // Local date (YYYY-MM-DD) — toISOString() is UTC and can roll over a day early in the evening.
  const today = format(new Date(), 'yyyy-MM-dd');
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
      <PropertySwitcher />
      <span className="text-sm text-ink-soft">{formatDate(today, 'EEEE, dd. MMMM yyyy')}</span>
    </header>
  );
}
