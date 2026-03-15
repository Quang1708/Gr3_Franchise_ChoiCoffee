import ProductCard from "@/components/Client/Product/ProductCard";

// import { PRODUCT_SEED_DATA } from "@/mocks/product.seed";
// import { PRODUCT_FRANCHISE_SEED_DATA } from "@/mocks/product_franchise.seed";
// import type { ProductFranchise } from "@/models/product_franchise.model";
// import { CheckCircle, Mail, PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER_URL from "@/routes/router.const";
import ButtonSubmit from "@/components/Client/Button/ButtonSubmit";
import { getPublicProducts } from "./client/product/services/product.service";
import type { Product } from "./client/product/models/product.models";
import MenuBanner from "@/components/Client/Product/Client.MenuBanner";

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
      try{
        // if (!franchiseid) return;
        const response = await getPublicProducts({ franchiseId: franchiseid || "" });
        console.log("response", response);
        if(response) { 
          setProducts(response); 
        }
      } catch (error) {
        console.error("Error fetching public products:", error);
      }
    }
    fetchPublicProducts();
  }, [franchiseid]);
  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Freshly brewed coffee"
            className="w-full h-full object-cover"
            data-alt="Close up of steaming espresso being poured"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE8WdMD_VrZYkaM5OEwGj5_-xVelCJRi7-gY7SkyXIpHx8vVZMEtes3tmpf3BJeASbl1-pToNc-Si2Po39lQWtVkDdTiS4WLQG-rTnedsLId2RjfVxv6NHp2SxjRwWy0rLuUPhLw3ZPc0heUDpLuF2HHgmCeg-QxUwX8mQjKrhOymUIhTm6Sd0g-wW0xIjPmuGzfNa_bEiE6V55djYHP1T0qN0nX0CbFieOqgdcnR9CHhfpd4N1JNE00xJQWfjfFdqZeqri31TLgE1"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80"></div>
        </div>
        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm mb-6">
              Mới nhất tại ChoiCoffee
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Cà phê mới cho ngày{" "}
              <span className="text-primary italic">hứng khởi</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-lg">
              Khám phá hương vị cà phê nguyên chất từ nông trại cao nguyên đến
              tách cà phê của bạn. Giao hàng nhanh chóng, hương vị trọn vẹn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ButtonSubmit
                label="Khám phá ngay"
                className="cursor-pointer px-10 py-4 active:scale-95 w-full sm:w-auto"
                onClick={() => navigate(ROUTER_URL.MENU)}
              />
              <button className="bg-input-border dark:bg-white/10 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white transition-colors cursor-pointer"
                onClick={() => {navigate(ROUTER_URL.MENU)}}
              >
                Xem thực đơn
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between mb-12 cursor-pointer">
            <h2 className="text-3xl font-bold">Danh mục nổi bật</h2>
            <a
              className="text-primary font-semibold flex items-center gap-1 hover:underline"
              onClick={() => {
                navigate(ROUTER_URL.MENU);
              }}
            >
              Tất cả danh mục{" "}
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative h-80 overflow-hidden rounded-xl cursor-pointer">
              <img
                alt="Coffee Beans"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                data-alt="High quality roasted coffee beans in a bag"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChxFm_SC8ZQ6lfMrYigGCqTRfkoZtJrRc_VZFl9jhFJm5ZkYDomcp-VypFZ-lLg1g_QQT-qN9qptgtC0fjmZlBHgfnE97VI4zpWzegGplBQmptaTErp636WX767bePcgYIHo9PImsVEAl2-47q0z2_JoxKj2TMlDwvmPKK_3RNNEYQ0NyPB22Hvog5ZONn4VhcoCKoekufGL4bzSoxxMCK_cx4q_dSvkBNLV5pg3M2lSDxUIGbaT6BPxeWEn8TOqCieCcO2q5ZZzAf"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-bold">Cà phê hạt</h3>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Rang xay thủ công, đậm đà nguyên bản
                </p>
              </div>
            </div>

            <div className="group relative h-80 overflow-hidden rounded-xl cursor-pointer">
              <img
                alt="Brewing Tools"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                data-alt="Pour over coffee dripper and kettle set"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1jOQQTDH3x2Tv35Z3FSN8w3pY4OI7Of4C72C4zm0YWiuP13c7J9A9Q4C0Nz46Bc5qgWPxOsEhNGWVCjxTU3CI_xyuTiOTjAZoBdWktSr8UC0AgYsjQxB89VoKtGmZswX-UoYNvDN7ZMXKA6F5dCIFMk9VGT65gBvd12ucdB4uAsp5WYu5A4MQS13_GhtYg4Zf4Mth1gWYyBEbK9BHOTvs1NAL3RzXOr3R3mqjgF607JNOv3gSDYGH1gWXbU_aiNYbUvaQVR2sYZzL"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-bold">
                  Dụng cụ pha chế
                </h3>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Chuyên nghiệp hóa không gian cà phê của bạn
                </p>
              </div>
            </div>

            <div className="group relative h-80 overflow-hidden rounded-xl cursor-pointer">
              <img
                alt="Gift Combos"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                data-alt="Beautifully packaged coffee gift box set"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCaOxmTxTxF3gPSNTedMEawCBKT0gtxy1T129Iv1X4CqwYj_-Lt3Pu98rPXIiFx-qy1kpXs2_QB4vUGkzn4xL-6m70IA6nS0wC0wDKM8qPpB9vpKErnPpJLnoIJ0aLGSY-R4etay-oSG9GbwDznNd3WXejuUfEVoCWx9a9RB8cugQgomGqj1Satt9wgzwOKlpxPfKtyMwNmN_IK-8DmnCi4KtrU48jSFVVomcqHXBit6_RsE2wsiwr3tTCo3erM8gMC9T4HOAAa5oh"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-bold">
                  Combo quà tặng
                </h3>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Gửi trao tâm tình qua từng tách cà phê
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white dark:bg-background-dark">
        <div className=" mx-auto px-4 sm:px-6 lg:px-40">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-center text-charcoal dark:text-white">
              Sản phẩm nổi bật
            </h2>
          </div>
          <div className="flex justify-end items-center mb-5 cursor-pointer">
            <a
              className="text-primary font-semibold flex items-center gap-1 hover:underline"
              onClick={() => {
                navigate(ROUTER_URL.MENU);
              }}
            >
              Tất cả sản phẩm{" "}
            </a>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="flex gap-6">
              {products.map((item) => (
                <div key={item.product_id} className="w-70 shrink-0">
                  <ProductCard key={item.product_id} item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto p-4 md:p-8 lg:p-16">
        <MenuBanner/>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="bg-primary rounded-2xl p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-white space-y-4 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-black">
                Nhận ưu đãi 10% ngay!
              </h2>
              <p className="text-white/80 text-lg">
                Đăng ký nhận bản tin để cập nhật những chương trình khuyến mãi
                và sản phẩm mới nhất từ ChoiCoffee.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="w-full lg:w-80 px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium bg-input-border"
                  placeholder="Địa chỉ email của bạn"
                  type="email"
                />
                <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors whitespace-nowrap">
                  Đăng ký ngay
                </button>
              </div>
              <p className="text-white/60 text-xs mt-3 text-center lg:text-left">
                * Chúng tôi cam kết bảo mật thông tin của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
