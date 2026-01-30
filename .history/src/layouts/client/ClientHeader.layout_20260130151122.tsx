
const ClientHeader = () => {
    const MenuItem = [
        {
            id: "home",
            label: "Trang chủ",
            path: "/"
        },
        {
            id: "about",
            label: "Giới thiệu",
            path: "/about"
        },
        {
            id: "menu",
            label: "Thực đơn",
            path: "/menu"
        },
        {
            id: "member",
            label: "Hội viên",
            path: "/member"
        },
        {
            id: "franchise",
            label: "Nhượng quyền",
            path: "/franchise"
        },
        {
            
        }
    ]
  return (
    <header className="sticky top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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

      </div>
    </header>
  );
}

export default ClientHeader