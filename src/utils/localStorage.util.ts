// import type { User } from "../models/user.model";
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

export function setAdminToken(token: string): void {
  setItemInLocalStorage<string>(LOCAL_STORAGE.CMS_TOKEN, token);
}

export function getAdminToken(): string | null {
  return getItemInLocalStorage<string>(LOCAL_STORAGE.CMS_TOKEN);
}

export function clearAdminAuth(): void {
  removeItemInLocalStorage(LOCAL_STORAGE.ACCOUNT_CMS);
  removeItemInLocalStorage(LOCAL_STORAGE.CMS_TOKEN);
}

type UserWithRole = {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  roles: { role_code: string; scope: string; franchise_id: number | null }[];
};

export function getCurrentUser(): UserWithRole | null {
  return getItemInLocalStorage<UserWithRole>(LOCAL_STORAGE.ACCOUNT_CMS);
}

export function getCurrentUserId(): number | null {
  return getCurrentUser()?.id ?? null;
}

export function getCurrentUserRole(): string | null {
  const user = getCurrentUser();
  return user?.roles?.[0]?.role_code ?? null;
}

export function isUserLoggedIn(): boolean {
  return !!getCurrentUser();
}

// Client functions
export function getCurrentClient(): UserWithRole | null {
  return getItemInLocalStorage<UserWithRole>(LOCAL_STORAGE.ACCOUNT_CLIENT);
}

export function getCurrentClientId(): number | null {
  return getCurrentClient()?.id ?? null;
}

export function getCurrentClientRole(): string | null {
  const user = getCurrentClient();
  return user?.roles?.[0]?.role_code ?? null;
}

export function isClientLoggedIn(): boolean {
  return !!getCurrentClient();
}
