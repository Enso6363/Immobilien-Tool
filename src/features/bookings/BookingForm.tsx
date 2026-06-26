import { useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import type { Booking, BookingStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input, Label, NativeSelect, Textarea } from '@/components/ui/input';
import { findOverlappingBooking } from '@/lib/dates';

const STATUS_OPTIONS: BookingStatus[] = ['angefragt', 'bestätigt', 'laufend', 'abgereist', 'storniert'];

function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

export interface BookingFormValues {
  guestName: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  pricePerNight?: number;
  notes?: string;
}

export function BookingForm({
  existingBookings,
  excludeId,
  initial,
  prefillCheckIn,
  submitLabel,
  allowPastCheckIn = false,
  onSubmit,
}: {
  existingBookings: Booking[];
  /** Buchung, die beim Overlap-Check ignoriert wird (Bearbeiten der eigenen Buchung). */
  excludeId?: string;
  /** Vorbelegung beim Bearbeiten. */
  initial?: Booking;
  /** Vorbelegung Check-in beim Anlegen über Kalendertag (Check-out = +1 Tag). */
  prefillCheckIn?: string;
  submitLabel: string;
  /** Beim Bearbeiten darf das Check-in in der Vergangenheit liegen. */
  allowPastCheckIn?: boolean;
  onSubmit: (values: BookingFormValues) => void;
}) {
  const [guestName, setGuestName] = useState(initial?.guestName ?? '');
  const [guests, setGuests] = useState(initial?.guests ?? 1);
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? prefillCheckIn ?? '');
  const [checkOut, setCheckOut] = useState(
    initial?.checkOut ?? (prefillCheckIn ? format(addDays(parseISO(prefillCheckIn), 1), 'yyyy-MM-dd') : ''),
  );
  const [pricePerNight, setPricePerNight] = useState(
    initial?.pricePerNight != null ? String(initial.pricePerNight) : '',
  );
  const [status, setStatus] = useState<BookingStatus>(initial?.status ?? 'angefragt');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [conflict, setConflict] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clearMessages() {
    setConflict(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!guestName || !checkIn || !checkOut) {
      setError('Bitte Gast, Check-in und Check-out ausfüllen.');
      return;
    }
    if (!allowPastCheckIn && checkIn < todayISO()) {
      setError('Das Check-in-Datum darf nicht in der Vergangenheit liegen.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Das Check-out-Datum muss nach dem Check-in-Datum liegen.');
      return;
    }

    const overlap = findOverlappingBooking(existingBookings, checkIn, checkOut, excludeId);
    if (overlap) {
      setConflict(overlap);
      return;
    }

    const price = pricePerNight.trim() === '' ? undefined : Number(pricePerNight);
    onSubmit({
      guestName,
      guests,
      checkIn,
      checkOut,
      status,
      pricePerNight: price != null && !Number.isNaN(price) ? price : undefined,
      notes: notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="guestName">Gast</Label>
        <Input id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              clearMessages();
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              clearMessages();
            }}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="guests">Personen</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pricePerNight">Preis/Nacht (€)</Label>
          <Input
            id="pricePerNight"
            type="number"
            min={0}
            step="0.01"
            placeholder="optional"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <NativeSelect id="status" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <Label htmlFor="notes">Notiz</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
      {conflict && (
        <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          Überschneidung mit Buchung von {conflict.guestName} ({conflict.checkIn} – {conflict.checkOut}).
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
