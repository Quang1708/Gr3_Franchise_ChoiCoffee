export function setItemInSessionStorage<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getItemInSessionStorage<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

export function removeItemInSessionStorage(key: string): void {
  sessionStorage.removeItem(key);
}
