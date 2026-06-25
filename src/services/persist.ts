// Interim localStorage data layer.
// Each domain service uses this to read/write its slice. The Promise-based
// service interface stays identical so a real backend can replace it later.

const PREFIX = 'immo:';

function key(name: string): string {
  return `${PREFIX}${name}`;
}

/**
 * Load a persisted collection. If absent (first run), seed from `seed`,
 * persist it, and return the seed. Tolerates unavailable/corrupt storage
 * by falling back to the seed.
 */
export function load<T>(name: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw == null) {
      save(name, seed);
      return [...seed];
    }
    return JSON.parse(raw) as T[];
  } catch {
    return [...seed];
  }
}

/** Persist a collection back to localStorage. No-op if storage is unavailable. */
export function save<T>(name: string, data: T[]): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(data));
  } catch {
    // storage unavailable / quota exceeded — interim layer, ignore.
  }
}
