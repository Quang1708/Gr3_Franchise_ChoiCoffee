import { create } from "zustand";
import type { CustomerAuthProfile } from "@/models";

interface CustomerAuthState {
  customer: CustomerAuthProfile | null;
  customerId: string | null;
  isInitialized: boolean;

  setCustomer: (customer: CustomerAuthProfile) => void;
  clearCustomer: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()((set) => ({
  customer: null,
  customerId: null,
  isInitialized: false,

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
}));
