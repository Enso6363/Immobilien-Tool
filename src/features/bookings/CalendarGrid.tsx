import { useState } from 'react';
import { addMonths, format, isSameMonth, isToday, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types';
import { bookingForDay, daysInMonth, removeDayFromBooking } from '@/lib/dates';
import { bookingTone } from '@/components/shared/StatusPill';
import { formatMonthLabel } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/shared/Toast';

// Nur in diesen Stati ist eine Schnell-Entfernung direkt im Kalender sinnvoll —
// laufende/abgereiste Aufenthalte sollen nicht versehentlich aus der Kachel gelöscht werden.
const QUICK_DELETE_STATUSES: BookingStatus[] = ['angefragt', 'bestätigt'];

const TONE_BG: Record<string, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  danger: 'bg-danger-bg text-danger',
  neutral: 'bg-surface-2 text-ink-soft',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  angefragt: 'Angefragt',
  bestätigt: 'Bestätigt',
  laufend: 'Laufend',
  abgereist: 'Abgereist',
  storniert: 'Storniert',
};

const LEGEND: BookingStatus[] = ['angefragt', 'bestätigt', 'laufend', 'abgereist', 'storniert'];

export function CalendarGrid({
  bookings,
  onSelectBooking,
  onCreateForDay,
}: {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onCreateForDay: (dayISO: string) => void;
}) {
  const [month, setMonth] = useState(new Date());
  // Bestätigungs-Schlüssel je Tag (nicht je Buchung), damit nur der angeklickte
  // Tag entfernt wird, nicht die ganze Buchung.
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);
  const deleteBooking = useAppStore((s) => s.deleteBooking);
  const updateBooking = useAppStore((s) => s.updateBooking);
  const addBooking = useAppStore((s) => s.addBooking);
  const { toast } = useToast();
  const days = daysInMonth(month);
  const leadingBlanks = (days[0].getDay() + 6) % 7; // Montag = 0

  async function handleRemoveDay(booking: Booking, dayISO: string) {
    if (pendingDeleteKey !== dayISO) {
      setPendingDeleteKey(dayISO);
      return;
    }
    setPendingDeleteKey(null);

    const ranges = removeDayFromBooking(booking, dayISO);
    try {
      if (ranges.length === 0) {
        // Buchung bestand nur aus diesem Tag → ganz entfernen.
        await deleteBooking(booking.id);
      } else {
        await updateBooking(booking.id, ranges[0]);
        if (ranges.length === 2) {
          // Tag aus der Mitte → zweiter Aufenthalt als neue Buchung.
          await addBooking({
            propertyId: booking.propertyId,
            guestName: booking.guestName,
            guests: booking.guests,
            status: booking.status,
            checkIn: ranges[1].checkIn,
            checkOut: ranges[1].checkOut,
            pricePerNight: booking.pricePerNight,
            notes: booking.notes,
          });
        }
      }
      toast('Tag entfernt', 'success');
    } catch {
      toast('Tag konnte nicht entfernt werden', 'error');
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))} aria-label="Vorheriger Monat">
          <ChevronLeft size={16} />
        </Button>
        <span className="font-display capitalize text-ink">{formatMonthLabel(month)}</span>
        <Button variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Nächster Monat">
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const booking = bookingForDay(bookings, day);
          const dayISO = format(day, 'yyyy-MM-dd');
          const tone = booking ? bookingTone(booking.status) : 'neutral';
          const statusLabel = booking ? STATUS_LABELS[booking.status] : undefined;
          const canRemoveDay = booking && QUICK_DELETE_STATUSES.includes(booking.status);
          const confirming = pendingDeleteKey === dayISO;
          return (
            <div key={day.toISOString()} className="group relative">
              <button
                onClick={() => (booking ? onSelectBooking(booking) : onCreateForDay(dayISO))}
                title={booking ? `${booking.guestName} – ${statusLabel}` : 'Buchung anlegen'}
                aria-label={
                  booking
                    ? `${day.getDate()}. ${booking.guestName}, ${statusLabel}`
                    : `${day.getDate()}. frei – Buchung anlegen`
                }
                className={cn(
                  'group/day flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-md text-xs transition-colors',
                  booking
                    ? cn(TONE_BG[tone], 'cursor-pointer hover:opacity-80')
                    : 'cursor-pointer text-ink-soft hover:bg-surface-2',
                  isToday(day) && 'ring-2 ring-accent',
                  !isSameMonth(day, month) && 'opacity-40',
                )}
              >
                <span className="font-medium">{day.getDate()}</span>
                {booking && <span className="max-w-full truncate px-1 text-[10px]">{booking.guestName}</span>}
                {booking && <span className="max-w-full truncate px-1 text-[9px] font-medium uppercase opacity-80">{statusLabel}</span>}
                {!booking && (
                  <span className="text-[14px] leading-none text-ink-soft opacity-0 transition-opacity group-hover/day:opacity-100">
                    +
                  </span>
                )}
              </button>
              {canRemoveDay && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDay(booking, dayISO);
                  }}
                  onBlur={() => setPendingDeleteKey(null)}
                  title={confirming ? 'Diesen Tag wirklich entfernen?' : 'Diesen Tag entfernen'}
                  aria-label={
                    confirming
                      ? `${day.getDate()}. wirklich entfernen?`
                      : `${day.getDate()}. aus Buchung ${booking.guestName} entfernen`
                  }
                  className={cn(
                    'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-ink-soft opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
                    confirming && 'bg-danger text-white opacity-100',
                  )}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-line pt-3 text-xs text-ink-soft">
        {LEGEND.map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('h-2.5 w-2.5 rounded-full', TONE_BG[bookingTone(status)])}
            />
            <span>{STATUS_LABELS[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
