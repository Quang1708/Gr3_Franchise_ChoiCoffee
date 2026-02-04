export interface Promotion {
  id: number;
  franchiseId: number;
  productFranchiseId: number | null; // null nếu áp dụng cho toàn cửa hàng
  type: 'PERCENT' | 'FIXED';
  value: number; // % (ví dụ: 10) hoặc số tiền cố định (ví dụ: 20000)
  startTime: string;
  endTime: string;
  createdBy: number; // ID của User (Admin/Manager) tạo ra promotion này
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}