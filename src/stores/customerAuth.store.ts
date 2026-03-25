import { create } from "zustand";
import { ENV } from "@/config";
import type { CustomerAuthProfile } from "@/pages/client/account/model/account.model";
import axios from "axios";

interface CustomerAuthState {
  customer: CustomerAuthProfile | null;
  customerId: string | null;
  isInitialized: boolean;
  isLoggingOut: boolean;

  setCustomer: (customer: CustomerAuthProfile) => void;
  clearCustomer: () => void;
  setInitialized: (initialized: boolean) => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
  refreshAccessToken: () => Promise<void>;
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

  refreshAccessToken: async () => {
    await axios.get(`${ENV.API_URL}/api/customer-auth/refresh-token`, {
      withCredentials: true,
      timeout: 300000,
    });
  },
}));
