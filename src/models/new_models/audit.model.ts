export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "SOFT_DELETE";

export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: AuditAction;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  changedBy: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
