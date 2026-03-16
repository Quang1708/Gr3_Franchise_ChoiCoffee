import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import { getCustomerProfile } from "@/pages/client/account/partial/service/customerAuth02.service";

export const initializeCustomerAuth = async (): Promise<void> => {
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    useCustomerAuthStore.getState().setInitialized(true);
    return;
  }

  const { setCustomer, setInitialized } = useCustomerAuthStore.getState();

  try {
    const customerProfile = await getCustomerProfile();

    setCustomer({
      id: customerProfile.id,
      email: customerProfile.email,
      phone: customerProfile.phone,
      name: customerProfile.name,
      avatar_url: customerProfile.avatar_url,
      address: customerProfile.address,
    });
  } catch (error) {
    console.log("No active customer session", error);
  } finally {
    setInitialized(true);
  }
};
