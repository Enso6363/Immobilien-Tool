import { ChevronLeft, ChevronRight } from 'lucide-react';
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
}: {
  task: MaintenanceTask;
  assignee: Contact | undefined;
  onMove: (status: MaintStatus) => void;
}) {
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

      <div className="mt-1 flex justify-between">
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
    </div>
  );
}
