import type {
  Category,
  CategoryFranchise,
  Inventory,
  Product,
  ProductCategoryFranchise,
  ProductFranchise,
} from "../../models/new_models/product.model";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    code: "CF",
    name: "Coffee",
    description: "Various coffee drinks",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    SKU: "CF001",
    name: "Black Coffee",
    description: "Traditional black coffee",
    content: "Strong and bold",
    minPrice: 10000,
    maxPrice: 20000,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    SKU: "CF002",
    name: "Milk Coffee",
    description: "Coffee with sweetened condensed milk",
    content: "Sweet and creamy",
    minPrice: 12000,
    maxPrice: 25000,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_CATEGORY_FRANCHISES: CategoryFranchise[] = [
  {
    id: 1,
    categoryId: 1,
    franchiseId: 1,
    displayOrder: 1,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_PRODUCT_FRANCHISES: ProductFranchise[] = [
  {
    id: 1,
    franchiseId: 1,
    productId: 1, // Black Coffee
    priceBase: 15000,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    franchiseId: 1,
    productId: 2, // Milk Coffee
    priceBase: 18000,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_PRODUCT_CATEGORY_FRANCHISES: ProductCategoryFranchise[] = [
  {
    id: 1,
    categoryFranchiseId: 1,
    productFranchiseId: 1,
    displayOrder: 1,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    categoryFranchiseId: 1,
    productFranchiseId: 2,
    displayOrder: 2,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_INVENTORY: Inventory[] = [
  {
    id: 1,
    productFranchiseId: 1,
    quantity: 100,
    alertThreshold: 10,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    productFranchiseId: 2,
    quantity: 50,
    alertThreshold: 10,
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_PRODUCT_FRANCHISE_PRICE_LOGS: import("../../models/new_models/product.model").ProductFranchisePriceLog[] =
  [
    {
      id: 1,
      productFranchiseId: 1,
      oldPrice: 14000,
      newPrice: 15000,
      reason: "Markate adjustment",
      changedBy: 2, // Manager
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
  ];
