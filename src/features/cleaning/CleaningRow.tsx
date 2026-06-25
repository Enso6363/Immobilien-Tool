import { Sparkles, Trash2 } from 'lucide-react';
import type { CleaningTask, Contact } from '@/types';
import { StatusPill, cleaningTone } from '@/components/shared/StatusPill';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime } from '@/lib/format';

export function CleaningRow({
  task,
  cleaner,
  onMarkDone,
  onMarkNoShow,
  onDelete,
}: {
  task: CleaningTask;
  cleaner: Contact | undefined;
  onMarkDone: () => void;
  onMarkNoShow: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-2 font-medium text-ink">
          {formatDate(task.date)}
          {task.autoSuggested && (
            <span title="Automatisch nach Abreise vorgeschlagen">
              <Sparkles size={14} className="text-accent" aria-hidden />
            </span>
          )}
        </span>
        <span className="text-xs text-ink-soft">
          {cleaner?.name ?? 'Unbekannte Putzkraft'}
          {task.completedAt && ` · erledigt ${formatDateTime(task.completedAt)}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill tone={cleaningTone(task.status)}>{task.status.replace('_', ' ')}</StatusPill>
        {task.status === 'geplant' && (
          <>
            <Button size="sm" variant="secondary" onClick={onMarkDone}>
              Erledigt / war da
            </Button>
            <Button size="sm" variant="ghost" onClick={onMarkNoShow}>
              Nicht erschienen
            </Button>
          </>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          aria-label="Termin löschen"
          title="Löschen"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </li>
  );
}
