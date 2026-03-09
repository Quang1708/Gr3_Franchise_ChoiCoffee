export interface Inventory {
  id: string;
  productFranchiseId: string;
  franchiseId: string;
  quantity: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  inventoryId: string;
  type: string;
  quantity: number;
  createdAt: string;
}