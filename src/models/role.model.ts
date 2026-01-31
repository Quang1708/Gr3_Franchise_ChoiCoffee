export const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const isNonCustomerRole = (role: Role): role is Exclude<Role, "customer"> => {
  return role !== ROLE.CUSTOMER;
};
