import { addDays, isWithinInterval, parseISO } from 'date-fns';
import type { Booking } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill, bookingTone } from '@/components/shared/StatusPill';
import { formatDate } from '@/lib/format';
import { CalendarClock } from 'lucide-react';

interface Entry {
  booking: Booking;
  kind: 'checkin' | 'checkout';
  date: string;
}

export function UpcomingList({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const horizon = addDays(today, 14);
  const relevant = bookings.filter((b) => b.status !== 'storniert' && b.status !== 'angefragt');

  const entries: Entry[] = [];
  for (const b of relevant) {
    const checkIn = parseISO(b.checkIn);
    const checkOut = parseISO(b.checkOut);
    if (isWithinInterval(checkIn, { start: today, end: horizon })) {
      entries.push({ booking: b, kind: 'checkin', date: b.checkIn });
    }
    if (isWithinInterval(checkOut, { start: today, end: horizon })) {
      entries.push({ booking: b, kind: 'checkout', date: b.checkOut });
    }
  }
  entries.sort((a, b) => a.date.localeCompare(b.date));

  if (entries.length === 0) {
    return <EmptyState icon={CalendarClock} title="Nichts in den nächsten 14 Tagen" />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((e, i) => (
        <li
          key={`${e.booking.id}-${e.kind}-${i}`}
          className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ink">{e.booking.guestName}</span>
            <span className="text-xs text-ink-soft">
              {e.kind === 'checkin' ? 'Anreise' : 'Abreise'} · {formatDate(e.date)}
            </span>
          </div>
          <StatusPill tone={bookingTone(e.booking.status)}>{e.booking.status}</StatusPill>
        </li>
      ))}
    </ul>
  );
}
