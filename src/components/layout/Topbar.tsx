import { format } from 'date-fns';
import { PropertySwitcher } from '@/components/layout/PropertySwitcher';
import { formatDate } from '@/lib/format';

export function Topbar() {
  // Local date (YYYY-MM-DD) — toISOString() is UTC and can roll over a day early in the evening.
  const today = format(new Date(), 'yyyy-MM-dd');
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 md:px-6">
      <PropertySwitcher />
      <span className="hidden shrink-0 text-sm text-ink-soft sm:inline">
        {formatDate(today, 'EEEE, dd. MMMM yyyy')}
      </span>
    </header>
  );
}
