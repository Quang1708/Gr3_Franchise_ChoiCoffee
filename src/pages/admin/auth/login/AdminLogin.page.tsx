import React from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ROUTER_URL from "../../../../routes/router.const";
import coffee3d from "../../../../assets/coffee_3d.jpg";
import {
  AdminAuthSchema,
  type AdminAuthSchemaType,
} from "./schema/AdminAuth.schema";
import { toastSuccess } from "../../../../utils/toast.util";
import {
  MOCK_ROLES,
  MOCK_USERS,
  MOCK_USER_ROLES,
} from "../../../../mocks/new_mocks/mockUser";
import { useAuthStore } from "../../../../stores/auth.store";
import type { RoleCode } from "../../../../models/new_models/user.model";

const ADMIN_ROLE_CODE: RoleCode = "SUPER_ADMIN";

type MockUser = (typeof MOCK_USERS)[number];
type MockRole = (typeof MOCK_ROLES)[number];
type MockUserRole = (typeof MOCK_USER_ROLES)[number];

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePassword = (password: string) => password.trim();

const isActiveUser = (user: MockUser) => user.isActive && !user.isDeleted;

const isValidUserCredential = (
  user: MockUser,
  email: string,
  password: string,
) =>
  normalizeEmail(user.email) === normalizeEmail(email) &&
  isActiveUser(user) &&
  user.passwordHash === normalizePassword(password);

const getUserRoles = (userId: string | number) =>
  MOCK_USER_ROLES.filter(
    (ur) => String(ur.userId) === String(userId) && !ur.isDeleted,
  );

const getRoleById = (roleId: string | number): MockRole | undefined =>
  MOCK_ROLES.find(
    (role) => String(role.id) === String(roleId) && !role.isDeleted,
  );

const hasAdminRole = (userRoles: MockUserRole[]) =>
  userRoles.some((ur) => getRoleById(ur.roleId)?.code === ADMIN_ROLE_CODE);

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<AdminAuthSchemaType>({
    resolver: zodResolver(AdminAuthSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const getInputClass = (hasError: boolean) =>
    `w-full h-10 pl-10 rounded-lg outline-none border transition ` +
    (hasError
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
      : "border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-gray-50");

  const setAuthError = (message: string) => {
    setError("email", { type: "manual", message });
    setError("password", { type: "manual", message });
  };

  const onSubmit = async (values: AdminAuthSchemaType) => {
    const foundUser = MOCK_USERS.find((user) =>
      isValidUserCredential(user, values.email, values.password),
    );

    if (!foundUser) {
      setAuthError("Email hoặc mật khẩu không đúng");
      return;
    }

    const userRoles = getUserRoles(foundUser.id);
    const isAdmin = hasAdminRole(userRoles);

    if (!isAdmin) {
      setAuthError("Tài khoản không có quyền admin");
      return;
    }

    const userWithRole = {
      ...foundUser,
      role: "admin",
      roleCode: ADMIN_ROLE_CODE,
    };

    // eslint-disable-next-line react-hooks/purity
    const fakeToken = `demo.${btoa(foundUser.email)}.${Date.now()}`;
    useAuthStore.getState().login(userWithRole, fakeToken);

    toastSuccess("Đăng nhập thành công!");
    clearErrors();
    navigate(ROUTER_URL.ADMIN_ROUTER.ADMIN_DASHBOARD, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-5xl h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-black to-gray-800">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: `url(${coffee3d})`,
            }}
          />

          <div className="relative z-10 flex flex-col justify-center px-10 text-white">
            <h2 className="text-4xl font-extrabold mb-3">ChoiCoffee Admin</h2>
            <p className="text-sm text-gray-200 max-w-sm">
              Quản lý cửa hàng, đơn hàng và báo cáo một cách dễ dàng và hiệu
              quả.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md flex flex-col gap-2 px-10"
          >
            <div className="flex flex-col items-center gap-1 mb-4">
              <h1 className="text-3xl font-extrabold text-black tracking-tight">
                ChoiCoffee
              </h1>
              <span className="text-sm text-gray-600">
                Đăng nhập để quản lý hệ thống cửa hàng
              </span>
            </div>

            <div className="w-full flex flex-col gap-0.5">
              <label className="text-xs text-[#8B8E98] font-semibold mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3">
                  <Mail size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Nhập email"
                  className={getInputClass(Boolean(errors.email))}
                  {...register("email")}
                />
              </div>
              <div className="min-h-[20px]">
                {errors.email?.message && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col gap-0.5">
              <label className="text-xs text-[#8B8E98] font-semibold mb-1">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className={getInputClass(Boolean(errors.password))}
                  {...register("password")}
                />
              </div>
              <div className="min-h-[20px]">
                {errors.password?.message && (
                  <span className="text-xs text-red-500">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between text-xs mt-1">
              <button
                type="button"
                className="text-black hover:underline"
                onClick={() =>
                  navigate(ROUTER_URL.ADMIN_ROUTER.FORGOT_PASSWORD)
                }
              >
                Quên mật khẩu?
              </button>
              <a
                href={ROUTER_URL.HOME}
                className="text-gray-400 hover:text-black"
              >
                Về trang chủ
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-10 rounded-lg text-white font-semibold mt-3 transition cursor-pointer
                ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="text-xs text-[#8B8E98] underline mt-3 text-center">
              Điều khoản sử dụng &amp; Chính sách
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
