import type { ProductFranchisePriceLog } from "@/models/product_franchise_price_log.model";

export const PRODUCT_FRANCHISE_PRICE_LOG_SEED_DATA: ProductFranchisePriceLog[] =
  [
    // Lần thay đổi 1: Tăng giá do chi phí nguyên liệu đầu vào tăng
    {
      id: 1,
      productFranchiseId: 1, // Cafe Đen tại CN Quận 1
      oldPrice: 29000,
      newPrice: 32000,
      reason: "Giá hạt cà phê Robusta tăng 15%",
      changedBy: 1, // Trân (Admin)
      createdAt: "2024-02-01T08:00:00Z",
      updatedAt: "2024-02-01T08:00:00Z",
    },
    // Lần thay đổi 2: Tăng giá định kỳ theo năm
    {
      id: 2,
      productFranchiseId: 1,
      oldPrice: 32000,
      newPrice: 35000,
      reason: "Điều chỉnh giá bán niêm yết năm 2024",
      changedBy: 1,
      createdAt: "2024-06-01T08:00:00Z",
      updatedAt: "2024-06-01T08:00:00Z",
    },
    // Lần thay đổi 3: Tại Chi nhánh Quận 7 (Manager thực hiện)
    {
      id: 3,
      productFranchiseId: 21, // Cafe Đen tại CN Quận 7
      oldPrice: 30000,
      newPrice: 32000,
      reason: "Đồng bộ giá theo mặt bằng khu vực Phú Mỹ Hưng",
      changedBy: 3, // Đăng Quang (Manager)
      createdAt: "2024-06-15T09:00:00Z",
      updatedAt: "2024-06-15T09:00:00Z",
    },
  ];
