import { LOCAL_STORAGE } from "../consts/localstorage.const";

export function setItemInLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItemInLocalStorage<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

export function removeItemInLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

export function clearAdminAuth(): void {
  removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS);
  removeItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN);
  removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_FRANCHISE_ID);
}