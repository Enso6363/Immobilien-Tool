import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import type { Booking, BookingStatus, ID } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { StatusPill, bookingTone } from '@/components/shared/StatusPill';
import { Button } from '@/components/ui/button';
import { Label, NativeSelect } from '@/components/ui/input';
import { BookingForm } from '@/features/bookings/BookingForm';
import { formatCurrency, formatDate } from '@/lib/format';
import { nightsBetween } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/shared/Toast';

const STATUS_OPTIONS: BookingStatus[] = ['angefragt', 'bestätigt', 'laufend', 'abgereist', 'storniert'];

export function BookingDetailDialog({
  booking,
  existingBookings,
  onClose,
}: {
  booking: Booking | null;
  existingBookings: Booking[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateBooking = useAppStore((s) => s.updateBooking);
  const deleteBooking = useAppStore((s) => s.deleteBooking);

  const [status, setStatus] = useState<BookingStatus>('angefragt');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setConfirmDelete(false);
      setEditing(false);
    }
  }, [booking]);

  async function persistStatus(id: ID, next: BookingStatus) {
    setStatus(next);
    setBusy(true);
    try {
      await updateBooking(id, { status: next });
      toast('Status aktualisiert', 'success');
    } catch {
      toast('Status konnte nicht aktualisiert werden', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(id: ID) {
    setBusy(true);
    try {
      await updateBooking(id, { status: 'storniert' });
      setStatus('storniert');
      toast('Buchung storniert', 'success');
    } catch {
      toast('Buchung konnte nicht storniert werden', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: ID) {
    setBusy(true);
    try {
      await deleteBooking(id);
      toast('Buchung gelöscht', 'success');
      onClose();
    } catch {
      toast('Buchung konnte nicht gelöscht werden', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit(id: ID, patch: Partial<Booking>) {
    setBusy(true);
    try {
      await updateBooking(id, patch);
      setStatus(patch.status ?? status);
      setEditing(false);
      toast('Buchung aktualisiert', 'success');
    } catch {
      toast('Buchung konnte nicht aktualisiert werden', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      {booking && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{booking.guestName}</DialogTitle>
            <DialogDescription>
              {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} ({nightsBetween(booking.checkIn, booking.checkOut)} Nächte)
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <BookingForm
              existingBookings={existingBookings}
              excludeId={booking.id}
              initial={booking}
              allowPastCheckIn
              submitLabel="Änderungen speichern"
              onSubmit={(values) => handleSaveEdit(booking.id, values)}
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Status</span>
                  <StatusPill tone={bookingTone(status)}>{status}</StatusPill>
                </div>
                <div>
                  <Label htmlFor="detailStatus">Status ändern</Label>
                  <NativeSelect
                    id="detailStatus"
                    value={status}
                    disabled={busy}
                    onChange={(e) => persistStatus(booking.id, e.target.value as BookingStatus)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Gäste</span>
                  <span className="text-ink">{booking.guests}</span>
                </div>
                {booking.pricePerNight != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Preis/Nacht</span>
                    <span className="text-ink">{formatCurrency(booking.pricePerNight)}</span>
                  </div>
                )}
                {booking.notes && (
                  <div className="flex flex-col gap-1">
                    <span className="text-ink-soft">Notiz</span>
                    <p className="rounded-md bg-surface-2 p-2 text-ink">{booking.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-wrap">
                <Button variant="outline" disabled={busy} onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Bearbeiten
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || status === 'storniert'}
                  onClick={() => handleCancel(booking.id)}
                >
                  Stornieren
                </Button>
                {confirmDelete ? (
                  <>
                    <Button variant="ghost" disabled={busy} onClick={() => setConfirmDelete(false)}>
                      Abbrechen
                    </Button>
                    <Button variant="destructive" disabled={busy} onClick={() => handleDelete(booking.id)}>
                      Wirklich löschen?
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" disabled={busy} onClick={() => setConfirmDelete(true)}>
                    Löschen
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
