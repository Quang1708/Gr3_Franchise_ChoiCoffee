
const ClientFooter = () => {
  return (
    <footer className="bg-espresso text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 text-primary">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight uppercase">
              ChoiCoffee
            </h2>
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
          <ul className="space-y-4 text-white/60 text-sm"></ul>
            <li><a class="hover:text-primary transition-colors" href="#">Về ChoiCoffee</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Mô hình cửa hàng</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Vùng nguyên liệu</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Quy trình vận hành</a></li>
        </div>
      </div>
    </footer>
  );
}



export default ClientFooter