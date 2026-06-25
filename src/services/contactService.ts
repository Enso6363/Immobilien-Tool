import type { Contact } from '@/types';
import { contacts } from '@/mock/data';
import { load, save } from './persist';

const KEY = 'contacts';

let store = load<Contact>(KEY, contacts);
let seq = 0;

function persist() {
  save(KEY, store);
}

export const contactService = {
  getAll(): Promise<Contact[]> {
    return Promise.resolve(store);
  },
  getByIds(ids: string[]): Promise<Contact[]> {
    return Promise.resolve(store.filter((c) => ids.includes(c.id)));
  },
  create(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const created: Contact = { ...contact, id: `c${Date.now()}_${seq++}` };
    store = [...store, created];
    persist();
    return Promise.resolve(created);
  },
  update(id: string, patch: Partial<Contact>): Promise<Contact | undefined> {
    let updated: Contact | undefined;
    store = store.map((c) => {
      if (c.id !== id) return c;
      updated = { ...c, ...patch };
      return updated;
    });
    if (updated) persist();
    return Promise.resolve(updated);
  },
  remove(id: string): Promise<void> {
    store = store.filter((c) => c.id !== id);
    persist();
    return Promise.resolve();
  },
};
