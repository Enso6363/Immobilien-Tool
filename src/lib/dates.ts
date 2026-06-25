import {
  addDays,
  areIntervalsOverlapping,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';
import type { Booking } from '@/types';

export interface DateRange {
  checkIn: string;
  checkOut: string;
}

/**
 * Entfernt einen einzelnen belegten Tag aus dem Buchungszeitraum.
 * Modell: belegt sind die Tage [checkIn, checkOut) (Abreisetag frei).
 * Ergebnis:
 *  - 0 Bereiche → Buchung war nur dieser eine Tag, wird ganz gelöscht.
 *  - 1 Bereich  → Rand-Tag entfernt, Zeitraum gekürzt.
 *  - 2 Bereiche → Tag aus der Mitte entfernt, Buchung in zwei Aufenthalte gesplittet.
 * dayISO ist 'yyyy-MM-dd'. yyyy-MM-dd-Strings sind lexikografisch vergleichbar.
 */
export function removeDayFromBooking(booking: Booking, dayISO: string): DateRange[] {
  const nextDay = format(addDays(parseISO(dayISO), 1), 'yyyy-MM-dd');
  const ranges: DateRange[] = [];
  if (booking.checkIn < dayISO) ranges.push({ checkIn: booking.checkIn, checkOut: dayISO });
  if (nextDay < booking.checkOut) ranges.push({ checkIn: nextDay, checkOut: booking.checkOut });
  return ranges;
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return areIntervalsOverlapping(
    { start: parseISO(aStart), end: parseISO(aEnd) },
    { start: parseISO(bStart), end: parseISO(bEnd) },
    { inclusive: false },
  );
}

export function findOverlappingBooking(
  bookings: Booking[],
  checkIn: string,
  checkOut: string,
  excludeId?: string,
): Booking | undefined {
  return bookings.find(
    (b) =>
      b.id !== excludeId &&
      b.status !== 'storniert' &&
      rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
  );
}

export function daysInMonth(reference: Date): Date[] {
  return eachDayOfInterval({ start: startOfMonth(reference), end: endOfMonth(reference) });
}

// A day belongs to a booking when checkIn <= day < checkOut
// (checkout day EXCLUSIVE / free). At a turnover day where guest A checks out
// and guest B checks in on the same day, the ARRIVING booking (B) wins, so we
// prefer the match whose checkIn is the day itself.
function coversDay(b: Booking, day: number): boolean {
  return parseISO(b.checkIn).getTime() <= day && day < parseISO(b.checkOut).getTime();
}

export function bookingForDay(bookings: Booking[], day: Date): Booking | undefined {
  const time = day.getTime();
  const matches = bookings.filter((b) => coversDay(b, time));
  if (matches.length === 0) return undefined;
  // Prefer the arriving booking on a turnover day.
  return matches.find((b) => parseISO(b.checkIn).getTime() === time) ?? matches[0];
}

export function occupancyRate(bookings: Booking[], reference: Date): number {
  const active = bookings.filter(
    (b) => b.status !== 'storniert' && b.status !== 'angefragt',
  );
  const days = daysInMonth(reference);
  const occupied = days.filter((d) => active.some((b) => coversDay(b, d.getTime())));
  return Math.round((occupied.length / days.length) * 100);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
}
