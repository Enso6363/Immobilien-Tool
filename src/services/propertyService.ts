import type { Property } from '@/types';
import { properties } from '@/mock/data';
import { load, save } from './persist';

const KEY = 'properties';

let store = load<Property>(KEY, properties);
let seq = 0;

function persist() {
  save(KEY, store);
}

export const propertyService = {
  getAll(): Promise<Property[]> {
    return Promise.resolve(store);
  },
  getById(id: string): Promise<Property | undefined> {
    return Promise.resolve(store.find((p) => p.id === id));
  },
  create(property: Omit<Property, 'id'>): Promise<Property> {
    const created: Property = { ...property, id: `p${Date.now()}_${seq++}` };
    store = [...store, created];
    persist();
    return Promise.resolve(created);
  },
  update(id: string, patch: Partial<Property>): Promise<Property | undefined> {
    let updated: Property | undefined;
    store = store.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, ...patch };
      return updated;
    });
    if (updated) persist();
    return Promise.resolve(updated);
  },
  remove(id: string): Promise<void> {
    store = store.filter((p) => p.id !== id);
    persist();
    return Promise.resolve();
  },
};
