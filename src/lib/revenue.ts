import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import type { Booking, BookingStatus, MaintenanceTask } from '@/types';
import { nightsBetween, rangesOverlap } from '@/lib/dates';

// Buchungen mit diesen Stati zählen zum Umsatz (angefragt/storniert nicht).
const REVENUE_STATUSES: BookingStatus[] = ['bestätigt', 'laufend', 'abgereist'];

export type RevenueGranularity = 'day' | 'month' | 'year';

function rangeFor(reference: Date, granularity: RevenueGranularity) {
  const start =
    granularity === 'day' ? startOfDay(reference) : granularity === 'year' ? startOfYear(reference) : startOfMonth(reference);
  const end =
    granularity === 'day' ? endOfDay(reference) : granularity === 'year' ? endOfYear(reference) : endOfMonth(reference);
  // endExclusiveISO ist der Tag NACH dem letzten Tag des Zeitraums — passend zum
  // [checkIn, checkOut)-Modell der Buchungen, sonst fällt der letzte Tag aus dem Overlap-Check.
  // format() statt toISOString(): toISOString() rechnet in UTC und kann den Tag
  // abends (UTC+2) vorzeitig kippen lassen.
  return {
    startISO: format(start, 'yyyy-MM-dd'),
    endISO: format(end, 'yyyy-MM-dd'),
    endExclusiveISO: format(addDays(end, 1), 'yyyy-MM-dd'),
    availableNights: differenceInCalendarDays(end, start) + 1,
  };
}

export interface RevenueLine {
  booking: Booking;
  nights: number;
  pricePerNight: number;
  subtotal: number;
}

export interface RevenueBreakdown {
  lines: RevenueLine[];
  gross: number; // Brutto-Umsatz
  occupiedNights: number; // belegte Nächte im Monat (umsatzrelevante Buchungen)
  availableNights: number; // Tage im Monat
  adr: number; // Average Daily Rate = Umsatz / belegte Nächte
  revpar: number; // Revenue Per Available Room = Umsatz / verfügbare Nächte
}

/**
 * Umsatz-Aufschlüsselung für den Zeitraum (Tag/Monat/Jahr) von `reference`.
 * Nutzt dieselbe Overlap-Logik wie das Dashboard, plus ADR/RevPAR.
 */
export function revenueBreakdown(
  bookings: Booking[],
  reference: Date,
  granularity: RevenueGranularity = 'month',
): RevenueBreakdown {
  const { startISO, endExclusiveISO, availableNights } = rangeFor(reference, granularity);

  const lines: RevenueLine[] = bookings
    .filter(
      (b) => REVENUE_STATUSES.includes(b.status) && rangesOverlap(b.checkIn, b.checkOut, startISO, endExclusiveISO),
    )
    .map((booking) => {
      // Nächte auf den Zeitraum clippen (eine Buchung kann über Tag/Monat/Jahr hinausragen).
      const clippedCheckIn = booking.checkIn > startISO ? booking.checkIn : startISO;
      const clippedCheckOut = booking.checkOut < endExclusiveISO ? booking.checkOut : endExclusiveISO;
      const nights = nightsBetween(clippedCheckIn, clippedCheckOut);
      const pricePerNight = booking.pricePerNight ?? 0;
      return { booking, nights, pricePerNight, subtotal: pricePerNight * nights };
    })
    .sort((a, b) => a.booking.checkIn.localeCompare(b.booking.checkIn));

  const gross = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const occupiedNights = lines.reduce((sum, l) => sum + l.nights, 0);

  return {
    lines,
    gross,
    occupiedNights,
    availableNights,
    adr: occupiedNights > 0 ? gross / occupiedNights : 0,
    revpar: availableNights > 0 ? gross / availableNights : 0,
  };
}

/** @deprecated use revenueBreakdown(bookings, reference, 'month') */
export function monthlyRevenueBreakdown(bookings: Booking[], reference: Date): RevenueBreakdown {
  return revenueBreakdown(bookings, reference, 'month');
}

/** Summe der Instandhaltungskosten, deren createdAt im Zeitraum von `reference` liegt. */
export function maintenanceCostInRange(
  tasks: MaintenanceTask[],
  reference: Date,
  granularity: RevenueGranularity = 'month',
): number {
  const { startISO, endISO } = rangeFor(reference, granularity);
  return tasks
    .filter((t) => t.cost != null && t.createdAt >= startISO && t.createdAt <= endISO)
    .reduce((sum, t) => sum + (t.cost ?? 0), 0);
}

/** @deprecated use maintenanceCostInRange(tasks, reference, 'month') */
export function monthlyMaintenanceCost(tasks: MaintenanceTask[], reference: Date): number {
  return maintenanceCostInRange(tasks, reference, 'month');
}
