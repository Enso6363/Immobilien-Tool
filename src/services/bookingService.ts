import type { Booking } from '@/types';
import { bookings } from '@/mock/data';
import { load, save } from './persist';

const KEY = 'bookings';

let store = load<Booking>(KEY, bookings);
let seq = 0;

function persist() {
  save(KEY, store);
}

export const bookingService = {
  getAll(): Promise<Booking[]> {
    return Promise.resolve(store);
  },
  getByProperty(propertyId: string): Promise<Booking[]> {
    return Promise.resolve(store.filter((b) => b.propertyId === propertyId));
  },
  create(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const created: Booking = { ...booking, id: `b${Date.now()}_${seq++}` };
    store = [...store, created];
    persist();
    return Promise.resolve(created);
  },
  update(id: string, patch: Partial<Booking>): Promise<Booking | undefined> {
    let updated: Booking | undefined;
    store = store.map((b) => {
      if (b.id !== id) return b;
      updated = { ...b, ...patch };
      return updated;
    });
    if (updated) persist();
    return Promise.resolve(updated);
  },
  remove(id: string): Promise<void> {
    store = store.filter((b) => b.id !== id);
    persist();
    return Promise.resolve();
  },
};
