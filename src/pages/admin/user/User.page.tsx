import { useState } from "react";
import type { User } from "../../../models/user.model";
import { ROLE, type Role } from "../../../models/role.model";
import { getCurrentUserRole } from "../../../utils/localStorage.util";
import { toastSuccess, toastError } from "../../../utils/toast.util";
import { updateUserRole } from "../../../services/user.service";
import { FAKE_ADMIN_USERS } from "../../../mocks/dataUser.const";

interface UserFormData {
  email: string;
  password: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

const initialUsers: User[] = FAKE_ADMIN_USERS.map((user) => ({
  id: user.id.toString(),
  email: user.email,
  password: user.password_hash,
  name: user.name,
  role: user.role,
  avatarUrl: user.avatar_url,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
}));

const UserPage = () => {
  const currentUserRole = getCurrentUserRole();
  const canChangeRole = currentUserRole === ROLE.ADMIN;

  const [users, setUsers] = useState<User[]>(initialUsers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    name: "",
    role: ROLE.STAFF,
    avatarUrl: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        name: "",
        role: ROLE.STAFF,
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
      role: ROLE.STAFF,
      avatarUrl: "",
    });
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                email: formData.email,
                name: formData.name,
                role: formData.role,
                avatarUrl: formData.avatarUrl,
                password: formData.password || user.password,
                updatedAt: new Date().toISOString(),
              }
            : user,
        ),
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        avatarUrl: formData.avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }

    handleCloseModal();
  };

  const handleDelete = (userId: string) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleRoleChange = async (user: User, newRole: Role) => {
    if (user.role === newRole) return;
    const result = await updateUserRole(user.id, newRole);
    if (result.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, role: newRole, updatedAt: new Date().toISOString() }
            : u,
        ),
      );
      toastSuccess("Cập nhật vai trò thành công");
    } else {
      toastError(result.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case ROLE.ADMIN:
        return "bg-red-100 text-red-800";
      case ROLE.MANAGER:
        return "bg-blue-100 text-blue-800";
      case ROLE.STAFF:
        return "bg-green-100 text-green-800";
      case ROLE.CUSTOMER:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Users</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span>
          <span>Thêm User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="user-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tìm kiếm
            </label>
            <input
              id="user-search"
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="user-role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lọc theo vai trò
            </label>
            <select
              id="user-role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as Role | "all")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value={ROLE.ADMIN}>Admin</option>
              <option value={ROLE.MANAGER}>Manager</option>
              <option value={ROLE.STAFF}>Staff</option>
              <option value={ROLE.CUSTOMER}>Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatarUrl}
                                alt={user.name}
                              />
                            ) : (
                              <span className="text-gray-600 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        disabled={!canChangeRole}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value as Role)
                        }
                        className={`min-w-[100px] px-2 py-1 text-xs font-semibold rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          canChangeRole
                            ? "bg-white border-gray-300 cursor-pointer"
                            : "bg-gray-100 border-gray-200 cursor-not-allowed opacity-75"
                        } ${getRoleBadgeColor(user.role)}`}
                        title={
                          canChangeRole
                            ? "Phân quyền (Change Role)"
                            : "Chỉ admin mới có quyền đổi vai trò"
                        }
                      >
                        <option value={ROLE.ADMIN}>Admin</option>
                        <option value={ROLE.MANAGER}>Manager</option>
                        <option value={ROLE.STAFF}>Staff</option>
                        <option value={ROLE.CUSTOMER}>Customer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(user)}
                        disabled={!canChangeRole}
                        title={
                          canChangeRole
                            ? "Sửa thông tin user"
                            : "Chỉ admin mới có quyền sửa"
                        }
                        className={`mr-4 ${
                          canChangeRole
                            ? "text-blue-600 hover:text-blue-900"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={!canChangeRole}
                        title={
                          canChangeRole
                            ? "Xóa user"
                            : "Chỉ admin mới có quyền xóa"
                        }
                        className={
                          canChangeRole
                            ? "text-red-600 hover:text-red-900"
                            : "text-gray-400 cursor-not-allowed"
                        }
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label
                    htmlFor="user-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên người dùng"
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      editingUser
                        ? "Nhập mật khẩu mới (tùy chọn)"
                        : "Nhập mật khẩu"
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-role-form"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="user-role-form"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as Role })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={ROLE.ADMIN}>Admin</option>
                    <option value={ROLE.MANAGER}>Manager</option>
                    <option value={ROLE.STAFF}>Staff</option>
                    <option value={ROLE.CUSTOMER}>Customer</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="user-avatar"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Avatar URL
                  </label>
                  <input
                    id="user-avatar"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {editingUser ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
