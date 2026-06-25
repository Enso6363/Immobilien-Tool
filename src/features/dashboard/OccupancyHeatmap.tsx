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

export function OccupancyHeatmap({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const days = daysInMonth(today);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="mb-3 font-display capitalize text-ink">{formatMonthLabel(today)}</h3>
      <div className="flex gap-1">
        {days.map((day) => {
          const booking = bookingForDay(bookings, day);
          const tone = booking ? bookingTone(booking.status) : 'neutral';
          return (
            <div
              key={day.toISOString()}
              title={`${day.getDate()}.${' '}${booking ? booking.guestName : 'frei'}`}
              className={cn(
                'h-8 flex-1 rounded-sm',
                TONE_BG[tone],
                tone === 'neutral' && 'opacity-40',
                isToday(day) && 'ring-2 ring-accent ring-offset-1',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
