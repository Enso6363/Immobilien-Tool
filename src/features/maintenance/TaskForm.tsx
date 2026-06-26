import { useState } from 'react';
import type { Contact, MaintCategory, MaintenanceTask, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input, Label, NativeSelect, Textarea } from '@/components/ui/input';

const CATEGORIES: MaintCategory[] = ['elektrik', 'sanitär', 'möbel', 'haushaltsgerät', 'sonstiges'];
const PRIORITIES: Priority[] = ['niedrig', 'mittel', 'hoch', 'dringend'];

export interface TaskFormValues {
  title: string;
  category: MaintCategory;
  priority: Priority;
  assigneeId?: string;
  cost?: number;
  notes?: string;
}

export function TaskForm({
  contacts,
  initial,
  submitLabel,
  onSubmit,
}: {
  contacts: Contact[];
  initial?: MaintenanceTask;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<MaintCategory>(initial?.category ?? 'sonstiges');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'mittel');
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? '');
  const [cost, setCost] = useState(initial?.cost != null ? String(initial.cost) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    const costNum = cost.trim() === '' ? undefined : Number(cost);
    onSubmit({
      title,
      category,
      priority,
      assigneeId: assigneeId || undefined,
      cost: costNum != null && !Number.isNaN(costNum) ? costNum : undefined,
      notes: notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="title">Titel</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Kategorie</Label>
          <NativeSelect id="category" value={category} onChange={(e) => setCategory(e.target.value as MaintCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="priority">Priorität</Label>
          <NativeSelect id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="assignee">Handwerker</Label>
          <NativeSelect id="assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">— keiner zugewiesen —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="cost">Kosten (€)</Label>
          <Input
            id="cost"
            type="number"
            min={0}
            step="0.01"
            placeholder="optional"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notiz</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="mt-2 flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
