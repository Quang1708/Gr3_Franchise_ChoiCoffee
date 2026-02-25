import type { Customer } from "@/models/customer.model";

export const CUSTOMER_SEED_DATA: Customer[] = [
  {
    id: 1,
    phone: "0911222333",
    email: "anh.nguyen@gmail.com",
    name: "Nguyễn Hoàng Anh",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    isActive: true,
    isDeleted: false,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
  },
  {
    id: 2,
    phone: "0988777666",
    email: "lan.tran@yahoo.com",
    name: "Trần Thị Ngọc Lan",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    isActive: true,
    isDeleted: false,
    createdAt: "2024-02-02T10:30:00Z",
    updatedAt: "2024-02-02T10:30:00Z",
  },
  {
    id: 3,
    phone: "0944555444",
    email: "minh.le@outlook.com",
    name: "Lê Quang Minh",
    avatarUrl: "https://i.pravatar.cc/150?u=3",
    isActive: true,
    isDeleted: false,
    createdAt: "2024-02-03T14:15:00Z",
    updatedAt: "2024-02-03T14:15:00Z",
  },
];
