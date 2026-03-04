import { useEffect, useState, type SyntheticEvent } from "react";
import { toastSuccess, toastError } from "../../../utils/toast.util";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type UserListItem,
} from "../../../services/user.service";
import ClientLoading from "@/components/Client/Client.Loading";

interface UserFormData {
  email: string;
  password: string;
  name: string;
  phone: string; // added phone field
  roleCode: string;
  avatarUrl?: string;
}

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "STAFF", "CUSTOMER"];

const UserPage = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    name: "",
    phone: "", // initialize phone
    roleCode: "STAFF",
    avatarUrl: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingUser) {
      const result = await updateUser(editingUser.id, {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        roleCode: formData.roleCode,
        avatarUrl: formData.avatarUrl,
        ...(formData.password ? { password: formData.password } : {}),
      });

      if (!result.ok) {
        toastError(result.message);
        return;
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? result.user : user)),
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

  const handleDelete = async (userId: number) => {
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



  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.roleCode === filterRole;
    return matchesSearch && matchesRole;
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
            <div className="flex gap-2">
              <input
                id="user-search"
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap font-medium"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="user-status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lọc theo trạng thái
            </label>
            <select
              id="user-role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              {ROLE_OPTIONS.map((roleCode) => (
                <option key={roleCode} value={roleCode}>
                  {roleCode}
                </option>
              ))}
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
               <ClientLoading/>
              ) : null}
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
                !isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                )
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
                    value={formData.roleCode}
                    onChange={(e) =>
                      setFormData({ ...formData, roleCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ROLE_OPTIONS.map((roleCode) => (
                      <option key={roleCode} value={roleCode}>
                        {roleCode}
                      </option>
                    ))}
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
