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
  | "shift"
  | "category-franchise"
  | "cart"
  | string;

export function isMenuVisible(
  user: CmsUser | null,
  franchiseId: string | null,
  path: MenuPath,
) {
  if (!user) return false;

  if (path === "dashboard" || path === "logout") return true;

  const fid = franchiseId ?? null;

  if (path === "franchise") return can(user, PERM.FRANCHISE_MGMT, fid);

  if (path === "menu") return can(user, PERM.MENU_READ, fid);

  if (path === "product") return can(user, PERM.PRODUCT_READ, fid);

  if (path === "category") return can(user, PERM.CATEGORY_READ, fid);

  if (path === "product-franchise")
    return can(user, PERM.PRODUCT_FRANCHISE_READ, fid);

  if (path === "category-franchise")
    return can(user, PERM.CATEGORY_FRANCHISE_READ, fid);

  if (path === "product-category")
    return can(user, PERM.PRODUCT_CATEGORY_READ, fid);

  if (path === "customer") return can(user, PERM.CUSTOMER_READ, fid);

  if (path === "order") return can(user, PERM.ORDER_READ, fid);

  if (path === "inventory") return can(user, PERM.INVENTORY_READ, fid);

  if (path === "payment") return can(user, PERM.PAYMENT_READ, fid);

  if (path === "voucher") return can(user, PERM.VOUCHER_READ, fid);

  if (path === "shift") return can(user, PERM.SHIFT_READ, fid);

  if (path === "shift-assignment")
    return can(user, PERM.SHIFT_ASSIGNMENT_READ, fid);

  if (path === "loyalty") return can(user, PERM.LOYALTY_READ, fid);

  if (path === "user") return can(user, PERM.USER_MANAGE, fid);

  return false;
}
