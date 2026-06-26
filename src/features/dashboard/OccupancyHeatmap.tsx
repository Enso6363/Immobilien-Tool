import { isToday } from 'date-fns';
import type { Booking } from '@/types';
import { bookingForDay, daysInMonth } from '@/lib/dates';
import { bookingTone } from '@/components/shared/StatusPill';
import { formatMonthLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

const TONE_BG: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
  neutral: 'bg-line',
};

export function OccupancyHeatmap({
  bookings,
  month = new Date(),
  onDayClick,
}: {
  bookings: Booking[];
  month?: Date;
  /** booking ist undefined, wenn der Tag frei ist (für „Neue Buchung an diesem Tag"). */
  onDayClick?: (day: Date, booking: Booking | undefined) => void;
}) {
  const days = daysInMonth(month);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="mb-3 font-display capitalize text-ink">{formatMonthLabel(month)}</h3>
      <div className="flex gap-1">
        {days.map((day) => {
          const booking = bookingForDay(bookings, day);
          const tone = booking ? bookingTone(booking.status) : 'neutral';
          return (
            <button
              key={day.toISOString()}
              type="button"
              title={`${day.getDate()}. ${booking ? booking.guestName : 'frei – Buchung anlegen'}`}
              onClick={() => onDayClick?.(day, booking)}
              className={cn(
                'h-8 flex-1 rounded-sm transition-transform',
                TONE_BG[tone],
                tone === 'neutral' && 'opacity-40 hover:opacity-70',
                isToday(day) && 'ring-2 ring-accent ring-offset-1',
                onDayClick && 'cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
