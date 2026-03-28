import { useEffect, useMemo, useState, useRef } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "../../../components/Admin/template/CRUDPage.template";

import type { Franchise } from "./models/franchise.model";
import { useFranchiseStore } from "./stores/useFranchiseStore";

import ClientLoading from "@/components/Client/Client.Loading";

import {
  CreateFranchiseModal,
  EditFranchiseModal,
  DeleteFranchiseModal,
  RestoreFranchiseModal,
} from "@/components/Admin/franchise/FranchiseModals";

const FranchisePage = () => {
  const {
    items,
    loading,
    actionLoading,
    fetchAll,
    create,
    update,
    delete: deleteFranchise,
    changeStatus,
    search,
    restore,
  } = useFranchiseStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const [selected, setSelected] = useState<Franchise | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pagination state giống CustomerPage
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // fetch data
  const fetchFranchises = async () => {
    await fetchAll();
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  const handleSearch = async (keyword: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      if (!keyword.trim()) {
        await fetchFranchises();
        return;
      }

      await search(keyword);
      setPage(1);
    }, 400);
  };

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
          <div className="flex items-start gap-3 max-w-[320px]">
            <img
              src={item.logo_url || "/images/default-store.png"}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover border shrink-0"
            />

            <div className="min-w-0">
              <div className="font-semibold truncate">{item.name}</div>
              <div className="text-xs text-gray-500 break-words">
                {item.address}
              </div>
            </div>
          </div>
        ),
      },
    ],
    [],
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  if (loading || actionLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
        <ClientLoading />
      </div>
    );
  }

  return (
    <>
      <CRUDPageTemplate<Franchise>
        title="Quản lý Chi nhánh"
        data={paginatedData}
        columns={columns}
        pageSize={pageSize}
        totalItems={items.length}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        tableMaxHeightClass="max-h-[60vh]"
        isTableLoading={loading}
        statusField="isActive"
        onStatusChange={(item, status) => {
          if ((item as any).is_deleted) return;
          changeStatus(item.id, status);
        }}
        onAdd={() => setCreateOpen(true)}
        onEdit={(item) => {
          setSelected(item);
          setEditOpen(true);
        }}
        onDelete={(item) => {
          setSelected(item);
          setDeleteOpen(true);
        }}
        onRestore={(item) => {
          setSelected(item);
          setRestoreOpen(true);
        }}
        onSearch={handleSearch}
        onRefresh={() => {
          setPage(1);
          fetchFranchises();
        }}
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
          await fetchFranchises();
          setDeleteOpen(false);
        }}
      />

      <RestoreFranchiseModal
        isOpen={restoreOpen}
        franchise={selected}
        onClose={() => {
          setRestoreOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) return;
          await restore(selected.id);
          setRestoreOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
};

export default FranchisePage;
