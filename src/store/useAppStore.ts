import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  Property,
  Booking,
  CleaningTask,
  MaintenanceTask,
  Contact,
  ID,
} from "@/types";
import { propertyService } from "@/services/propertyService";
import { bookingService } from "@/services/bookingService";
import { cleaningService } from "@/services/cleaningService";
import { maintenanceService } from "@/services/maintenanceService";
import { contactService } from "@/services/contactService";

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

  addBooking: (booking: Omit<Booking, "id">) => Promise<Booking>;
  updateBooking: (id: ID, patch: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: ID) => Promise<void>;

  addCleaningTask: (task: Omit<CleaningTask, "id">) => Promise<CleaningTask>;
  updateCleaningTask: (id: ID, patch: Partial<CleaningTask>) => Promise<void>;
  deleteCleaningTask: (id: ID) => Promise<void>;

  addMaintenanceTask: (
    task: Omit<MaintenanceTask, "id">,
  ) => Promise<MaintenanceTask>;
  updateMaintenanceTask: (
    id: ID,
    patch: Partial<MaintenanceTask>,
  ) => Promise<void>;
  deleteMaintenanceTask: (id: ID) => Promise<void>;

  addProperty: (property: Omit<Property, "id">) => Promise<Property>;
  updateProperty: (id: ID, patch: Partial<Property>) => Promise<void>;
  deleteProperty: (id: ID) => Promise<void>;

  addContact: (c: Omit<Contact, "id">) => Promise<Contact>;
  updateContact: (id: ID, patch: Partial<Contact>) => Promise<void>;
  deleteContact: (id: ID) => Promise<void>;
}

/** Generisches Add/Update/Remove für eine Entity-Liste im Store — erspart die immer
 *  gleiche create→set / update→set / remove→set-Schreibarbeit pro Entität. */
function listActions<T extends { id: ID }>(
  service: {
    create: (item: Omit<T, "id">) => Promise<T>;
    update: (id: ID, patch: Partial<T>) => Promise<T | undefined>;
    remove: (id: ID) => Promise<void>;
  },
  get: () => AppState,
  set: (partial: Partial<AppState>) => void,
  key: keyof AppState,
) {
  const list = () => get()[key] as unknown as T[];
  return {
    add: async (item: Omit<T, "id">) => {
      const created = await service.create(item);
      set({ [key]: [...list(), created] } as unknown as Partial<AppState>);
      return created;
    },
    update: async (id: ID, patch: Partial<T>) => {
      const updated = await service.update(id, patch);
      if (!updated) return;
      set({
        [key]: list().map((x) => (x.id === id ? updated : x)),
      } as unknown as Partial<AppState>);
    },
    remove: async (id: ID) => {
      await service.remove(id);
      set({
        [key]: list().filter((x) => x.id !== id),
      } as unknown as Partial<AppState>);
    },
  };
}

export const useAppStore = create<AppState>((set, get) => {
  const bookingActions = listActions<Booking>(
    bookingService,
    get,
    set,
    "bookings",
  );
  const cleaningActions = listActions<CleaningTask>(
    cleaningService,
    get,
    set,
    "cleaningTasks",
  );
  const maintenanceActions = listActions<MaintenanceTask>(
    maintenanceService,
    get,
    set,
    "maintenanceTasks",
  );
  const propertyActions = listActions<Property>(
    propertyService,
    get,
    set,
    "properties",
  );
  const contactActions = listActions<Contact>(
    contactService,
    get,
    set,
    "contacts",
  );

  return {
    loaded: false,
    properties: [],
    activePropertyId: null,
    bookings: [],
    cleaningTasks: [],
    maintenanceTasks: [],
    contacts: [],

    init: async () => {
      const [properties, bookings, cleaningTasks, maintenanceTasks, contacts] =
        await Promise.all([
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

    addBooking: bookingActions.add,
    updateBooking: bookingActions.update,
    deleteBooking: bookingActions.remove,

    addCleaningTask: cleaningActions.add,
    updateCleaningTask: cleaningActions.update,
    deleteCleaningTask: cleaningActions.remove,

    addMaintenanceTask: maintenanceActions.add,
    updateMaintenanceTask: maintenanceActions.update,
    deleteMaintenanceTask: maintenanceActions.remove,

    addProperty: async (property) => {
      const created = await propertyActions.add(property);
      if (get().activePropertyId === null)
        set({ activePropertyId: created.id });
      return created;
    },
    updateProperty: propertyActions.update,
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
        maintenanceTasks: get().maintenanceTasks.filter(
          (m) => m.propertyId !== id,
        ),
        activePropertyId:
          get().activePropertyId === id
            ? (remaining[0]?.id ?? null)
            : get().activePropertyId,
      });
    },

    addContact: contactActions.add,
    updateContact: contactActions.update,
    deleteContact: async (id) => {
      await contactService.remove(id);
      const affectedProperties = get().properties.filter((p) =>
        p.contactIds.includes(id),
      );
      await Promise.all(
        affectedProperties.map((p) =>
          propertyService.update(p.id, {
            contactIds: p.contactIds.filter((cid) => cid !== id),
          }),
        ),
      );
      set({
        contacts: get().contacts.filter((c) => c.id !== id),
        properties: get().properties.map((p) =>
          p.contactIds.includes(id)
            ? { ...p, contactIds: p.contactIds.filter((cid) => cid !== id) }
            : p,
        ),
      });
    },
  };
});

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
    cleaningTasks
      .filter((c) => c.linkedBookingId != null)
      .map((c) => c.linkedBookingId),
  );

  const result = [...cleaningTasks];

  for (const booking of bookings) {
    if (booking.status === "storniert" || booking.status === "angefragt")
      continue;
    if (linkedIds.has(booking.id)) continue;

    const property = properties.find((p) => p.id === booking.propertyId);
    const propContacts = property
      ? contacts.filter((c) => property.contactIds.includes(c.id))
      : [];
    const cleaner =
      propContacts.find((c) => c.role === "putzkraft") ?? propContacts[0];
    if (!cleaner) continue; // ohne Kontakt kein sinnvoller Task

    const created = await cleaningService.create({
      propertyId: booking.propertyId,
      date: booking.checkOut,
      cleanerId: cleaner.id,
      status: "geplant",
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
  return useAppStore((s) =>
    s.properties.find((p) => p.id === s.activePropertyId),
  );
}
export function useActiveBookings() {
  return useAppStore(
    useShallow((s) =>
      s.bookings.filter((b) => b.propertyId === s.activePropertyId),
    ),
  );
}
export function useActiveCleaningTasks() {
  return useAppStore(
    useShallow((s) =>
      s.cleaningTasks.filter((c) => c.propertyId === s.activePropertyId),
    ),
  );
}
export function useActiveMaintenanceTasks() {
  return useAppStore(
    useShallow((s) =>
      s.maintenanceTasks.filter((m) => m.propertyId === s.activePropertyId),
    ),
  );
}
