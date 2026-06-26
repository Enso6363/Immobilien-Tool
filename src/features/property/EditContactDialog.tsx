import { useState } from 'react';
import type { Contact, ContactRole, ID } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/shared/Toast';
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

const ROLES: ContactRole[] = ['putzkraft', 'hausmeister', 'elektriker', 'klempner', 'sonstiges'];

export function EditContactDialog({
  propertyId,
  contact,
  trigger,
}: {
  propertyId: ID;
  contact?: Contact;
  trigger: React.ReactNode;
}) {
  const addContact = useAppStore((s) => s.addContact);
  const updateContact = useAppStore((s) => s.updateContact);
  const updateProperty = useAppStore((s) => s.updateProperty);
  const deleteContact = useAppStore((s) => s.deleteContact);
  const properties = useAppStore((s) => s.properties);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(contact?.name ?? '');
  const [role, setRole] = useState<ContactRole>(contact?.role ?? 'sonstiges');
  const [phone, setPhone] = useState(contact?.phone ?? '');
  const [email, setEmail] = useState(contact?.email ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!contact) return;
    try {
      await deleteContact(contact.id);
      toast('Kontakt gelöscht', 'success');
      setOpen(false);
    } catch {
      toast('Löschen fehlgeschlagen', 'error');
    }
  }

  function reset() {
    setName(contact?.name ?? '');
    setRole(contact?.role ?? 'sonstiges');
    setPhone(contact?.phone ?? '');
    setEmail(contact?.email ?? '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const patch = {
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };
      if (contact) {
        await updateContact(contact.id, patch);
      } else {
        const created = await addContact(patch);
        const property = properties.find((p) => p.id === propertyId);
        if (property) {
          await updateProperty(propertyId, { contactIds: [...property.contactIds, created.id] });
        }
      }
      toast(contact ? 'Kontakt aktualisiert' : 'Kontakt angelegt', 'success');
      setOpen(false);
    } catch {
      toast('Speichern fehlgeschlagen', 'error');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          setConfirmDelete(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="contactName">Name</Label>
            <Input id="contactName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="contactRole">Rolle</Label>
            <NativeSelect id="contactRole" value={role} onChange={(e) => setRole(e.target.value as ContactRole)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contactPhone">Telefon</Label>
              <Input id="contactPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contactEmail">E-Mail</Label>
              <Input id="contactEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="justify-between">
            {contact && (
              <Button
                type="button"
                variant={confirmDelete ? 'destructive' : 'outline'}
                onClick={() => {
                  if (confirmDelete) {
                    handleDelete();
                  } else {
                    setConfirmDelete(true);
                  }
                }}
                onBlur={() => setConfirmDelete(false)}
              >
                {confirmDelete ? 'Wirklich löschen?' : 'Kontakt löschen'}
              </Button>
            )}
            <Button type="submit">{contact ? 'Speichern' : 'Anlegen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
