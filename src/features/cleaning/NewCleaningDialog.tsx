import { useState } from 'react';
import type { CleaningTask, Contact } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label, NativeSelect } from '@/components/ui/input';
import { useToast } from '@/components/shared/Toast';

export function NewCleaningDialog({
  propertyId,
  contacts,
  onCreate,
}: {
  propertyId: string;
  contacts: Contact[];
  onCreate: (task: Omit<CleaningTask, 'id'>) => Promise<CleaningTask>;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [cleanerId, setCleanerId] = useState('');

  // Putzkräfte bevorzugt oben anzeigen, aber alle Kontakte erlauben.
  const sortedContacts = [...contacts].sort((a, b) => {
    const aIsCleaner = a.role === 'putzkraft' ? 0 : 1;
    const bIsCleaner = b.role === 'putzkraft' ? 0 : 1;
    return aIsCleaner - bIsCleaner;
  });

  function reset() {
    setDate('');
    setCleanerId('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !cleanerId) return;
    try {
      await onCreate({
        propertyId,
        date,
        cleanerId,
        status: 'geplant',
        autoSuggested: false,
      });
      toast('Reinigungstermin angelegt', 'success');
      reset();
      setOpen(false);
    } catch {
      toast('Termin konnte nicht angelegt werden', 'error');
    }
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
        <Button>+ Neuer Termin</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Reinigungstermin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="cleaning-date">Datum</Label>
            <Input
              id="cleaning-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="cleaning-cleaner">Putzkraft</Label>
            <NativeSelect
              id="cleaning-cleaner"
              value={cleanerId}
              onChange={(e) => setCleanerId(e.target.value)}
              required
            >
              <option value="">— Putzkraft wählen —</option>
              {sortedContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.role !== 'putzkraft' ? ` (${c.role})` : ''}
                </option>
              ))}
            </NativeSelect>
          </div>
          <DialogFooter>
            <Button type="submit">Termin anlegen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
