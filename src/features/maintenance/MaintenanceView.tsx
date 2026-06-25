import type { MaintStatus } from '@/types';
import { useActiveMaintenanceTasks, useAppStore } from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TaskCard } from '@/features/maintenance/TaskCard';
import { NewTaskDialog } from '@/features/maintenance/NewTaskDialog';
import { Wrench } from 'lucide-react';

const COLUMNS: { key: MaintStatus; label: string }[] = [
  { key: 'offen', label: 'Offen' },
  { key: 'in_bearbeitung', label: 'In Bearbeitung' },
  { key: 'erledigt', label: 'Erledigt' },
];

export function MaintenanceView() {
  const tasks = useActiveMaintenanceTasks();
  const activePropertyId = useAppStore((s) => s.activePropertyId);
  const contacts = useAppStore((s) => s.contacts);
  const updateMaintenanceTask = useAppStore((s) => s.updateMaintenanceTask);
  const addMaintenanceTask = useAppStore((s) => s.addMaintenanceTask);

  if (!activePropertyId) return null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Instandhaltung"
        description="Reparaturen und Aufgaben der aktuellen Immobilie."
        action={
          <NewTaskDialog propertyId={activePropertyId} contacts={contacts} onCreate={(t) => addMaintenanceTask(t)} />
        }
      />

      {tasks.length === 0 ? (
        <EmptyState icon={Wrench} title="Keine Aufgaben" description="Für diese Immobilie liegen noch keine Instandhaltungsaufgaben vor." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm font-medium text-ink-soft">
                  <span>{col.label}</span>
                  <span>{colTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={contacts.find((c) => c.id === task.assigneeId)}
                      onMove={(status) => updateMaintenanceTask(task.id, { status })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
