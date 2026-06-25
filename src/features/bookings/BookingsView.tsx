import { useState } from 'react';
import type { Booking } from '@/types';
import { useActiveBookings, useAppStore } from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { CalendarGrid } from '@/features/bookings/CalendarGrid';
import { BookingList } from '@/features/bookings/BookingList';
import { BookingDetailDialog } from '@/features/bookings/BookingDetailDialog';
import { NewBookingDialog } from '@/features/bookings/NewBookingDialog';

export function BookingsView() {
  const bookings = useActiveBookings();
  const activePropertyId = useAppStore((s) => s.activePropertyId);
  const addBooking = useAppStore((s) => s.addBooking);
  const [selected, setSelected] = useState<Booking | null>(null);

  if (!activePropertyId) return null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Kalender & Buchungen"
        description="Belegung und Buchungen der aktuellen Immobilie."
        action={
          <NewBookingDialog
            propertyId={activePropertyId}
            existingBookings={bookings}
            onCreate={(b) => addBooking(b)}
          />
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <CalendarGrid bookings={bookings} onSelectBooking={setSelected} />
        <BookingList bookings={bookings} onSelectBooking={setSelected} />
      </div>
      <BookingDetailDialog booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
