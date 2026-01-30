
const ClientHeader = () => {
  const MenuItem = [
    {
      id: "home",
      label: "Trang chủ",
      path: "/",
    },
    {
      id: "about",
      label: "Giới thiệu",
      path: "/about",
    },
    {
      id: "menu",
      label: "Thực đơn",
      path: "/menu",
    },
    {
      id: "member",
      label: "Hội viên",
      path: "/member",
    },
    {
      id: "franchise",
      label: "Nhượng quyền",
      path: "/franchise",
    },
    {
      id: "contact",
      label: "Liên hệ",
      path: "/contact",
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
            <MenuItememRender key={item.id} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all text-sm cursor-pointer">
            <span className="material-symbols-outlined text-sm">
                handshake           
            </span>
            Hợp tác ngay
          </button>
          <button className="md:hidden text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
