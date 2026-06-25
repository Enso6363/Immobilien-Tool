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

export function EditPropertyDialog({ property }: { property: Property }) {
  const updateProperty = useAppStore((s) => s.updateProperty);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const [type, setType] = useState(property.type);
  const [sizeSqm, setSizeSqm] = useState(String(property.sizeSqm));
  const [rooms, setRooms] = useState(String(property.rooms));
  const [beds, setBeds] = useState(String(property.beds));
  const [amenities, setAmenities] = useState(property.amenities.join(', '));
  const [wifiName, setWifiName] = useState(property.access.wifiName);
  const [wifiPassword, setWifiPassword] = useState(property.access.wifiPassword);
  const [doorCode, setDoorCode] = useState(property.access.doorCode ?? '');
  const [notes, setNotes] = useState(property.access.notes ?? '');

  function reset() {
    setName(property.name);
    setAddress(property.address);
    setType(property.type);
    setSizeSqm(String(property.sizeSqm));
    setRooms(String(property.rooms));
    setBeds(String(property.beds));
    setAmenities(property.amenities.join(', '));
    setWifiName(property.access.wifiName);
    setWifiPassword(property.access.wifiPassword);
    setDoorCode(property.access.doorCode ?? '');
    setNotes(property.access.notes ?? '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateProperty(property.id, {
        name: name.trim(),
        address: address.trim(),
        type: type.trim(),
        sizeSqm: Number(sizeSqm) || 0,
        rooms: Number(rooms) || 0,
        beds: Number(beds) || 0,
        amenities: amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        access: {
          wifiName: wifiName.trim(),
          wifiPassword: wifiPassword.trim(),
          doorCode: doorCode.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast('Immobilie gespeichert', 'success');
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
        <Button variant="outline">Bearbeiten</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Immobilie bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="type">Typ</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="sizeSqm">Größe (m²)</Label>
              <Input
                id="sizeSqm"
                type="number"
                min={0}
                value={sizeSqm}
                onChange={(e) => setSizeSqm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rooms">Zimmer</Label>
              <Input
                id="rooms"
                type="number"
                min={0}
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="beds">Betten</Label>
              <Input
                id="beds"
                type="number"
                min={0}
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="amenities">Ausstattung (kommagetrennt)</Label>
            <Input
              id="amenities"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="WLAN, Waschmaschine, Balkon"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wifiName">WLAN-Name</Label>
              <Input id="wifiName" value={wifiName} onChange={(e) => setWifiName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wifiPassword">WLAN-Passwort</Label>
              <Input
                id="wifiPassword"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="doorCode">Türcode</Label>
            <Input id="doorCode" value={doorCode} onChange={(e) => setDoorCode(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
