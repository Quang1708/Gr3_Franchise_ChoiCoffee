import type { AuditLog } from "../../models/new_models/audit.model";

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    entityType: "order",
    entityId: 1,
    action: "CREATE",
    oldData: null,
    newData: { id: 1, totalAmount: 33000 },
    changedBy: 1,
    note: "Order created",
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-10T10:00:00Z",
  },
];
