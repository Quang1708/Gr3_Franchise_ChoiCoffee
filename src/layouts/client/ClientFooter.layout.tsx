
const ClientFooter = () => {
  return (
    <footer className="bg-espresso text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-full flex items-center justify-center text-background-dark">
            <img
              className=" rounded-full"
              src ="src/assets/Logo/Logo.png"
              alt ="Logo"
            />
          </div>
          <div>
            <h1 className="text-xl text-primary font-extrabold tracking-tight">
              ChoiCoffee
            </h1>
             <p className="text-[10px] text-slate-100 dark:text-[#b8ad9d] uppercase tracking-wider">
              Heritage Coffee
            </p>
          </div>
            
          </div>
          <p className="text-white/60 max-w-md mb-8 leading-relaxed">
            Hệ thống nhượng quyền cà phê chuyên nghiệp hàng đầu Việt Nam, tập
            trung vào giá trị bền vững và trải nghiệm khách hàng tinh tế.
          </p>
          <div className="flex gap-4">
            <a
              className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">
                social_leaderboard
              </span>
            </a>
            <a
              className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">camera</span>
            </a>
            <a
              className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Khám phá</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Về ChoiCoffee
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Mô hình cửa hàng
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Vùng nguyên liệu
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors" href="#">
                Quy trình vận hành
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Liên hệ</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
              <span>
                FPT Software HCM - Lô T2, Đường D1, Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                call
              </span>
              <span>(+84) 243 768 9048 (24/7)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                mail
              </span>
              <span>franchise@choicoffee.vn</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}



export default ClientFooter