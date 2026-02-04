import type { User } from "../models/user.model";
import { LOCAL_STORAGE } from "../consts/localstorage.const";

export function setItemInLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItemInLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("LocalStorage error:", error);
    return null;
  }
}

export function removeItemInLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

// ===== Token helpers =====
// NOTE: token được lưu bằng setItemInLocalStorage -> JSON.stringify
export function setAdminToken(token: string): void {
  setItemInLocalStorage<string>(LOCAL_STORAGE.ADMIN_TOKEN, token);
}

export function getAdminToken(): string | null {
  return getItemInLocalStorage<string>(LOCAL_STORAGE.ADMIN_TOKEN);
}

export function clearAdminAuth(): void {
  removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_ADMIN);
  removeItemInLocalStorage(LOCAL_STORAGE.ADMIN_TOKEN);
}

export function getCurrentUser(): User | null {
  return getItemInLocalStorage<User>(LOCAL_STORAGE.ACCOUNT_ADMIN);
}

export function getCurrentUserId(): string | null {
  return getCurrentUser()?.id ?? null;
}

export function getCurrentUserRole(): string | null {
  return getCurrentUser()?.role ?? null;
}

export function isUserLoggedIn(): boolean {
  return !!getCurrentUser();
}

// Client functions
export function getCurrentClient(): User | null {
  return getItemInLocalStorage<User>(LOCAL_STORAGE.ACCOUNT_CLIENT);
}

export function getCurrentClientId(): string | null {
  return getCurrentClient()?.id ?? null;
}

export function getCurrentClientRole(): string | null {
  return getCurrentClient()?.role ?? null;
}

export function isClientLoggedIn(): boolean {
  return !!getCurrentClient();
}
