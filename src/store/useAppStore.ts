import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type {
  Property,
  Booking,
  CleaningTask,
  MaintenanceTask,
  Contact,
  ID,
} from '@/types';
import { propertyService } from '@/services/propertyService';
import { bookingService } from '@/services/bookingService';
import { cleaningService } from '@/services/cleaningService';
import { maintenanceService } from '@/services/maintenanceService';
import { contactService } from '@/services/contactService';

interface AppState {
  loaded: boolean;
  properties: Property[];
  activePropertyId: ID | null;
  bookings: Booking[];
  cleaningTasks: CleaningTask[];
  maintenanceTasks: MaintenanceTask[];
  contacts: Contact[];

  init: () => Promise<void>;
  setActiveProperty: (id: ID) => void;

  addBooking: (booking: Omit<Booking, 'id'>) => Promise<Booking>;
  updateBooking: (id: ID, patch: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: ID) => Promise<void>;

  addCleaningTask: (task: Omit<CleaningTask, 'id'>) => Promise<CleaningTask>;
  updateCleaningTask: (id: ID, patch: Partial<CleaningTask>) => Promise<void>;
  deleteCleaningTask: (id: ID) => Promise<void>;

  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id'>) => Promise<MaintenanceTask>;
  updateMaintenanceTask: (id: ID, patch: Partial<MaintenanceTask>) => Promise<void>;
  deleteMaintenanceTask: (id: ID) => Promise<void>;

  addProperty: (property: Omit<Property, 'id'>) => Promise<Property>;
  updateProperty: (id: ID, patch: Partial<Property>) => Promise<void>;
  deleteProperty: (id: ID) => Promise<void>;

  addContact: (c: Omit<Contact, 'id'>) => Promise<Contact>;
  updateContact: (id: ID, patch: Partial<Contact>) => Promise<void>;
  deleteContact: (id: ID) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  loaded: false,
  properties: [],
  activePropertyId: null,
  bookings: [],
  cleaningTasks: [],
  maintenanceTasks: [],
  contacts: [],

  init: async () => {
    const [properties, bookings, cleaningTasks, maintenanceTasks, contacts] = await Promise.all([
      propertyService.getAll(),
      bookingService.getAll(),
      cleaningService.getAll(),
      maintenanceService.getAll(),
      contactService.getAll(),
    ]);
    // Auto-Vorschlag Reinigung nach Abreise. Idempotent: erzeugt fehlende
    // Tasks und persistiert sie über den cleaningService.
    const cleaningWithSuggestions = await autoSuggestCleanings(
      bookings,
      cleaningTasks,
      properties,
      contacts,
    );

    set({
      properties,
      bookings,
      cleaningTasks: cleaningWithSuggestions,
      maintenanceTasks,
      contacts,
      activePropertyId: properties[0]?.id ?? null,
      loaded: true,
    });
  },

  setActiveProperty: (id) => set({ activePropertyId: id }),

  addBooking: async (booking) => {
    const created = await bookingService.create(booking);
    set({ bookings: [...get().bookings, created] });
    return created;
  },
  updateBooking: async (id, patch) => {
    const updated = await bookingService.update(id, patch);
    if (!updated) return;
    set({ bookings: get().bookings.map((b) => (b.id === id ? updated : b)) });
  },
  deleteBooking: async (id) => {
    await bookingService.remove(id);
    set({ bookings: get().bookings.filter((b) => b.id !== id) });
  },

  addCleaningTask: async (task) => {
    const created = await cleaningService.create(task);
    set({ cleaningTasks: [...get().cleaningTasks, created] });
    return created;
  },
  updateCleaningTask: async (id, patch) => {
    const updated = await cleaningService.update(id, patch);
    if (!updated) return;
    set({ cleaningTasks: get().cleaningTasks.map((c) => (c.id === id ? updated : c)) });
  },
  deleteCleaningTask: async (id) => {
    await cleaningService.remove(id);
    set({ cleaningTasks: get().cleaningTasks.filter((c) => c.id !== id) });
  },

  addMaintenanceTask: async (task) => {
    const created = await maintenanceService.create(task);
    set({ maintenanceTasks: [...get().maintenanceTasks, created] });
    return created;
  },
  updateMaintenanceTask: async (id, patch) => {
    const updated = await maintenanceService.update(id, patch);
    if (!updated) return;
    set({ maintenanceTasks: get().maintenanceTasks.map((m) => (m.id === id ? updated : m)) });
  },
  deleteMaintenanceTask: async (id) => {
    await maintenanceService.remove(id);
    set({ maintenanceTasks: get().maintenanceTasks.filter((m) => m.id !== id) });
  },

