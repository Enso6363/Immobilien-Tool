import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { occupancyRate } from '@/lib/dates';
import { monthlyRevenueBreakdown } from '@/lib/revenue';
import { formatCurrency, formatDate, formatMonthLabel } from '@/lib/format';

export function PortfolioView() {
  const navigate = useNavigate();
  const properties = useAppStore((s) => s.properties);
  const bookings = useAppStore((s) => s.bookings);
  const cleaningTasks = useAppStore((s) => s.cleaningTasks);
  const maintenanceTasks = useAppStore((s) => s.maintenanceTasks);
  const setActiveProperty = useAppStore((s) => s.setActiveProperty);

  const now = new Date();
  const monthLabel = formatMonthLabel(now);

  const rows = properties.map((p) => {
    const propBookings = bookings.filter((b) => b.propertyId === p.id);
    const propMaintenance = maintenanceTasks.filter((m) => m.propertyId === p.id);
    const nextCleaning = cleaningTasks
      .filter((c) => c.propertyId === p.id && c.status === 'geplant')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return {
      property: p,
      occupancy: occupancyRate(propBookings, now),
      revenue: monthlyRevenueBreakdown(propBookings, now).gross,
      openMaintenance: propMaintenance.filter((m) => m.status !== 'erledigt').length,
      nextCleaning,
    };
  });

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const avgOccupancy = rows.length ? Math.round(rows.reduce((s, r) => s + r.occupancy, 0) / rows.length) : 0;
  const totalOpenMaintenance = rows.reduce((s, r) => s + r.openMaintenance, 0);

  function openProperty(id: string) {
    setActiveProperty(id);
    navigate('/');
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Portfolio" description={`Alle Objekte im Überblick · ${monthLabel}`} />

      {rows.length === 0 ? (
        <EmptyState icon={Building2} title="Keine Immobilien" description="Lege zuerst eine Immobilie an." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Objekt</th>
                <th className="px-4 py-3 text-right font-medium">Belegung</th>
                <th className="px-4 py-3 text-right font-medium">Umsatz ({monthLabel})</th>
                <th className="px-4 py-3 text-right font-medium">Offene Reparaturen</th>
                <th className="px-4 py-3 text-right font-medium">Nächste Reinigung</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.property.id}
                  onClick={() => openProperty(r.property.id)}
                  className="cursor-pointer border-b border-line last:border-0 transition-colors hover:bg-surface-2"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-ink">{r.property.name}</span>
                      <span className="text-xs text-ink-soft">{r.property.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-ink">{r.occupancy}%</td>
                  <td className="px-4 py-3 text-right text-ink">{formatCurrency(r.revenue)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={r.openMaintenance > 0 ? 'text-danger' : 'text-ink-soft'}>
                      {r.openMaintenance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink-soft">
                    {r.nextCleaning ? formatDate(r.nextCleaning.date) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-2 font-medium text-ink">
                <td className="px-4 py-3">Gesamt ({rows.length})</td>
                <td className="px-4 py-3 text-right">Ø {avgOccupancy}%</td>
                <td className="px-4 py-3 text-right">{formatCurrency(totalRevenue)}</td>
                <td className="px-4 py-3 text-right">{totalOpenMaintenance}</td>
                <td className="px-4 py-3 text-right">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
