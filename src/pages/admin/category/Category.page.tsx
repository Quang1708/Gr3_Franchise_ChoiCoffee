import { useMemo, useState } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

import { CATEGORIES } from '../../../mocks/dataCate.mock';
import { toastError, toastSuccess } from '../../../utils/toast.util';
import AdminCrudTemplate, {
  type AdminCrudTemplateProps,
  type CrudColumn,
  type CrudStatCard,
} from '../../../components/Admin/CRUD.template';

type Category = (typeof CATEGORIES)[number];
type CategoryForm = Pick<Category, 'code' | 'name' | 'description' | 'is_active'>;
type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilterState = { status: StatusFilter };
type CategoryCrudTemplateProps = AdminCrudTemplateProps<Category, CategoryFilterState>;

const PAGE_SIZES = [5, 10, 20];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<CategoryForm>({
    code: '',
    name: '',
    description: '',
    is_active: true,
  });
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const stats = useMemo(() => {
    const active = categories.filter((cate) => cate.is_active && !cate.is_deleted).length;
    const inactive = categories.length - active;
    return { total: categories.length, active, inactive };
  }, [categories]);

  const statCards = useMemo<CrudStatCard[]>(
    () => [
      { label: 'Tổng cộng', value: stats.total },
      { label: 'Đang hoạt động', value: stats.active, tone: 'success' },
      { label: 'Tạm ngừng', value: stats.inactive, tone: 'danger' },
    ],
    [stats],
  );

  const columns: CrudColumn<Category>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        width: '80px',
        render: (cate) => <span className="font-medium text-gray-700">{cate.id}</span>,
      },
      {
        key: 'code',
        header: 'Mã code',
        render: (cate) => <span className="font-mono text-sm text-gray-600">{cate.code}</span>,
      },
      {
        key: 'name',
        header: 'Tên danh mục',
        render: (cate) => <span className="font-semibold text-gray-900">{cate.name}</span>,
      },
      {
        key: 'description',
        header: 'Mô tả',
        render: (cate) => (
          <p className="line-clamp-2 text-sm text-gray-600" title={cate.description}>
            {cate.description}
          </p>
        ),
      },
      {
        key: 'is_active',
        header: 'Trạng thái',
        render: (cate) =>
          cate.is_active ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Hoạt động</span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Tạm ngừng</span>
          ),
      },
      {
        key: 'created_at',
        header: 'Ngày tạo',
        render: (cate) => <span className="text-sm text-gray-500">{formatDate(cate.created_at)}</span>,
      },
      {
        key: 'updated_at',
        header: 'Ngày cập nhật',
        render: (cate) => <span className="text-sm text-gray-500">{formatDate(cate.updated_at)}</span>,
      },
    ],
    [],
  );

  const filterPredicate: NonNullable<CategoryCrudTemplateProps['filterPredicate']> = (
    cate,
    _search,
    filterState,
  ) => {
    if (!filterState || filterState.status === 'all') return true;
    if (filterState.status === 'active') return cate.is_active;
    return !cate.is_active;
  };

  const renderFilters: NonNullable<CategoryCrudTemplateProps['renderFilters']> = ({
    filterState,
    setFilterState,
  }) => (
    <>
      <span className="hidden text-sm text-gray-500 sm:inline">Trạng thái</span>
      <select
        value={filterState.status}
        onChange={(event) =>
          setFilterState((prev) => ({
            ...prev,
            status: event.target.value as StatusFilter,
          }))
        }
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
      >
        <option value="all">Tất cả</option>
        <option value="active">Đang hoạt động</option>
        <option value="inactive">Tạm ngừng</option>
      </select>
    </>
  );

  const resetForm = () => {
    setFormState({ code: '', name: '', description: '', is_active: true });
    setEditingId(null);
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (cate: Category) => {
    setModalMode('edit');
    setEditingId(cate.id);
    setFormState({
      code: cate.code,
      name: cate.name,
      description: cate.description,
      is_active: cate.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.code.trim() || !formState.name.trim()) {
      toastError('Mã code và tên danh mục là bắt buộc');
      return;
    }

    const codeExists = categories.some(
      (cate) => cate.code.toLowerCase() === formState.code.toLowerCase() && cate.id !== editingId,
    );

    if (codeExists) {
      toastError('Mã code đã tồn tại');
      return;
    }

    const now = new Date().toISOString();

    if (modalMode === 'create') {
      const nextId = Math.max(0, ...categories.map((cate) => cate.id)) + 1;
      const newCategory: Category = {
        id: nextId,
        code: formState.code,
        name: formState.name,
        description: formState.description,
        is_active: formState.is_active,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      };
      setCategories((prev) => [newCategory, ...prev]);
      toastSuccess('Thêm danh mục thành công');
    } else if (modalMode === 'edit' && editingId !== null) {
      setCategories((prev) =>
        prev.map((cate) =>
          cate.id === editingId
            ? {
                ...cate,
                ...formState,
                updated_at: now,
              }
            : cate,
        ),
      );
      toastSuccess('Cập nhật danh mục thành công');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteCategory = () => {
    if (!pendingDelete) return;
    setCategories((prev) => prev.filter((cate) => cate.id !== pendingDelete.id));
    toastSuccess('Đã xóa danh mục');
    setPendingDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      <AdminCrudTemplate<Category, CategoryFilterState>
        title="Danh mục sản phẩm"
        subtitle="Tổng quản lý danh mục sản phẩm"
        addLabel="Thêm danh mục"
        onAdd={openCreateModal}
        data={categories}
        stats={statCards}
        columns={columns}
        getRowKey={(cate) => cate.id}
        actions={(cate) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => openEditModal(cate)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-amber-600 hover:text-amber-600"
              title="Chỉnh sửa"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(cate)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-rose-500 hover:text-rose-500"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        searchKeys={['name', 'code', 'description']}
        searchPlaceholder="Tìm theo tên, mã hoặc mô tả..."
        pageSizeOptions={PAGE_SIZES}
        initialFilterState={{ status: 'all' }}
        filterPredicate={filterPredicate}
        renderFilters={renderFilters}
        emptyState={<span className="text-sm text-gray-500">Không có danh mục phù hợp.</span>}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{modalMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}</p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Thêm danh mục' : 'Cập nhật danh mục'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitForm}>
              <div>
                <label className="text-sm font-medium text-gray-700">Mã code</label>
                <input
                  type="text"
                  value={formState.code}
                  onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="VD: coffee-beans"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="Tên hiển thị"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  rows={3}
                  placeholder="Mô tả ngắn gọn"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formState.is_active}
                  onChange={(event) => setFormState((prev) => ({ ...prev, is_active: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Đang hoạt động
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  {modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Xóa danh mục?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bạn có chắc muốn xóa danh mục <span className="font-semibold">{pendingDelete.name}</span>? Hành động này không
              thể hoàn tác.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
