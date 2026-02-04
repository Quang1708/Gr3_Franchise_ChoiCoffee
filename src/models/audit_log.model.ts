export interface AuditLog {
    id: number;
    entityType: string; // 'order' | 'product' | 'user' | 'franchise' ...
    entityId: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';
    oldData?: any; // JSON snapshot trước khi thay đổi
    newData?: any; // JSON snapshot sau khi thay đổi
    changedBy: number; // ID của User thực hiện
    note?: string;
    createdAt: string;
    updatedAt: string;
}