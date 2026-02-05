export interface Product {
  id: number;
  SKU: string;
  name: string;
  description?: string;
  content?: string;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}