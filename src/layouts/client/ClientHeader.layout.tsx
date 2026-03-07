import { ChevronDown, LogOut, UserRound } from "lucide-react";
import ROUTER_URL from "../../routes/router.const";
import MenuItemRender from "./partials/MenuItemRender";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FRANCHISE_SEED_DATA } from "@/mocks/franchise.seed";
import FranchiseSelect from "./partials/FranchiseSelect";
import ClientLoading from "@/components/Client/Client.Loading";
import { customerLogout } from "@/pages/client/auth/services/customerAuth06.service";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
const ClientHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get customer from Zustand store
  const customer = useCustomerAuthStore((state) => state.customer);
  const clearCustomer = useCustomerAuthStore((state) => state.clearCustomer);
  const isLoggedIn = !!customer;

  const navigate = useNavigate();
  const [selectedFranchise, setSelectedFranchise] = useState<number>(() => {
    const saved = localStorage.getItem("selectedFranchise");
    return saved ? Number(saved) : 1;
  });
  const [isFranchiseDropdownOpen, setIsFranchiseDropdownOpen] = useState(false);
  const franchiseDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const MenuItem = [
    {
      id: "home",
      label: "Trang chủ",
      path: ROUTER_URL.HOME,
    },
    {
      id: "about",
      label: "Giới thiệu",
      path: ROUTER_URL.ABOUT,
    },
    {
      id: "menu",
      label: "Danh mục",
      path: ROUTER_URL.MENU,
    },
    {
      id: "member",
      label: "Hội viên",
      path: ROUTER_URL.MEMBER,
    },
    {
      id: "franchise",
      label: "Nhượng quyền",
      path: ROUTER_URL.FRANCHISE,
    },
    {
      id: "contact",
      label: "Liên hệ",
      path: ROUTER_URL.CONTACT,
    },
  ];

  const handleClickOutside = (event: MouseEvent) => {
    if (
      franchiseDropdownRef.current &&
      !franchiseDropdownRef.current.contains(event.target as Node)
    ) {
      setIsFranchiseDropdownOpen(false);
    }
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target as Node)
    ) {
      setIsProfileOpen(false);
    }
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node)
    ) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isFranchiseDropdownOpen || isProfileOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFranchiseDropdownOpen, isProfileOpen, isMobileMenuOpen]);

  const franchise = FRANCHISE_SEED_DATA;

  const handleFranchiseSelect = (franchiseId: number) => {
    setIsLoading(true);
    setIsFranchiseDropdownOpen(false);

    // Simulate loading time for better UX
    setTimeout(() => {
      setSelectedFranchise(franchiseId);
      localStorage.setItem("selectedFranchise", franchiseId.toString());

      // Dispatch custom event để các component khác biết localStorage đã thay đổi
      window.dispatchEvent(
        new CustomEvent("franchiseChanged", {
          detail: { franchiseId },
        }),
      );

      setIsLoading(false);
    }, 800);
  };

  const handleLogout = async () => {
    try {
      await customerLogout();

      // Clear customer from Zustand store
      clearCustomer();

      toastSuccess("Đăng xuất thành công!");
      navigate(ROUTER_URL.HOME);
      setIsProfileOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err?.response?.data?.message || "Đăng xuất thất bại. Vui lòng thử lại!",
      );
    }
  };

  return (
    <>
      {isLoading && <ClientLoading />}
      <header className="sticky top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <a className="flex items-center gap-2 sm:gap-3" href="#">
            <div className="size-8 sm:size-10 rounded-full flex items-center justify-center text-background-dark">
              <img
                className=" rounded-full"
                src="src/assets/Logo/Logo.png"
                alt="Logo"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-primary leading-none">
                ChoiCoffee
              </h1>
              <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-[#b8ad9d] uppercase tracking-wider">
                Heritage Coffee
              </p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {MenuItem.map((item) => (
              <MenuItemRender key={item.id} item={item} />
            ))}
          </nav>

          <div className="flex gap-1 sm:gap-2 border-l border-charcoal/10 dark:border-white/10 pl-2 sm:pl-6 items-center">
            <div className="hidden lg:flex items-center gap-2 border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-primary text-xl">
                location_on
              </span>
              <div className="relative" ref={franchiseDropdownRef}>
                <button
                  title="franchise"
                  onClick={() =>
                    setIsFranchiseDropdownOpen(!isFranchiseDropdownOpen)
                  }
                  className="hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm w-48 font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-primary dark:text-primary hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex justify-between items-center"
                >
                  <FranchiseSelect
                    isOpen={isFranchiseDropdownOpen}
                    franchises={franchise}
                    selectedFranchise={selectedFranchise}
                    onSelectFranchise={handleFranchiseSelect}
                  />
                  <ChevronDown
                    size={16}
                    className={`text-primary transition-transform duration-200 ${
                      isFranchiseDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.CART)}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 w-8 sm:h-10 sm:w-10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-white gap-2 text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">
                shopping_cart
              </span>
            </button>
            <button className="hidden sm:flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-white gap-2 text-sm font-bold min-w-0 px-2.5 relative">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN)}
                  className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.REGISTER)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="cursor-pointer flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 pl-1 sm:pl-2 pr-0.5 sm:pr-1 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                >
                  <img
                    src={customer?.avatarUrl || "https://i.pravatar.cc/300"}
                    alt="Avatar"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200"
                  />
                  <ChevronDown
                    size={14}
                    className="text-gray-400 hidden sm:block"
                  />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {customer?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer?.email || ""}
                      </p>
                    </div>

                    <a
                      onClick={() => {
                        navigate("/client/profile");
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125] cursor-pointer"
                    >
                      <UserRound size={16} /> Hồ sơ cá nhân
                    </a>
                    <a
                      onClick={() => {
                        navigate("/client/order");
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125] cursor-pointer"
                    >
                      <UserRound size={16} /> Đơn hàng
                    </a>

                    <a
                      onClick={() => {
                        navigate("/client/loyalty");
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125] cursor-pointer"
                    >
                      <UserRound size={16} /> Tích điểm
                    </a>

                    <a
                      onClick={() => {
                        navigate("/client/history");
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125] cursor-pointer"
                    >
                      <UserRound size={16} /> Lịch sử đơn hàng
                    </a>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-900 dark:text-white p-1"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile*/}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-16 sm:top-20 left-0 right-0 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-white/10 shadow-lg animate-in slide-in-from-top-2"
          >
            <nav className="flex flex-col py-2">
              {MenuItem.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-primary dark:hover:text-primary transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  {item.label}
                </a>
              ))}

              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">
                    location_on
                  </span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Chọn chi nhánh
                  </span>
                </div>
                <div className="relative" ref={franchiseDropdownRef}>
                  <a
                    onClick={() => {
                      navigate("/client/loyalty");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125] cursor-pointer"
                  >
                    <UserRound size={16} /> Tích điểm
                  </a>

                  <a
                    onClick={() => {
                      navigate("/client/history");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125] cursor-pointer"
                  >
                    <UserRound size={16} /> Lịch sử đơn hàng
                  </a>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      title="franchise"
                      onClick={() =>
                        setIsFranchiseDropdownOpen(!isFranchiseDropdownOpen)
                      }
                      className="w-full hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-primary dark:text-primary hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex justify-between items-center"
                    >
                      <FranchiseSelect
                        isOpen={isFranchiseDropdownOpen}
                        franchises={franchise}
                        selectedFranchise={selectedFranchise}
                        onSelectFranchise={handleFranchiseSelect}
                      />
                      <ChevronDown
                        size={16}
                        className={`text-primary transition-transform duration-200 ${
                          isFranchiseDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default ClientHeader;
