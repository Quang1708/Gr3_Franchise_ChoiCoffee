export const SESSION_STORAGE = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  RESET_TOKEN: "RESET_TOKEN",
} as const;

export type SessionStorageKey =
  (typeof SESSION_STORAGE)[keyof typeof SESSION_STORAGE];