import { useNavigate } from 'react-router-dom';
import type { CleaningTask, MaintenanceTask } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusPill, cleaningTone, maintTone } from '@/components/shared/StatusPill';
import { formatDate } from '@/lib/format';
import { CheckCircle2 } from 'lucide-react';

export function TasksWidget({
  maintenanceTasks,
  cleaningTasks,
}: {
  maintenanceTasks: MaintenanceTask[];
  cleaningTasks: CleaningTask[];
}) {
  const navigate = useNavigate();
  const openMaintenance = maintenanceTasks.filter((t) => t.status !== 'erledigt');
  const upcomingCleaning = cleaningTasks.filter((t) => t.status === 'geplant');

  if (openMaintenance.length === 0 && upcomingCleaning.length === 0) {
    return <EmptyState icon={CheckCircle2} title="Alles erledigt" description="Keine offenen Aufgaben." />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {openMaintenance.map((t) => (
        <li key={t.id}>
          <button
            onClick={() => navigate('/instandhaltung')}
            className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-left hover:shadow-sm"
          >
            <span className="text-sm text-ink">{t.title}</span>
            <StatusPill tone={maintTone(t.status)}>{t.status.replace('_', ' ')}</StatusPill>
          </button>
        </li>
      ))}
      {upcomingCleaning.map((t) => (
        <li key={t.id}>
          <button
            onClick={() => navigate('/reinigung')}
            className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-left hover:shadow-sm"
          >
            <span className="text-sm text-ink">Reinigung am {formatDate(t.date)}</span>
            <StatusPill tone={cleaningTone(t.status)}>{t.status}</StatusPill>
          </button>
        </li>
      ))}
    </ul>
  );
}
