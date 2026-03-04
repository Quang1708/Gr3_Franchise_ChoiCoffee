import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { useFranchiseStore } from "@/stores/useFranchiseStore";
import type { Franchise } from "@/models/franchise.model";
const FranchisePage = () => {
  const navigate = useNavigate();

  const { items, fetchAll, loading, setSelected } = useFranchiseStore();

  useEffect(() => {
    fetchAll();
  }, []);

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
      {
        header: "Trạng thái",
        accessor: (item) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {item.isActive ? "Hoạt động" : "Ngưng"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6">
      <CRUDTable<Franchise>
        title="Quản lý Chi nhánh (Franchise)"
        data={items}
        columns={columns}
        pageSize={10}
        loading={loading}
        onView={(item) => {
          setSelected(item.id);
          navigate(`/admin/franchise/${item.id}`);
        }}
        onAdd={undefined}
        onEdit={undefined}
        onDelete={undefined}
        searchKeys={["name", "code"]}
      />
    </div>
  );
};

export default FranchisePage;
