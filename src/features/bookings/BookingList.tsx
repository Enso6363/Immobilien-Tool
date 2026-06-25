import { useMemo, useState } from 'react';
import type { Booking, BookingStatus } from '@/types';
import { StatusPill, bookingTone } from '@/components/shared/StatusPill';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

const STATUS_LABELS: Record<BookingStatus, string> = {
  angefragt: 'Angefragt',
  bestätigt: 'Bestätigt',
  laufend: 'Laufend',
  abgereist: 'Abgereist',
  storniert: 'Storniert',
};

const STATUS_OPTIONS: BookingStatus[] = ['angefragt', 'bestätigt', 'laufend', 'abgereist', 'storniert'];

type Filter = 'alle' | BookingStatus;

export function BookingList({
  bookings,
  onSelectBooking,
}: {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
}) {
  const [filter, setFilter] = useState<Filter>('alle');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...bookings]
      .filter((b) => (filter === 'alle' ? true : b.status === filter))
      .filter((b) => (q === '' ? true : b.guestName.toLowerCase().includes(q)))
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }, [bookings, filter, search]);

  if (bookings.length === 0) {
    return <EmptyState icon={CalendarDays} title="Keine Buchungen" description="Für diese Immobilie liegen noch keine Buchungen vor." />;
  }

  const chips: Filter[] = ['alle', ...STATUS_OPTIONS];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === c
                ? 'border-accent bg-accent text-white'
                : 'border-line bg-surface text-ink-soft hover:bg-surface-2',
            )}
          >
            {c === 'alle' ? 'Alle' : STATUS_LABELS[c]}
          </button>
        ))}
      </div>

      <Input
        type="search"
        placeholder="Nach Gast suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Buchungen nach Gastname durchsuchen"
      />

      {filtered.length === 0 ? (
        <p className="rounded-md border border-line bg-surface px-4 py-6 text-center text-sm text-ink-soft">
          Keine Buchungen entsprechen den Filtern.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => onSelectBooking(b)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3 text-left transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-ink">{b.guestName}</span>
                  <span className="text-xs text-ink-soft">
                    {formatDate(b.checkIn)} – {formatDate(b.checkOut)} · {b.guests} Gäste
                  </span>
                </div>
                <StatusPill tone={bookingTone(b.status)}>{b.status}</StatusPill>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
