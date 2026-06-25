import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useActiveCleaningTasks, useAppStore } from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { CleaningRow } from '@/features/cleaning/CleaningRow';
import { NewCleaningDialog } from '@/features/cleaning/NewCleaningDialog';
import { Button } from '@/components/ui/button';

type Filter = 'anstehend' | 'erledigt' | 'alle';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'anstehend', label: 'Anstehend' },
  { key: 'erledigt', label: 'Erledigt' },
  { key: 'alle', label: 'Alle' },
];

export function CleaningView() {
  const tasks = useActiveCleaningTasks();
  const activePropertyId = useAppStore((s) => s.activePropertyId);
  const contacts = useAppStore((s) => s.contacts);
  const addCleaningTask = useAppStore((s) => s.addCleaningTask);
  const updateCleaningTask = useAppStore((s) => s.updateCleaningTask);
  const deleteCleaningTask = useAppStore((s) => s.deleteCleaningTask);
  const [filter, setFilter] = useState<Filter>('anstehend');

  if (!activePropertyId) return null;

  const filtered = tasks
    .filter((t) => {
      if (filter === 'anstehend') return t.status === 'geplant';
      if (filter === 'erledigt') return t.status === 'erledigt';
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Reinigung"
        description="Reinigungstermine der aktuellen Immobilie."
        action={
          <NewCleaningDialog
            propertyId={activePropertyId}
            contacts={contacts}
            onCreate={(t) => addCleaningTask(t)}
          />
        }
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Sparkles} title="Keine Einträge" description="Für diesen Filter liegen keine Reinigungstermine vor." />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((task) => (
            <CleaningRow
              key={task.id}
              task={task}
              cleaner={contacts.find((c) => c.id === task.cleanerId)}
              onMarkDone={() =>
                updateCleaningTask(task.id, { status: 'erledigt', completedAt: new Date().toISOString() })
              }
              onMarkNoShow={() => updateCleaningTask(task.id, { status: 'nicht_erschienen' })}
              onDelete={() => deleteCleaningTask(task.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
