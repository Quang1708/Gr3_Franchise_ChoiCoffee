export interface OrderItemOption {
  productFranchiseRawId?: string;
  productNameSnapshot: string;
  productImageUrl?: string;
  quantity: number;
  priceSnapshot: number;
  finalPrice: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productFranchiseId: number;
  cartId?: string;
  cartItemId?: string;
  productFranchiseRawId?: string;
  franchiseId?: string;
  franchiseName?: string;
  franchiseImageUrl?: string;
  productNameSnapshot: string; // Tên món tại thời điểm mua
  productImageUrl?: string;
  priceSnapshot: number; // Giá bán tại thời điểm mua (đã trừ KM nếu có)
  quantity: number;
  lineTotal: number; // Tổng tiền của dòng sản phẩm, bao gồm option
  options?: OrderItemOption[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
