import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking } from '@/types';
import {
  useActiveBookings,
  useActiveCleaningTasks,
  useActiveMaintenanceTasks,
  useActiveProperty,
  useAppStore,
} from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatCard } from '@/components/shared/StatCard';
import { OccupancyHeatmap } from '@/features/dashboard/OccupancyHeatmap';
import { UpcomingList } from '@/features/dashboard/UpcomingList';
import { TasksWidget } from '@/features/dashboard/TasksWidget';
import { RevenueDetailDialog } from '@/features/dashboard/RevenueDetailDialog';
import { BookingDetailDialog } from '@/features/bookings/BookingDetailDialog';
import { NewBookingDialog } from '@/features/bookings/NewBookingDialog';
import { Button } from '@/components/ui/button';
import { occupancyRate } from '@/lib/dates';
import { revenueBreakdown } from '@/lib/revenue';
import { formatDate, formatCurrency, formatMonthLabel } from '@/lib/format';

export function DashboardView() {
  const property = useActiveProperty();
  const bookings = useActiveBookings();
  const cleaningTasks = useActiveCleaningTasks();
  const maintenanceTasks = useActiveMaintenanceTasks();
  const addBooking = useAppStore((s) => s.addBooking);
  const activePropertyId = useAppStore((s) => s.activePropertyId);
  const navigate = useNavigate();

  const [month, setMonth] = useState(new Date());
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);

  if (!property) return null;

  const occupancy = occupancyRate(bookings, month);
  const currentGuest = bookings.find((b) => b.status === 'laufend');
  const nextArrival = bookings
    .filter((b) => b.status === 'bestätigt' && parseISO(b.checkIn) > new Date())
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];

  const nextCleaning = cleaningTasks
    .filter((c) => c.status === 'geplant')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const openMaintenance = maintenanceTasks.filter((t) => t.status !== 'erledigt');
  const urgentMaintenance = openMaintenance.filter((t) => t.priority === 'dringend');

  const breakdown = revenueBreakdown(bookings, month, 'month');
  const monthLabel = formatMonthLabel(month);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Dashboard" description={property.name} />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))} aria-label="Vorheriger Monat">
            <ChevronLeft size={16} />
          </Button>
          <span className="min-w-36 text-center font-display capitalize text-ink">{monthLabel}</span>
          <Button variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Nächster Monat">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Belegung" value={`${occupancy}%`} hint={monthLabel} onClick={() => navigate('/buchungen')} />
        <StatCard
          label={currentGuest ? 'Aktueller Gast' : 'Nächste Anreise'}
          value={currentGuest?.guestName ?? nextArrival?.guestName ?? '—'}
          hint={currentGuest ? `bis ${formatDate(currentGuest.checkOut)}` : nextArrival ? formatDate(nextArrival.checkIn) : undefined}
          onClick={() => navigate('/buchungen')}
        />
        <StatCard
          label="Nächste Reinigung"
          value={nextCleaning ? formatDate(nextCleaning.date) : 'Keine geplant'}
          hint={nextCleaning?.status}
          onClick={() => navigate('/reinigung')}
        />
        <StatCard
          label="Offene Reparaturen"
          value={openMaintenance.length}
          hint={urgentMaintenance.length > 0 ? `${urgentMaintenance.length} dringend` : undefined}
          tone={urgentMaintenance.length > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/instandhaltung')}
        />
        <StatCard
          label="Umsatz"
          value={formatCurrency(breakdown.gross)}
          hint={`ADR ${formatCurrency(breakdown.adr)} · Details ansehen`}
          onClick={() => setRevenueOpen(true)}
        />
      </div>

      <OccupancyHeatmap
        bookings={bookings}
        month={month}
        onDayClick={(day, booking) => {
          if (booking) setSelectedBooking(booking);
          else setCreateDate(format(day, 'yyyy-MM-dd'));
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-display text-base text-ink">Heute & Demnächst</h3>
          <UpcomingList bookings={bookings} />
        </section>
        <section>
          <h3 className="mb-3 font-display text-base text-ink">Aufgaben</h3>
          <TasksWidget maintenanceTasks={maintenanceTasks} cleaningTasks={cleaningTasks} />
        </section>
      </div>

      <RevenueDetailDialog
        open={revenueOpen}
        onClose={() => setRevenueOpen(false)}
        bookings={bookings}
        maintenanceTasks={maintenanceTasks}
        initialReference={month}
      />

      <BookingDetailDialog
        booking={selectedBooking}
        existingBookings={bookings}
        onClose={() => setSelectedBooking(null)}
      />

      {activePropertyId && (
        <NewBookingDialog
          propertyId={activePropertyId}
          existingBookings={bookings}
          onCreate={(b) => addBooking(b)}
          showTrigger={false}
          open={createDate !== null}
          onOpenChange={(open) => !open && setCreateDate(null)}
          prefillCheckIn={createDate ?? undefined}
        />
      )}
    </div>
  );
}
