import { useState } from 'react';
import type { Booking, BookingStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label, NativeSelect, Textarea } from '@/components/ui/input';
import { findOverlappingBooking } from '@/lib/dates';
import { useToast } from '@/components/shared/Toast';
import { format } from 'date-fns';

const STATUS_OPTIONS: BookingStatus[] = ['angefragt', 'bestätigt', 'laufend', 'abgereist', 'storniert'];

function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function NewBookingDialog({
  propertyId,
  existingBookings,
  onCreate,
}: {
  propertyId: string;
  existingBookings: Booking[];
  onCreate: (booking: Omit<Booking, 'id'>) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [status, setStatus] = useState<BookingStatus>('angefragt');
  const [notes, setNotes] = useState('');
  const [conflict, setConflict] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setGuestName('');
    setGuests(1);
    setCheckIn('');
    setCheckOut('');
    setPricePerNight('');
    setStatus('angefragt');
    setNotes('');
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

    if (checkIn < todayISO()) {
      setError('Das Check-in-Datum darf nicht in der Vergangenheit liegen.');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Das Check-out-Datum muss nach dem Check-in-Datum liegen.');
      return;
    }

    const overlap = findOverlappingBooking(existingBookings, checkIn, checkOut);
    if (overlap) {
      setConflict(overlap);
      return;
    }

    const price = pricePerNight.trim() === '' ? undefined : Number(pricePerNight);
    onCreate({
      propertyId,
      guestName,
      guests,
      checkIn,
      checkOut,
      status,
      pricePerNight: price != null && !Number.isNaN(price) ? price : undefined,
      notes: notes || undefined,
    });
    toast('Buchung angelegt', 'success');
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>+ Neue Buchung</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Buchung</DialogTitle>
        </DialogHeader>
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
                  setConflict(null);
                  setError(null);
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
                  setConflict(null);
                  setError(null);
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

          {error && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
          )}

          {conflict && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
              Überschneidung mit Buchung von {conflict.guestName} ({conflict.checkIn} – {conflict.checkOut}).
            </p>
          )}

          <DialogFooter>
            <Button type="submit">Buchung anlegen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
