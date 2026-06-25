import type { CleaningTask } from '@/types';
import { cleaningTasks } from '@/mock/data';
import { load, save } from './persist';

const KEY = 'cleaningTasks';

let store = load<CleaningTask>(KEY, cleaningTasks);

// Monotonic suffix so several tasks created within the same ms (e.g. the
// auto-suggest loop) still get unique ids.
let seq = 0;

function persist() {
  save(KEY, store);
}

export const cleaningService = {
  getAll(): Promise<CleaningTask[]> {
    return Promise.resolve(store);
  },
  getByProperty(propertyId: string): Promise<CleaningTask[]> {
    return Promise.resolve(store.filter((c) => c.propertyId === propertyId));
  },
  create(task: Omit<CleaningTask, 'id'>): Promise<CleaningTask> {
    const created: CleaningTask = { ...task, id: `cl${Date.now()}_${seq++}` };
    store = [...store, created];
    persist();
    return Promise.resolve(created);
  },
  update(id: string, patch: Partial<CleaningTask>): Promise<CleaningTask | undefined> {
    let updated: CleaningTask | undefined;
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
