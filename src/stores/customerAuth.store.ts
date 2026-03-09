import { create } from "zustand";
import type { CustomerAuthProfile } from "@/pages/client/account/model/account.model";

interface CustomerAuthState {
  customer: CustomerAuthProfile | null;
  customerId: string | null;
  isInitialized: boolean;
  isLoggingOut: boolean;

  setCustomer: (customer: CustomerAuthProfile) => void;
  clearCustomer: () => void;
  setInitialized: (initialized: boolean) => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()((set) => ({
  customer: null,
  customerId: null,
  isInitialized: false,
  isLoggingOut: false,

  setCustomer: (customer) =>
    set({
      customer,
      customerId: String(customer.id),
    }),

  clearCustomer: () =>
    set({
      customer: null,
      customerId: null,
    }),

  setInitialized: (initialized) =>
    set({
      isInitialized: initialized,
    }),

  setLoggingOut: (isLoggingOut) =>
    set({
      isLoggingOut,
    }),
}));
