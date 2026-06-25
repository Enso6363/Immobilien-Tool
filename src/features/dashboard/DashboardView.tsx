import { useNavigate } from 'react-router-dom';
import { parseISO } from 'date-fns';
import type { BookingStatus } from '@/types';
import {
  useActiveBookings,
  useActiveCleaningTasks,
  useActiveMaintenanceTasks,
  useActiveProperty,
} from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatCard } from '@/components/shared/StatCard';
import { OccupancyHeatmap } from '@/features/dashboard/OccupancyHeatmap';
import { UpcomingList } from '@/features/dashboard/UpcomingList';
import { TasksWidget } from '@/features/dashboard/TasksWidget';
import { occupancyRate, nightsBetween, rangesOverlap } from '@/lib/dates';
import { formatDate, formatCurrency } from '@/lib/format';
import { endOfMonth, startOfMonth } from 'date-fns';

export function DashboardView() {
  const property = useActiveProperty();
  const bookings = useActiveBookings();
  const cleaningTasks = useActiveCleaningTasks();
  const maintenanceTasks = useActiveMaintenanceTasks();
  const navigate = useNavigate();

  if (!property) return null;

  const occupancy = occupancyRate(bookings, new Date());
  const currentGuest = bookings.find((b) => b.status === 'laufend');
  const nextArrival = bookings
    .filter((b) => b.status === 'bestätigt' && parseISO(b.checkIn) > new Date())
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];

  const nextCleaning = cleaningTasks
    .filter((c) => c.status === 'geplant')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const openMaintenance = maintenanceTasks.filter((t) => t.status !== 'erledigt');
  const urgentMaintenance = openMaintenance.filter((t) => t.priority === 'dringend');

  const now = new Date();
  const monthStart = startOfMonth(now).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(now).toISOString().slice(0, 10);
  const revenueStatuses: BookingStatus[] = ['bestätigt', 'laufend', 'abgereist'];
  const monthlyRevenue = bookings
    .filter(
      (b) =>
        revenueStatuses.includes(b.status) &&
        rangesOverlap(b.checkIn, b.checkOut, monthStart, monthEnd),
    )
    .reduce((sum, b) => sum + (b.pricePerNight ?? 0) * nightsBetween(b.checkIn, b.checkOut), 0);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Dashboard" description={property.name} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Belegung diesen Monat" value={`${occupancy}%`} onClick={() => navigate('/buchungen')} />
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
          label="Umsatz (Monat)"
          value={formatCurrency(monthlyRevenue)}
          onClick={() => navigate('/buchungen')}
        />
      </div>

      <OccupancyHeatmap bookings={bookings} />

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
    </div>
  );
}
