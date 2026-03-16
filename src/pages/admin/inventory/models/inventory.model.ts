export interface Inventory {
  id: string;
  productFranchiseId: string;
  franchiseId: string;
  quantity: number;
  alert_threshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  _id: string
  inventory_id: string
  product_franchise_id: string
  change: number
  type: string
  reference_type: string
  reason?: string
  created_by: string
  created_at: string
}