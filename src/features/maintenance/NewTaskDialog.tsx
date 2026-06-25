import { useState } from 'react';
import type { Contact, MaintCategory, MaintenanceTask, Priority } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label, NativeSelect, Textarea } from '@/components/ui/input';

const CATEGORIES: MaintCategory[] = ['elektrik', 'sanitär', 'möbel', 'haushaltsgerät', 'sonstiges'];
const PRIORITIES: Priority[] = ['niedrig', 'mittel', 'hoch', 'dringend'];

export function NewTaskDialog({
  propertyId,
  contacts,
  onCreate,
}: {
  propertyId: string;
  contacts: Contact[];
  onCreate: (task: Omit<MaintenanceTask, 'id'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintCategory>('sonstiges');
  const [priority, setPriority] = useState<Priority>('mittel');
  const [assigneeId, setAssigneeId] = useState('');
  const [notes, setNotes] = useState('');

  function reset() {
    setTitle('');
    setCategory('sonstiges');
    setPriority('mittel');
    setAssigneeId('');
    setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    onCreate({
      propertyId,
      title,
      category,
      priority,
      status: 'offen',
      assigneeId: assigneeId || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>+ Neue Aufgabe</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Aufgabe</DialogTitle>
        </DialogHeader>
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
            <Label htmlFor="notes">Notiz</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">Aufgabe anlegen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
