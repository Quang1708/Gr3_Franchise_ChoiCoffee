import { can, type CmsUser } from "./rbac";
import { PERM } from "./rbac.permissions";

export type MenuPath =
  | "dashboard"
  | "franchise"
  | "menu"
  | "product"
  | "category"
  | "customer"
  | "order"
  | "payment"
  | "voucher"
  | "inventory"
  | "shift-assignment"
  | "loyalty"
  | "user"
  | "logout"
  | string;

export function isMenuVisible(
  user: CmsUser | null,
  franchiseId: string | "ALL" | null,
  path: MenuPath,
) {
  if (!user) return false;

  // always visible
  if (path === "dashboard" || path === "logout") return true;

  /**
   * convert context
   */
  const fid =
    franchiseId && franchiseId !== "ALL" ? String(franchiseId) : undefined;

  if (path === "franchise") return can(user, PERM.FRANCHISE_MGMT, fid);
  if (path === "user") return can(user, PERM.USER_MANAGE, fid);
  if (path === "payment") return can(user, PERM.PAYMENT_READ, fid);
  if (path === "voucher") return can(user, PERM.VOUCHER_READ, fid);

  if (path === "menu") return can(user, PERM.MENU_READ, fid);
  if (path === "product") return can(user, PERM.PRODUCT_READ, fid);
  if (path === "category") return can(user, PERM.CATEGORY_READ, fid);
  if (path === "product-category") return can(user, PERM.CATEGORY_READ, fid);
  if (path === "customer") return can(user, PERM.CUSTOMER_READ, fid);
  if (path === "order") return can(user, PERM.ORDER_READ, fid);
  if (path === "inventory") return can(user, PERM.INVENTORY_READ, fid);
  if (path === "shift-assignment")
    return can(user, PERM.SHIFT_ASSIGNMENT_READ, fid);
  if (path === "loyalty") return can(user, PERM.LOYALTY_READ, fid);

  return true;
}
