export interface Product {
  id: number;
  SKU: string;
  name: string;
  description: string;
  content: string;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFranchise {
  id: number;
  franchiseId: number;
  productId: number;
  priceBase: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFranchise {
  id: number;
  categoryId: number;
  franchiseId: number;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryFranchise {
  id: number;
  categoryFranchiseId: number;
  productFranchiseId: number;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: number;
  productFranchiseId: number;
  quantity: number;
  alertThreshold: number;
  isActive: boolean; // true -> AVAILABLE / OUT_OF_STOCK logic usually derived, but DBML says boolean
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFranchisePriceLog {
  id: number;
  productFranchiseId: number;
  oldPrice: number;
  newPrice: number;
  reason: string;
  changedBy: number;
  createdAt: string;
  updatedAt: string;
}
