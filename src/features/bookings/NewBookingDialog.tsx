import { useState } from 'react';
import type { Booking } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookingForm } from '@/features/bookings/BookingForm';
import { useToast } from '@/components/shared/Toast';

export function NewBookingDialog({
  propertyId,
  existingBookings,
  onCreate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  prefillCheckIn,
  showTrigger = true,
}: {
  propertyId: string;
  existingBookings: Booking[];
  onCreate: (booking: Omit<Booking, 'id'>) => void;
  /** Kontrollierter Modus (z.B. geöffnet durch Klick auf Kalendertag). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  prefillCheckIn?: string;
  showTrigger?: boolean;
}) {
  const { toast } = useToast();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) controlledOnOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button>+ Neue Buchung</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Buchung</DialogTitle>
        </DialogHeader>
        {/* key sorgt für frischen Form-State bei jeder Öffnung / neuem Vorab-Datum */}
        <BookingForm
          key={open ? prefillCheckIn ?? 'new' : 'closed'}
          existingBookings={existingBookings}
          prefillCheckIn={prefillCheckIn}
          submitLabel="Buchung anlegen"
          onSubmit={(values) => {
            onCreate({ propertyId, ...values });
            toast('Buchung angelegt', 'success');
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
