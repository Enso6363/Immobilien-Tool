import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { MaintenanceTask, MaintStatus, Contact } from '@/types';
import { StatusPill, priorityTone } from '@/components/shared/StatusPill';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

const ORDER: MaintStatus[] = ['offen', 'in_bearbeitung', 'erledigt'];

export function TaskCard({
  task,
  assignee,
  onMove,
  onDelete,
}: {
  task: MaintenanceTask;
  assignee: Contact | undefined;
  onMove: (status: MaintStatus) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const idx = ORDER.indexOf(task.status);
  const isUrgent = task.priority === 'dringend';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border bg-surface p-3 shadow-sm',
        isUrgent ? 'border-danger/50' : 'border-line',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-ink">{task.title}</span>
        <StatusPill tone={priorityTone(task.priority)}>{task.priority}</StatusPill>
      </div>
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span className="capitalize">{task.category}</span>
        {task.cost != null && <span>{formatCurrency(task.cost)}</span>}
      </div>
      {assignee && <span className="text-xs text-ink-soft">Handwerker: {assignee.name}</span>}

      <div className="mt-1 flex items-center justify-between">
        <div className="flex">
          <Button
            size="sm"
            variant="ghost"
            disabled={idx === 0}
            onClick={() => onMove(ORDER[idx - 1])}
            aria-label="Zurück"
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={idx === ORDER.length - 1}
            onClick={() => onMove(ORDER[idx + 1])}
            aria-label="Vorwärts"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
        <Button
          size="sm"
          variant={confirmDelete ? 'destructive' : 'ghost'}
          onClick={() => {
            if (confirmDelete) {
              onDelete();
            } else {
              setConfirmDelete(true);
            }
          }}
          onBlur={() => setConfirmDelete(false)}
          aria-label="Löschen"
        >
          {confirmDelete ? 'Wirklich?' : <Trash2 size={14} />}
        </Button>
      </div>
    </div>
  );
}
