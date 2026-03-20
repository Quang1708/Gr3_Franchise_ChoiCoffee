export const PERM = {
  // Franchise management (GLOBAL admin only)
  FRANCHISE_MGMT: "franchise.mgmt",

  // Menu / Product / Category
  MENU_READ: "menu.read",
  MENU_WRITE: "menu.write",

  PRODUCT_READ: "product.read",
  PRODUCT_WRITE: "product.write",

  PRODUCT_CATEGORY_READ: "product_category.read",
  PRODUCT_CATEGORY_WRITE: "product_category.read",

  CATEGORY_READ: "category.read",
  CATEGORY_WRITE: "category.write",
  CATEGORY_FRANCHISE_READ: "category_franchise.read",
  CATEGORY_FRANCHISE_WRITE: "category_franchise.write",

  SHIFT_READ: "shift.read",
  SHIFT_WRITE: "shift.write",
  // Customer
  CUSTOMER_READ: "customer.read",
  CUSTOMER_WRITE: "customer.write",

  // Orders
  ORDER_READ: "order.read",
  ORDER_WRITE: "order.write",

  // Payments (ẩn cho manager/staff theo yêu cầu)
  PAYMENT_READ: "payment.read",
  PAYMENT_WRITE: "payment.write",

  // Inventory
  INVENTORY_READ: "inventory.read",
  INVENTORY_UPDATE: "inventory.update",
  INVENTORY_ALERT: "inventory.alert",

  // Shift Assignment
  SHIFT_ASSIGNMENT_READ: "shift_assignment.read",
  SHIFT_ASSIGNMENT_WRITE: "shift_assignment.write",

  // Loyalty
  LOYALTY_READ: "loyalty.read",
  LOYALTY_WRITE: "loyalty.write",

  // Users/IAM (admin only)
  USER_READ: "user.read",
  USER_MANAGE: "user.manage",

  // Voucher (admin / manager)
  VOUCHER_READ: "voucher.read",
  VOUCHER_WRITE: "voucher.write",
} as const;

export type PermissionCode = (typeof PERM)[keyof typeof PERM];
