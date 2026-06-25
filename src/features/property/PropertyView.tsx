import { useState } from 'react';
import { Phone, Mail, FileText, Pencil, X } from 'lucide-react';
import { useActiveProperty, useAppStore } from '@/store/useAppStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { AccessField } from '@/features/property/AccessField';
import { EditPropertyDialog } from '@/features/property/EditPropertyDialog';
import { EditContactDialog } from '@/features/property/EditContactDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/shared/Toast';

export function PropertyView() {
  const property = useActiveProperty();
  const contacts = useAppStore((s) => s.contacts);
  const updateProperty = useAppStore((s) => s.updateProperty);
  const deleteProperty = useAppStore((s) => s.deleteProperty);
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!property) return null;

  const propertyId = property.id;
  const propertyContactIds = property.contactIds;
  const propertyContacts = contacts.filter((c) => propertyContactIds.includes(c.id));

  async function handleUnlink(contactId: string) {
    try {
      await updateProperty(propertyId, {
        contactIds: propertyContactIds.filter((id) => id !== contactId),
      });
      toast('Kontakt entfernt', 'success');
    } catch {
      toast('Entfernen fehlgeschlagen', 'error');
    }
  }

  async function handleDeleteProperty() {
    try {
      await deleteProperty(propertyId);
      toast('Immobilie gelöscht', 'success');
    } catch {
      toast('Löschen fehlgeschlagen', 'error');
    } finally {
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={property.name}
        description={property.address}
        action={
          <div className="flex items-center gap-2">
            <EditPropertyDialog property={property} />
            {confirmDelete ? (
              <>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Abbrechen
                </Button>
                <Button variant="destructive" onClick={handleDeleteProperty}>
                  Wirklich löschen?
                </Button>
              </>
            ) : (
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                Löschen
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-4">
          <h3 className="mb-3 font-display text-base text-ink">Objektdaten</h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between border-b border-line py-1.5">
              <dt className="text-ink-soft">Typ</dt>
              <dd className="text-ink">{property.type}</dd>
            </div>
            <div className="flex justify-between border-b border-line py-1.5">
              <dt className="text-ink-soft">Größe</dt>
              <dd className="text-ink">{property.sizeSqm} m²</dd>
            </div>
            <div className="flex justify-between border-b border-line py-1.5">
              <dt className="text-ink-soft">Zimmer</dt>
              <dd className="text-ink">{property.rooms}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-ink-soft">Betten</dt>
              <dd className="text-ink">{property.beds}</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.amenities.map((a) => (
              <span key={a} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink-soft">
                {a}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-4">
          <h3 className="mb-3 font-display text-base text-ink">Zugangsdaten</h3>
          <AccessField label="WLAN-Name" value={property.access.wifiName} />
          <AccessField label="WLAN-Passwort" value={property.access.wifiPassword} />
          {property.access.doorCode && <AccessField label="Türcode" value={property.access.doorCode} />}
          {property.access.notes && (
            <p className="mt-3 rounded-md bg-surface-2 p-2 text-sm text-ink-soft">{property.access.notes}</p>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base text-ink">Kontakte</h3>
            <EditContactDialog
              propertyId={property.id}
              trigger={
                <Button variant="outline" size="sm">
                  + Kontakt
                </Button>
              }
            />
          </div>
          {propertyContacts.length === 0 ? (
            <p className="text-sm text-ink-soft">Keine Kontakte verknüpft.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {propertyContacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="text-xs capitalize text-ink-soft">{c.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-ink-soft">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-ink">
                        <Phone size={14} /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-ink">
                        <Mail size={14} />
                      </a>
                    )}
                    <EditContactDialog
                      propertyId={property.id}
                      contact={c}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`${c.name} bearbeiten`}>
                          <Pencil size={14} />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${c.name} entfernen`}
                      onClick={() => handleUnlink(c.id)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-4">
          <h3 className="mb-3 font-display text-base text-ink">Dokumente & Notizen</h3>
          <EmptyState icon={FileText} title="Noch keine Dokumente" description="Dieser Bereich folgt in einer späteren Phase." />
        </section>
      </div>
    </div>
  );
}
