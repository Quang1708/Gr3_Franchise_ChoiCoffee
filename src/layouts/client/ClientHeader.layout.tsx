import { ChevronDown, LogOut, UserRound } from "lucide-react";
import ROUTER_URL from "../../routes/router.const";
import MenuItemRender from "./partials/MenuItemRender";
import { useState } from "react";

const ClientHeader = () => {
  const [isProfileOpen, setIsProfileOpen] =  useState<boolean>(false);
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

    
    
  return (
    <header className="sticky top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
      <div className="max-w mx-auto px-6 h-20 flex items-center justify-between">
        <a className="flex items-center gap-3" href="#">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-background-dark">
            <span className="material-symbols-outlined font-bold">coffee</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-primary leading-none">
              ChoiCoffee
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-[#b8ad9d] uppercase tracking-wider">
              Heritage Coffee
            </p>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {MenuItem.map((item) => (
            <MenuItemRender key={item.id} item={item} />
          ))}
        </nav>

        <div className="flex gap-2 border-l border-charcoal/10 dark:border-white/10 pl-6">
          <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-white gap-2 text-sm font-bold min-w-0 px-2.5">
            <span className="material-symbols-outlined text-xl">
              shopping_cart
            </span>
          </button>
          <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-white gap-2 text-sm font-bold min-w-0 px-2.5 relative">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="relative">
            <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="cursor-pointer flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
              <img
                src={"https://i.pravatar.cc/300"}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-gray-200"
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
                      A Nguyễn
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {"Nguyễn Văn A"}
                    </p>
                  </div>

                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125]"
                  >
                    <UserRound size={16} /> Hồ sơ cá nhân
                  </a>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      // onClick={() => navigate("/login")}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
          </div>

          <button className="md:hidden text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
