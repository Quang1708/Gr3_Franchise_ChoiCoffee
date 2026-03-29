import ProductCard from "@/components/Client/Product/ProductCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import ButtonSubmit from "@/components/Client/Button/ButtonSubmit";
import { getPublicProducts } from "./client/product/services/product.service";
import type { Product } from "./client/product/models/product.models";
import MenuBanner from "@/components/Client/Product/Client.MenuBanner";
import { ArrowRight } from "lucide-react"; 

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [franchiseid, setFranchiseid] = useState<string | null>(
    localStorage.getItem("selectedFranchise"),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setFranchiseid(localStorage.getItem("selectedFranchise"));
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("franchiseChanged" as string, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "franchiseChanged" as string,
        handleStorageChange,
      );
    };
  }, []);

  useEffect(() => {
    const fetchPublicProducts = async () => {
      try {
        const response = await getPublicProducts({ franchiseId: franchiseid || "" });
        if (response) {
          setProducts(response);
        }
      } catch (error) {
        console.error("Error fetching public products:", error);
      }
    };
    fetchPublicProducts();
  }, [franchiseid]);

  const [heroImage, setHeroImage] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuAE8WdMD_VrZYkaM5OEwGj5_-xVelCJRi7-gY7SkyXIpHx8vVZMEtes3tmpf3BJeASbl1-pToNc-Si2Po39lQWtVkDdTiS4WLQG-rTnedsLId2RjfVxv6NHp2SxjRwWy0rLuUPhLw3ZPc0heUDpLuF2HHgmCeg-QxUwX8mQjKrhOymUIhTm6Sd0g-wW0xIjPmuGzfNa_bEiE6V55djYHP1T0qN0nX0CbFieOqgdcnR9CHhfpd4N1JNE00xJQWfjfFdqZeqri31TLgE1");

useEffect(() => {
  if (products.length > 0) {
    const idx = Math.floor(Math.random() * products.length);
    setHeroImage(products[idx].image_url);
  }
}, [products]);

  return (
    <div className="bg-white dark:bg-background-dark min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Freshly brewed coffee"
            className="w-full h-full object-cover scale-105 animate-none" // Thêm animation zoom nhẹ nếu có trong tailwind.config
            src={heroImage}
          />
          {/* Tối ưu lại Gradient overlay để text dễ đọc hơn */}
          <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/75 to-transparent dark:from-charcoal/95 dark:via-charcoal/80"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10 pt-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary font-bold rounded-full text-sm mb-6 border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Mới nhất tại ChoiCoffee
            </span>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              Cà phê mới cho ngày{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-500 italic pr-2">
                hứng khởi
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-lg leading-relaxed">
              Khám phá hương vị cà phê nguyên chất từ nông trại cao nguyên đến
              tách cà phê của bạn. Giao hàng nhanh chóng, hương vị trọn vẹn.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <ButtonSubmit
                label="Khám phá ngay"
                className="cursor-pointer px-10 py-4 active:scale-95 w-full sm:w-auto shadow-lg shadow-primary/30 rounded-xl"
                onClick={() => navigate(ROUTER_URL.MENU)}
              />
              <button
                className="group flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 px-10 py-4 rounded-xl font-bold text-lg text-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer w-full sm:w-auto"
                onClick={() => navigate(ROUTER_URL.MENU)}
              >
                Xem thực đơn
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY SECTION --- */}

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="py-24 bg-white dark:bg-background-dark">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                Sản phẩm nổi bật
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Được yêu thích nhất trong tháng</p>
            </div>
            <a
              className="group text-primary font-semibold flex items-center gap-1 hover:text-orange-600 transition-colors cursor-pointer"
              onClick={() => navigate(ROUTER_URL.MENU)}
            >
              Tất cả sản phẩm
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Sử dụng snap-x để scroll ngang mượt hơn, ẩn scrollbar */}
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory hide-scrollbar">
              {products.map((item) => (
                <div key={item.product_id} className="w-70 sm:w-[320px] shrink-0 snap-start">
                  <ProductCard item={item} />
                </div>
              ))}
              {/* Card rỗng để tạo padding cuối scroll trên mobile */}
              <div className="w-1 shrink-0 sm:hidden"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MENU BANNER --- */}
      <section className="container mx-auto px-6 lg:px-20 py-12">
        <MenuBanner />
      </section>

      {/* --- NEWSLETTER SECTION --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
            {/* Background Pattern - Vòng tròn trang trí */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 text-white space-y-4 text-center lg:text-left max-w-xl">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight">
                Nhận ưu đãi <span className="text-primary">10%</span> ngay!
              </h2>
              <p className="text-slate-300 text-lg">
                Đăng ký nhận bản tin để cập nhật những chương trình khuyến mãi
                và sản phẩm mới nhất từ ChoiCoffee.
              </p>
            </div>

            <div className="relative z-10 w-full lg:w-auto min-w-[320px] lg:min-w-120">
              {/* UI Input Dạng Pill Mới */}
              <div className="relative flex flex-col sm:flex-row p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 focus-within:border-primary/50 transition-colors">
                <input
                  className="w-full px-6 py-4 bg-transparent border-none text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                  placeholder="Địa chỉ email của bạn..."
                  type="email"
                />
                <button className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 whitespace-nowrap mt-2 sm:mt-0">
                  Đăng ký
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-4 text-center lg:text-left flex items-center justify-center lg:justify-start gap-1">
                <span className="text-primary">*</span> Chúng tôi cam kết bảo mật thông tin của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;