import { ChevronDown, LogOut, UserRound } from "lucide-react";
import ROUTER_URL from "../../routes/router.const";
import MenuItemRender from "./partials/MenuItemRender";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FranchiseSelect from "./partials/FranchiseSelect";
import ClientLoading from "@/components/Client/Client.Loading";
import { customerLogout } from "@/pages/client/auth/services/customerAuth06.service";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { getAllFranchise } from "./services/franchise.service";
import type { Franchise } from "./models/franchise.model";
import { toast } from "react-toastify";
import { useCustomerAuthStore } from "@/stores";
import { getCartByCustomerId } from "./usecases/getCartItem.usecase";
import { countItemInCart } from "./usecases/countCartItem.usecase";
const ClientHeader = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const customer = useCustomerAuthStore((state) => state.customer);
  const clearCustomer = useCustomerAuthStore((state) => state.clearCustomer);
  const setLoggingOut = useCustomerAuthStore((state) => state.setLoggingOut);
  const isLoggedIn = !!customer;

  const navigate = useNavigate();
  const [selectedFranchise, setSelectedFranchise] = useState<string>("");
  const [isFranchiseDropdownOpen, setIsFranchiseDropdownOpen] = useState(false);
  const franchiseDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [countItem, setCountItem] = useState<number>(0);

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

  const fetchFranchise = async () => {
    try {
      setIsLoading(true);
      const response = await getAllFranchise();
      if (response) {
        setIsLoading(false);
        setFranchises(response);
        console.log("franchise", response);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Fetch franchise failed:", error);
      toast.error("Không thể tải danh sách chi nhánh. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchise();
  }, []);

  useEffect(() => {
    if (franchises.length === 0) return;

    const savedFranchise = localStorage.getItem("selectedFranchise");

    if (savedFranchise) {
      setSelectedFranchise(savedFranchise);
    } else {
      const firstFranchiseId = franchises[0]?.id;

      if (firstFranchiseId) {
        setSelectedFranchise(firstFranchiseId);
        localStorage.setItem("selectedFranchise", firstFranchiseId);
      }

      window.dispatchEvent(
        new CustomEvent("franchiseChanged", {
          detail: { franchiseId: firstFranchiseId },
        }),
      );
    }
  }, [franchises]);

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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleFranchiseSelect = (franchiseId: string) => {
    setIsLoading(true);
    setIsFranchiseDropdownOpen(false);

    // Simulate loading time for better UX
    setTimeout(() => {
      setSelectedFranchise(franchiseId);
      localStorage.setItem("selectedFranchise", franchiseId);

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
      // Set logging out flag first
      setLoggingOut(true);
      setIsProfileOpen(false);

      await customerLogout();

      // Clear customer from Zustand store
      clearCustomer();

      toastSuccess("Đăng xuất thành công!");

      // Reset logging out flag
      setLoggingOut(false);

      // Navigate to home
      navigate(ROUTER_URL.HOME, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toastError(
        err?.response?.data?.message || "Đăng xuất thất bại. Vui lòng thử lại!",
      );
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetchCartId = async () => {
      try {
        const response = await getCartByCustomerId(customer?.id || "");
        if (response) {
          setCartId(response[0]?._id || null);
        }
      } catch (error) {
        console.error("Error fetching cart ID:", error);
      }
    };
    fetchCartId();
  }, [customer?.id]);

  useEffect(() => {
    const fetchCountItem = async () => {
      if (!cartId) return;
      try {
        const response = await countItemInCart(cartId);
        if (response) {
          setCountItem(response.count);
        }
      } catch (error) {
        console.error("Error fetching count item in cart:", error);
      }
    };
    fetchCountItem();
    window.addEventListener("cartUpdated", fetchCountItem);

    return () => {
      window.removeEventListener("cartUpdated", fetchCountItem);
    };
  }, [cartId]);

  return (
    <>
      {isLoading && <ClientLoading />}
      <header className="sticky top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="w-full mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <a className="flex items-center gap-2 sm:gap-3" href="#">
            <div className="size-8 sm:size-10 rounded-full flex items-center justify-center text-background-dark">
              <img
                className=" rounded-full"
                src="https://res.cloudinary.com/du261e4fa/image/upload/v1774666883/customers/Logo_ugca79.png"
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

          <div className="flex gap-1 sm:gap-2 border-l border-charcoal/10 dark:border-white/10 pl-2 sm:pl-4 items-center">
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
                    franchises={franchises}
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
              className="hidden sm:flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 w-8 sm:h-10 sm:w-10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-white gap-2 text-sm font-bold min-w-0 relative"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">
                shopping_cart
              </span>
              <span className="absolute top-1 right-1 w-2 h-2 text-primary">
                {countItem > 0 ? countItem : ""}
              </span>
            </button>
            <button className="hidden sm:flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-white gap-2 text-sm font-bold min-w-0 px-2.5 relative">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN)}
                  className="cursor-pointer px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.REGISTER)}
                  className="cursor-pointer px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
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
                    src={customer?.avatar_url || "https://i.pravatar.cc/300"}
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
                        navigate("/client/order?tab=completed");
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
              className="md:hidden text-slate-900 dark:text-white p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10"
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
            className="md:hidden absolute top-16 sm:top-20 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-white/10 shadow-lg animate-in slide-in-from-top-2"
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

              {!isLoggedIn && (
                <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 ">
                  <button
                    onClick={() => {
                      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      navigate(ROUTER_URL.CLIENT_ROUTER.REGISTER);
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm font-semibold text-white bg-primary rounded-lg cursor-pointer"
                  >
                    Đăng ký
                  </button>
                </div>
              )}

              {isLoggedIn && (
                <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                  <button
                    onClick={() => {
                      navigate(ROUTER_URL.CLIENT_ROUTER.PROFILE);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md"
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      navigate(ROUTER_URL.CLIENT_ROUTER.CART);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md"
                  >
                    Giỏ hàng
                  </button>
                  <button
                    onClick={() => {
                      navigate(ROUTER_URL.CLIENT_ROUTER.CLIENT_ORDER);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md"
                  >
                    Đơn hàng
                  </button>
                </div>
              )}

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
                  <button
                    title="franchise"
                    onClick={() =>
                      setIsFranchiseDropdownOpen(!isFranchiseDropdownOpen)
                    }
                    className="w-full hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-primary dark:text-primary hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <FranchiseSelect
                      isOpen={isFranchiseDropdownOpen}
                      franchises={franchises}
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
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default ClientHeader;
