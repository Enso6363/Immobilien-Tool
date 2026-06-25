import type { MaintenanceTask } from '@/types';
import { maintenanceTasks } from '@/mock/data';
import { load, save } from './persist';

const KEY = 'maintenanceTasks';

let store = load<MaintenanceTask>(KEY, maintenanceTasks);

function persist() {
  save(KEY, store);
}

export const maintenanceService = {
  getAll(): Promise<MaintenanceTask[]> {
    return Promise.resolve(store);
  },
  getByProperty(propertyId: string): Promise<MaintenanceTask[]> {
    return Promise.resolve(store.filter((m) => m.propertyId === propertyId));
  },
  create(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    const created: MaintenanceTask = { ...task, id: `m${Date.now()}` };
    store = [...store, created];
    persist();
    return Promise.resolve(created);
  },
  update(id: string, patch: Partial<MaintenanceTask>): Promise<MaintenanceTask | undefined> {
    let updated: MaintenanceTask | undefined;
    store = store.map((m) => {
      if (m.id !== id) return m;
      updated = { ...m, ...patch };
      return updated;
    });
    if (updated) persist();
    return Promise.resolve(updated);
  },
  remove(id: string): Promise<void> {
    store = store.filter((m) => m.id !== id);
    persist();
    return Promise.resolve();
  },
};
