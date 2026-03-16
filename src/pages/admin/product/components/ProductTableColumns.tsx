import { type Column } from "@/components/Admin/template/CRUD.template";
import type { ProductRow } from "../models/productPage.model";

export const productTableColumns: Column<ProductRow>[] = [
  {
    header: "SKU",
    accessor: "SKU",
    sortable: true,
    className: "w-24 font-mono text-xs text-gray-500",
  },
  {
    header: "Sản phẩm",
    accessor: "name",
    className: "min-w-[250px]",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
          <img
            src={item.image_url || "https://placehold.co/100?text=No+Image"}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/100?text=No+Image";
            }}
          />
        </div>
        <div>
          <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Giá tối thiểu",
    accessor: "min_price",
    className: "w-32",
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.min_price)}
      </span>
    ),
  },
  {
    header: "Giá tối đa",
    accessor: "max_price",
    className: "w-32",
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item.max_price)}
      </span>
    ),
  },
  {
    header: "Ngày tạo",
    accessor: (item) => new Date(item.created_at).toLocaleDateString("vi-VN"),
    sortable: true,
    className: "text-gray-500 text-sm",
  },
  {
    header: "Ngày cập nhật",
    accessor: (item) => new Date(item.updated_at).toLocaleDateString("vi-VN"),
    sortable: true,
    className: "text-gray-500 text-sm",
  },
];
