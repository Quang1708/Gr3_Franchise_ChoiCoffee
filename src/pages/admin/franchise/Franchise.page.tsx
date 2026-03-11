import { useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";

import type { Franchise } from "./models/franchise.model";

import { useFranchiseStore } from "./stores/useFranchiseStore";

import ClientLoading from "@/components/Client/Client.Loading";

import {
  CreateFranchiseModal,
  EditFranchiseModal,
  DeleteFranchiseModal,
} from "@/components/Admin/franchise/FranchiseModals";

const FranchisePage = () => {
  const {
    items,
    loading,
    fetchAll,
    create,
    update,
    delete: deleteFranchise,
    changeStatus,
  } = useFranchiseStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<Franchise | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const columns: Column<Franchise>[] = useMemo(
    () => [
      {
        header: "Mã",
        accessor: "code",
        sortable: true,
      },
      {
        header: "Chi nhánh",
        accessor: (item) => (
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-xs text-gray-500">{item.address}</div>
          </div>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <ClientLoading />
      </div>
    );
  }

  return (
    <div className="p-6">
      <CRUDTable<Franchise>
        title="Quản lý Chi nhánh"
        data={items}
        columns={columns}
        pageSize={5}
        statusField="isActive"
        onStatusChange={(item, status) => changeStatus(item.id, status)}
        onAdd={() => setCreateOpen(true)}
        onEdit={(item) => {
          setSelected(item);
          setEditOpen(true);
        }}
        onDelete={(item) => {
          setSelected(item);
          setDeleteOpen(true);
        }}
        searchKeys={["code", "name"]}
      />

      <CreateFranchiseModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          await create(data);
          setCreateOpen(false);
        }}
      />

      <EditFranchiseModal
        isOpen={editOpen}
        franchise={selected}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => {
          if (!selected) return;
          await update(selected.id, data);
          setEditOpen(false);
        }}
      />

      <DeleteFranchiseModal
        isOpen={deleteOpen}
        franchise={selected}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!selected) return;
          await deleteFranchise(selected.id);
        }}
      />
    </div>
  );
};

export default FranchisePage;
