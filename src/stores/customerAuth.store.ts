import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerAuthProfile } from "@/models";

interface CustomerAuthState {
  customer: CustomerAuthProfile | null;
  customerId: string | null;
  isInitialized: boolean;

  setCustomer: (customer: CustomerAuthProfile) => void;
  clearCustomer: () => void;
  initializeAuth: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      customerId: null,
      isInitialized: false,

      setCustomer: (customer) =>
        set({
          customer,
          customerId: String(customer.id),
          isInitialized: true,
        }),

      clearCustomer: () =>
        set({
          customer: null,
          customerId: null,
        }),

      initializeAuth: () => {
        if (!get().isInitialized) {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: "customer-auth-storage",
      partialize: (state) => ({
        customerId: state.customerId,
        customer: state.customer,
      }),
    },
  ),
);