  addProperty: async (property) => {
    const created = await propertyService.create(property);
    set({
      properties: [...get().properties, created],
      activePropertyId: get().activePropertyId ?? created.id,
    });
    return created;
  },
  updateProperty: async (id, patch) => {
    const updated = await propertyService.update(id, patch);
    if (!updated) return;
    set({ properties: get().properties.map((p) => (p.id === id ? updated : p)) });
  },
  deleteProperty: async (id) => {
    await propertyService.remove(id);
    await Promise.all([
      ...get()
        .bookings.filter((b) => b.propertyId === id)
        .map((b) => bookingService.remove(b.id)),
      ...get()
        .cleaningTasks.filter((c) => c.propertyId === id)
        .map((c) => cleaningService.remove(c.id)),
      ...get()
        .maintenanceTasks.filter((m) => m.propertyId === id)
        .map((m) => maintenanceService.remove(m.id)),
    ]);
    const remaining = get().properties.filter((p) => p.id !== id);
    set({
      properties: remaining,
      bookings: get().bookings.filter((b) => b.propertyId !== id),
      cleaningTasks: get().cleaningTasks.filter((c) => c.propertyId !== id),
      maintenanceTasks: get().maintenanceTasks.filter((m) => m.propertyId !== id),
      activePropertyId:
        get().activePropertyId === id ? remaining[0]?.id ?? null : get().activePropertyId,
    });
  },

  addContact: async (c) => {
    const created = await contactService.create(c);
    set({ contacts: [...get().contacts, created] });
    return created;
  },
  updateContact: async (id, patch) => {
    const updated = await contactService.update(id, patch);
    if (!updated) return;
    set({ contacts: get().contacts.map((c) => (c.id === id ? updated : c)) });
  },
  deleteContact: async (id) => {
    await contactService.remove(id);
    set({ contacts: get().contacts.filter((c) => c.id !== id) });
  },
}));

/**
 * Idempotent: stellt sicher, dass für jede Buchung (außer 'storniert'/'angefragt')
 * ein Reinigungs-Task mit linkedBookingId am checkOut existiert. Dedupe über
 * vorhandene linkedBookingId. Neu erzeugte Tasks werden via cleaningService
 * persistiert. Gibt die zusammengeführte Liste zurück.
 */
async function autoSuggestCleanings(
  bookings: Booking[],
  cleaningTasks: CleaningTask[],
  properties: Property[],
  contacts: Contact[],
): Promise<CleaningTask[]> {
  const linkedIds = new Set(
    cleaningTasks.filter((c) => c.linkedBookingId != null).map((c) => c.linkedBookingId),
  );

  const result = [...cleaningTasks];

  for (const booking of bookings) {
    if (booking.status === 'storniert' || booking.status === 'angefragt') continue;
    if (linkedIds.has(booking.id)) continue;

    const property = properties.find((p) => p.id === booking.propertyId);
    const propContacts = property
      ? contacts.filter((c) => property.contactIds.includes(c.id))
      : [];
    const cleaner = propContacts.find((c) => c.role === 'putzkraft') ?? propContacts[0];
    if (!cleaner) continue; // ohne Kontakt kein sinnvoller Task

    const created = await cleaningService.create({
      propertyId: booking.propertyId,
      date: booking.checkOut,
      cleanerId: cleaner.id,
      status: 'geplant',
      autoSuggested: true,
      linkedBookingId: booking.id,
    });
    linkedIds.add(booking.id);
    result.push(created);
  }

  return result;
}

// Abgeleitete Selektoren — nach aktiver Immobilie gefiltert.
// useShallow verhindert, dass der gefilterte Array-Literal bei jedem Aufruf eine
// neue Referenz erzeugt (sonst Endlosschleife in useSyncExternalStore).
export function useActiveProperty() {
  return useAppStore((s) => s.properties.find((p) => p.id === s.activePropertyId));
}
export function useActiveBookings() {
  return useAppStore(useShallow((s) => s.bookings.filter((b) => b.propertyId === s.activePropertyId)));
}
export function useActiveCleaningTasks() {
  return useAppStore(
    useShallow((s) => s.cleaningTasks.filter((c) => c.propertyId === s.activePropertyId)),
  );
}
export function useActiveMaintenanceTasks() {
  return useAppStore(
    useShallow((s) => s.maintenanceTasks.filter((m) => m.propertyId === s.activePropertyId)),
  );
}
