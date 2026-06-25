import { useState } from 'react';
import type { Property } from '@/types';
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
import { Input, Label, Textarea } from '@/components/ui/input';
import { AmenitiesEditor } from '@/features/property/AmenitiesEditor';

const EMPTY = {
  name: '',
  address: '',
  type: '',
  sizeSqm: '',
  rooms: '',
  beds: '',
  amenities: [] as string[],
  wifiName: '',
  wifiPassword: '',
  doorCode: '',
  notes: '',
};

function fromProperty(property?: Property) {
  if (!property) return EMPTY;
  return {
    name: property.name,
    address: property.address,
    type: property.type,
    sizeSqm: String(property.sizeSqm),
    rooms: String(property.rooms),
    beds: String(property.beds),
    amenities: property.amenities,
    wifiName: property.access.wifiName,
    wifiPassword: property.access.wifiPassword,
    doorCode: property.access.doorCode ?? '',
    notes: property.access.notes ?? '',
  };
}

/** Parses a non-negative-integer field. Returns null (invalid) instead of silently coercing to 0. */
function parseNonNegativeInt(raw: string): number | null {
  if (raw.trim() === '') return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null;
  return n;
}

export function EditPropertyDialog({
  property,
  trigger,
}: {
  property?: Property;
  trigger?: React.ReactNode;
}) {
  const addProperty = useAppStore((s) => s.addProperty);
  const updateProperty = useAppStore((s) => s.updateProperty);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(fromProperty(property));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function reset() {
    setForm(fromProperty(property));
    setErrors({});
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Name ist erforderlich.';

    const sizeSqm = parseNonNegativeInt(form.sizeSqm);
    if (sizeSqm === null) nextErrors.sizeSqm = 'Bitte eine gültige Zahl ≥ 0 eingeben.';
    const rooms = parseNonNegativeInt(form.rooms);
    if (rooms === null) nextErrors.rooms = 'Bitte eine gültige Zahl ≥ 0 eingeben.';
    const beds = parseNonNegativeInt(form.beds);
    if (beds === null) nextErrors.beds = 'Bitte eine gültige Zahl ≥ 0 eingeben.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const patch = {
      name: form.name.trim(),
      address: form.address.trim(),
      type: form.type.trim(),
      sizeSqm: sizeSqm as number,
      rooms: rooms as number,
      beds: beds as number,
      amenities: form.amenities,
      access: {
        wifiName: form.wifiName.trim(),
        wifiPassword: form.wifiPassword.trim(),
        doorCode: form.doorCode.trim() || undefined,
        notes: form.notes.trim() || undefined,
      },
      contactIds: property?.contactIds ?? [],
    };

    try {
      if (property) {
        await updateProperty(property.id, patch);
        toast('Immobilie gespeichert', 'success');
      } else {
        await addProperty(patch);
        toast('Immobilie angelegt', 'success');
      }
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
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Bearbeiten</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? 'Immobilie bearbeiten' : 'Neue Immobilie'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="type">Typ</Label>
            <Input id="type" value={form.type} onChange={(e) => set('type', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="sizeSqm">Größe (m²)</Label>
              <Input
                id="sizeSqm"
                type="number"
                min={0}
                value={form.sizeSqm}
                onChange={(e) => set('sizeSqm', e.target.value)}
              />
              {errors.sizeSqm && <p className="mt-1 text-xs text-danger">{errors.sizeSqm}</p>}
            </div>
            <div>
              <Label htmlFor="rooms">Zimmer</Label>
              <Input
                id="rooms"
                type="number"
                min={0}
                value={form.rooms}
                onChange={(e) => set('rooms', e.target.value)}
              />
              {errors.rooms && <p className="mt-1 text-xs text-danger">{errors.rooms}</p>}
            </div>
            <div>
              <Label htmlFor="beds">Betten</Label>
              <Input
                id="beds"
                type="number"
                min={0}
                value={form.beds}
                onChange={(e) => set('beds', e.target.value)}
              />
              {errors.beds && <p className="mt-1 text-xs text-danger">{errors.beds}</p>}
            </div>
          </div>
          <div>
            <Label>Ausstattung</Label>
            <AmenitiesEditor value={form.amenities} onChange={(next) => set('amenities', next)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wifiName">WLAN-Name</Label>
              <Input id="wifiName" value={form.wifiName} onChange={(e) => set('wifiName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wifiPassword">WLAN-Passwort</Label>
              <Input
                id="wifiPassword"
                value={form.wifiPassword}
                onChange={(e) => set('wifiPassword', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="doorCode">Türcode</Label>
            <Input id="doorCode" value={form.doorCode} onChange={(e) => set('doorCode', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">{property ? 'Speichern' : 'Anlegen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
