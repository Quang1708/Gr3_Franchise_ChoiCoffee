import { useState } from "react";
import type { User } from "../../../models/user.model";
import { FAKE_ADMIN_USERS } from "../../../mocks/dataUser.const";

interface UserFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  isActive: boolean;
}

const initialUsers: User[] = FAKE_ADMIN_USERS.map((user) => ({
  id: user.id,
  email: user.email,
  passwordHash: user.password_hash,
  name: user.name,
  phone: user.phone,
  avatarUrl: user.avatar_url,
  isActive: user.is_active,
  isDeleted: user.is_deleted,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
}));

const UserPage = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    avatarUrl: "",
    isActive: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl || "",
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
        avatarUrl: "",
        isActive: true,
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
      avatarUrl: "",
      isActive: true,
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
                phone: formData.phone,
                avatarUrl: formData.avatarUrl,
                isActive: formData.isActive,
                updatedAt: new Date().toISOString(),
              }
            : user,
        ),
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now(),
        email: formData.email,
        passwordHash: formData.password,
        name: formData.name,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        isActive: formData.isActive,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }

    handleCloseModal();
  };

  const handleDelete = (userId: number) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && user.isActive) ||
      (filterActive === "inactive" && !user.isActive);
    return matchesSearch && matchesActive;
  });

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
              htmlFor="user-status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lọc theo trạng thái
            </label>
            <select
              id="user-status"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="mr-4 text-blue-600 hover:text-blue-900"
                        title="Sửa thông tin user"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa user"
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
                    htmlFor="user-phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-status-form"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="user-status-form"
                    required
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === "true" })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
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
