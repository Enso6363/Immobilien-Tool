import { useMemo, useState } from 'react';
import { addDays, addMonths, addYears, format, subDays, subMonths, subYears } from 'date-fns';
import { ChevronLeft, ChevronRight, Euro } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Booking, MaintenanceTask } from '@/types';
import { maintenanceCostInRange, revenueBreakdown, type RevenueGranularity } from '@/lib/revenue';

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-surface-2 px-3 py-2">
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="font-display text-base text-ink">{value}</span>
    </div>
  );
}

const GRANULARITY_OPTIONS: { key: RevenueGranularity; label: string }[] = [
  { key: 'day', label: 'Tag' },
  { key: 'month', label: 'Monat' },
  { key: 'year', label: 'Jahr' },
];

function step(reference: Date, granularity: RevenueGranularity, dir: 1 | -1): Date {
  if (granularity === 'day') return dir === 1 ? addDays(reference, 1) : subDays(reference, 1);
  if (granularity === 'year') return dir === 1 ? addYears(reference, 1) : subYears(reference, 1);
  return dir === 1 ? addMonths(reference, 1) : subMonths(reference, 1);
}

function rangeLabel(reference: Date, granularity: RevenueGranularity): string {
  if (granularity === 'day') return formatDate(format(reference, 'yyyy-MM-dd'));
  if (granularity === 'year') return reference.getFullYear().toString();
  return reference.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

export function RevenueDetailDialog({
  open,
  onClose,
  bookings,
  maintenanceTasks,
  initialReference,
}: {
  open: boolean;
  onClose: () => void;
  bookings: Booking[];
  maintenanceTasks: MaintenanceTask[];
  initialReference: Date;
}) {
  const [granularity, setGranularity] = useState<RevenueGranularity>('month');
  const [reference, setReference] = useState(initialReference);

  const breakdown = useMemo(() => revenueBreakdown(bookings, reference, granularity), [bookings, reference, granularity]);
  const maintenanceCost = useMemo(
    () => maintenanceCostInRange(maintenanceTasks, reference, granularity),
    [maintenanceTasks, reference, granularity],
  );
  const netRevenue = breakdown.gross - maintenanceCost;
  const label = rangeLabel(reference, granularity);
  const { lines, gross, adr, revpar, occupiedNights, availableNights } = breakdown;

  function handleOpenChange(o: boolean) {
    if (!o) {
      onClose();
      return;
    }
    setGranularity('month');
    setReference(initialReference);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Umsatz · {label}</DialogTitle>
          <DialogDescription>So setzt sich der Umsatz für diesen Zeitraum zusammen.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 rounded-md bg-surface-2 p-1">
            {GRANULARITY_OPTIONS.map((g) => (
              <Button
                key={g.key}
                type="button"
                size="sm"
                variant={granularity === g.key ? 'default' : 'ghost'}
                onClick={() => setGranularity(g.key)}
              >
                {g.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Vorheriger Zeitraum"
              onClick={() => setReference((r) => step(r, granularity, -1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Nächster Zeitraum"
              onClick={() => setReference((r) => step(r, granularity, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {lines.length === 0 ? (
          <EmptyState icon={Euro} title="Kein Umsatz" description="Für diesen Zeitraum liegen keine umsatzrelevanten Buchungen vor." />
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-line">
              {lines.map((l) => (
                <li key={l.booking.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{l.booking.guestName}</span>
                    <span className="text-xs text-ink-soft">
                      {formatDate(l.booking.checkIn)} – {formatDate(l.booking.checkOut)} · {l.nights} Nächte ×{' '}
                      {formatCurrency(l.pricePerNight)}
                    </span>
                  </div>
                  <span className="font-medium text-ink">{formatCurrency(l.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-center justify-between border-t border-line pt-3 text-sm">
              <span className="font-medium text-ink-soft">Brutto-Umsatz</span>
              <span className="font-display text-lg text-ink">{formatCurrency(gross)}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Kpi label="Netto (− Kosten)" value={formatCurrency(netRevenue)} />
              <Kpi label="ADR (Ø Preis/Nacht)" value={formatCurrency(adr)} />
              <Kpi label="RevPAR" value={formatCurrency(revpar)} />
              <Kpi label="Belegte Nächte" value={`${occupiedNights} / ${availableNights}`} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
