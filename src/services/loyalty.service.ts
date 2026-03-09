import type { CustomerFranchise } from "@/models/customer_franchise.model";
import type { LoyaltyTransaction } from "@/models/loyalty_transaction.model";
import { CUSTOMER_FRANCHISE_SEED_DATA } from "@/mocks/customer_franchise.seed";
import { LOYALTY_TRANSACTION_SEED_DATA } from "@/mocks/loyalty_transaction.seed";

/** Mock service - thay bằng API thật khi backend sẵn sàng */

export async function getCustomerLoyalties(): Promise<CustomerFranchise[]> {
  await new Promise((r) => setTimeout(r, 200));
  return CUSTOMER_FRANCHISE_SEED_DATA.filter((c) => !c.isDeleted);
}

export async function getLoyaltyTransactions(): Promise<LoyaltyTransaction[]> {
  await new Promise((r) => setTimeout(r, 200));
  return LOYALTY_TRANSACTION_SEED_DATA.filter((t) => !t.isDeleted);
}

export async function getTransactionsByCustomerFranchise(
  customerFranchiseId: number
): Promise<LoyaltyTransaction[]> {
  await new Promise((r) => setTimeout(r, 150));
  return LOYALTY_TRANSACTION_SEED_DATA.filter(
    (t) => t.customerFranchiseId === customerFranchiseId && !t.isDeleted
  ).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
