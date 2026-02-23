import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import type { Franchise } from "../../../models/franchise.model";
import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import {
  CreateFranchiseModal,
  DeleteFranchiseModal,
  EditFranchiseModal,
} from "../../../components/Admin/franchise/FranchiseModals";

type FranchiseFormData = {
  code: string;
  name: string;
  address: string;
  openedAt: string;
  closedAt?: string;
  isActive: boolean;
};

const FranchisePage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<Franchise[]>(FRANCHISE_SEED_DATA);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editing, setEditing] = useState<Franchise | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deleting, setDeleting] = useState<Franchise | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const columns: Column<Franchise>[] = useMemo(
    () => [
      {
        header: "Mã",
        accessor: "code",
        sortable: true,
        className: "font-medium text-gray-900",
      },
      {
        header: "Chi nhánh",
        accessor: (item) => (
          <div>
            <div className="font-semibold">{item.name}</div>
          </div>
        ),
      },
    ],
    [],
  );

  // Create
  const handleCreateSubmit = (form: FranchiseFormData) => {
    // simple unique id for mock
    const nextId = Math.max(0, ...data.map((x) => x.id)) + 1;

    const newItem: Franchise = {
      id: nextId,
      code: form.code,
      name: form.name,
      logoUrl: undefined,
      address: form.address,
      openedAt: form.openedAt,
      closedAt: form.closedAt || undefined,
      isActive: form.isActive ?? true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData((prev) => [newItem, ...prev]);
    toast.success("Thêm chi nhánh thành công");
    setIsCreateOpen(false);
  };

  // Edit
  const handleEditOpen = (item: Franchise) => {
    setEditing(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (form: FranchiseFormData) => {
    if (!editing) return;

    setData((prev) =>
      prev.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              ...form,
              logoUrl: form.logoUrl || undefined,
              closedAt: form.closedAt || undefined,
              updatedAt: new Date().toISOString(),
            }
          : x,
      ),
    );

    toast.success("Cập nhật chi nhánh thành công");
    setIsEditOpen(false);
    setEditing(null);
  };

  // Delete
  const handleDeleteOpen = (item: Franchise) => {
    setDeleting(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    setData((prev) => prev.filter((x) => x.id !== deleting.id));
    toast.success("Đã xóa chi nhánh");
    setDeleting(null);
    setIsDeleteOpen(false);
  };

  // Status
  const handleStatusChange = (item: Franchise, newStatus: boolean) => {
    setData((prev) =>
      prev.map((x) =>
        x.id === item.id
          ? { ...x, isActive: newStatus, updatedAt: new Date().toISOString() }
          : x,
      ),
    );
    toast.success(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  return (
    <div className="p-6">
      <CRUDTable<Franchise>
        title="Quản lý Chi nhánh (Franchise)"
        data={data}
        columns={columns}
        pageSize={5}
        onAdd={() => setIsCreateOpen(true)}
        onView={(item) => navigate(`/admin/franchise/${item.id}`)}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
        statusField="isActive"
        onStatusChange={handleStatusChange}
        searchKeys={["name", "code", "address"]}
        filters={[
          {
            key: "isActive",
            label: "Trạng thái",
            options: [
              { value: "all", label: "Tất cả" },
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ],
          },
        ]}
      />

      <CreateFranchiseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditFranchiseModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditing(null);
        }}
        franchise={editing}
        onSubmit={handleEditSubmit}
      />

      <DeleteFranchiseModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleting(null);
        }}
        franchise={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default FranchisePage;
