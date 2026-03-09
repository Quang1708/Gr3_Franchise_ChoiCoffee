import {
  useEffect,
  useState,
  type SyntheticEvent,
} from "react";
import { toastSuccess, toastError } from "../../../utils/toast.util";
import {
  changeUserStatus,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserRole,
  type UserListItem,
} from "../../../services/user.service";
import ClientLoading from "@/components/Client/Client.Loading";
import { Modal } from "@/components/UI/Modal";
import { ImageUpload } from "@/components/ImageUpload/ImageUpload";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";

interface UserFormData {
  email: string;
  password: string;
  name: string;
  phone: string; // added phone field
  roleCode: string;
  avatarUrl?: string;
}

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "STAFF", "CUSTOMER"];

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const UserPage = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserListItem | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    name: "",
    phone: "", // initialize phone
    roleCode: "STAFF",
    avatarUrl: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const data = await getUsers();
        if (!isMounted) return;
        setUsers(data);
      } catch {
        toastError("Không thể tải danh sách user");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = (user?: UserListItem) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        name: user.name,
        phone: user.phone || "", // include phone
        roleCode: user.roleCode,
        avatarUrl: user.avatarUrl || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "", // include default phone
        roleCode: "STAFF",
        avatarUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      roleCode: "STAFF",
      avatarUrl: "",
    });
  };

  const handleOpenDetails = (user: UserListItem) => {
    setDetailUser(user);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setDetailUser(null);
  };

  const handleEditFromDetails = () => {
    if (!detailUser) return;
    const user = detailUser;
    handleCloseDetails();
    handleOpenModal(user);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingUser) {
      const prevRoleCode = editingUser.roleCode;
      const result = await updateUser(editingUser.id, {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        avatar_url: formData.avatarUrl,
        ...(formData.password ? { password: formData.password } : {}),
      });

      if (!result.ok) {
        toastError(result.message);
        return;
      }

      let updatedUser = result.user;

      if (formData.roleCode !== prevRoleCode) {
        const roleResult = await updateUserRole(
          String(editingUser.id),
          formData.roleCode,
        );

        if (roleResult.ok) {
          updatedUser = { ...updatedUser, roleCode: formData.roleCode };
        } else {
          toastError(roleResult.message);
        }
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? updatedUser : user)),
      );
      toastSuccess("Cập nhật user thành công");
    } else {
      const result = await createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        roleCode: formData.roleCode,
        avatarUrl: formData.avatarUrl,
      });

      if (!result.ok) {
        toastError(result.message);
        return;
      }

      setUsers((prev) => [...prev, result.user]);
      toastSuccess("Tạo user mới thành công");
    }

    handleCloseModal();
  };

  const handleDelete = async (userId: number | string) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      const result = await deleteUser(userId);
      if (!result.ok) {
        toastError(result.message);
        return;
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toastSuccess("Xóa user thành công");
    }
  };

  const handleStatusChange = async (user: UserListItem, newStatus: boolean) => {
    const prevStatus = user.isActive;
    const prevUpdatedAt = user.updatedAt;
    const nextUpdatedAt = new Date().toISOString();

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, isActive: newStatus, updatedAt: nextUpdatedAt }
          : u,
      ),
    );
    setDetailUser((prev) =>
      prev?.id === user.id
        ? { ...prev, isActive: newStatus, updatedAt: nextUpdatedAt }
        : prev,
    );

    const result = await changeUserStatus(
      user.id,
      newStatus ? "active" : "inactive",
    );

    if (!result.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isActive: prevStatus, updatedAt: prevUpdatedAt }
            : u,
        ),
      );
      setDetailUser((prev) =>
        prev?.id === user.id
          ? { ...prev, isActive: prevStatus, updatedAt: prevUpdatedAt }
          : prev,
      );
      toastError(result.message);
      return;
    }

    toastSuccess(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  const columns: Column<UserListItem>[] = [
    {
      header: "User",
      accessor: "name",
      className: "min-w-[250px]",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {user.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      sortable: true,
      className: "min-w-[220px]",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "min-w-[140px]",
      render: (user) => user.phone || "—",
    },
    {
      header: "Vai trò",
      accessor: "roleCode",
      sortable: true,
      className: "w-28",
    },
    {
      header: "Cập nhật",
      accessor: (user) => formatDateTime(user.updatedAt),
      sortable: true,
      className: "text-gray-500 text-sm w-40",
    },
  ];



  return (
    <div className="p-6 h-[calc(100vh-4rem)] min-h-0 flex flex-col overflow-hidden transition-all animate-fade-in">
      {isLoading ? <ClientLoading /> : null}

      <div className="mb-4">
        <CRUDTable<UserListItem>
          title="Quản lý Users"
          data={users}
          columns={columns}
          pageSize={5}
          tableMaxHeightClass="max-h-[60vh]"
          deferToolsApply
          // Actions
          onAdd={() => handleOpenModal()}
          onView={handleOpenDetails}
          onEdit={handleOpenModal}
          onDelete={(user) => handleDelete(user.id)}
          // Status (giống Product)
          statusField="isActive"
          onStatusChange={handleStatusChange}
          // Search & Filter
          searchKeys={["name", "email", "phone"]}
          filters={[
            {
              key: "roleCode",
              label: "vai trò",
              options: ROLE_OPTIONS.map((roleCode) => ({
                value: roleCode,
                label: roleCode,
              })),
            },
            {
              key: "isActive",
              label: "trạng thái",
              options: [
                { value: "true", label: "Hoạt động" },
                { value: "false", label: "Ngưng hoạt động" },
              ],
            },
          ]}
        />
      </div>

      {/* Modal for Create/Edit User (use shared Modal) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div>
            <label
              htmlFor="user-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              id="user-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Nhập tên người dùng"
            />
          </div>

          <div>
            <label
              htmlFor="user-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Nhập email"
            />
          </div>

          <div>
            <label
              htmlFor="user-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu {editingUser && "(Để trống nếu không đổi)"}
              {!editingUser && <span className="text-red-500"> *</span>}
            </label>
            <input
              id="user-password"
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder={
                editingUser
                  ? "Nhập mật khẩu mới (tùy chọn)"
                  : "Nhập mật khẩu"
              }
            />
          </div>

          <div>
            <label
              htmlFor="user-phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="user-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div>
            <label
              htmlFor="user-role-form"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              id="user-role-form"
              required
              value={formData.roleCode}
              onChange={(e) =>
                setFormData({ ...formData, roleCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
            >
              {ROLE_OPTIONS.map((roleCode) => (
                <option key={roleCode} value={roleCode}>
                  {roleCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </div>

            <ImageUpload
              folder="users"
              multiple={false}
              maxFiles={1}
              onUploadSuccess={(imageUrl) =>
                setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }))
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              {editingUser ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for User Details (use shared Modal) */}
      <Modal
        isOpen={isDetailOpen && !!detailUser}
        onClose={handleCloseDetails}
        title="Chi tiết người dùng"
        maxWidth="max-w-lg"
      >
        {detailUser ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 flex-shrink-0">
                <div className="h-14 w-14 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {detailUser.avatarUrl ? (
                    <img
                      className="h-14 w-14 object-cover"
                      src={detailUser.avatarUrl}
                      alt={detailUser.name}
                    />
                  ) : (
                    <span className="text-gray-700 font-semibold text-lg">
                      {detailUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-900 truncate">
                  {detailUser.name}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {detailUser.email}
                </div>
              </div>
              <div className="ml-auto">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    detailUser.isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {detailUser.isActive ? "Hoạt động" : "Ngưng"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </div>
                <div className="text-sm text-gray-900">{detailUser.id}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </div>
                <div className="text-sm text-gray-900">
                  {detailUser.phone || "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </div>
                <div className="text-sm text-gray-900">
                  {detailUser.roleCode}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avatar URL
                </div>
                <div className="text-sm text-gray-900 break-all">
                  {detailUser.avatarUrl || "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </div>
                <div className="text-sm text-gray-900">
                  {formatDateTime(detailUser.createdAt)}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật lần cuối
                </div>
                <div className="text-sm text-gray-900">
                  {formatDateTime(detailUser.updatedAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleEditFromDetails}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={handleCloseDetails}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default UserPage;
