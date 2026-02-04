const CartPage = () => {
  const cartItems = [
    {
      product_franchise_id: 1,
      SKU: "ROB-HON-001",
      product_name: "Hạt Cà Phê Robusta Honey",
      description: "Gói 1kg - Rang mộc chuyên nghiệp",
      price_base: 150000,
      quantity: 10,
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAipKAJpWW4HTJYyovbjX6u0VLhS0_2-WjR0dHnuaPNm4dyyUcCKBpcNIULOokUR8kEidV_TEXIBrHLz9mLTGDvJ_xqNHj-6gliWBb5KsF9pVTQvuGpnQlSFA2xGscXn3JUZ2c9wF-VDTzsMOTJrccVlZT-WL3kZIkKUwscljzl88tADHflvq8TZWC4Y-s_GO-PilZj8OUD6uhcyYqQU76pZXrR0VF73983f9Gz-RepmiKRWfbYgovxFlO4ds9t4XEGBFnI3JTqZ9XH",
    },
    {
      product_franchise_id: 2,
      SKU: "MILK-CHOI-001",
      product_name: "Sữa đặc chuyên dụng Choi",
      description: "Thùng 24 hộp - Độ béo 12%",
      price_base: 600000,
      quantity: 2,
      image_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-W8w4xLrBEVLxvTueE3yLDUSO6A9n7cZ8TZGupe_CrOAnI1zNqc2hak1sp3JN5xL-ECBHhTVtf7iCSiyZLKUNqs3bZjTam17lbdGuIt-lexHWhh9g6MmijAe7GyW8ksrHs5WqKikmvNDCnqMnoOIxmPrPzAWeawxXne_fgKRkOL-TmK-OrW9hE4MHgI4LyzATQLlQ7wkKiAFzNJ4QBTreufVtLmuMRsIU5fkDoLRUQn86m3FjElvmKutTII3E5oj4izOP6oGFbjMA",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white font-display overflow-x-hidden mx-auto px-4 py-10 text-base">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight font-display">
            Giỏ hàng nhập hàng
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-2/3 space-y-4">
            <div className="flex flex-col border border-slate-100 rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-white p-4 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-500 text-sm">
                <div className="col-span-5 flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>Sản phẩm</span>
                </div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
                <div className="col-span-1 text-right">Xóa</div>
              </div>

              <div className="divide-y divide-slate-50">
                {cartItems.map((item) => (
                  <div
                    key={item.product_franchise_id}
                    className="p-4 grid grid-cols-1 md:grid-cols-12 items-center gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="col-span-5 flex gap-4">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-4 rounded border-slate-300 text-primary"
                      />
                      <div className="size-20 rounded-md overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-slate-800 line-clamp-1">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5 italic">
                          SKU: {item.SKU}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 text-center font-medium text-slate-600">
                      ₫{item.price_base.toLocaleString()}
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-center">
                        <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-l hover:bg-slate-100">
                          -
                        </button>
                        <input
                          type="text"
                          value={item.quantity}
                          className="w-10 h-8 border-y border-x-0 border-slate-200 text-center focus:ring-0"
                          readOnly
                        />
                        <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-r hover:bg-slate-100 text-primary font-bold">
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-center font-bold text-slate-800">
                      ₫{(item.price_base * item.quantity).toLocaleString()}
                    </div>

                    <div className="col-span-1 text-right">
                      <button className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <span className="material-symbols-outlined text-xl font-light">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chân bảng danh sách */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
                <label className="flex items-center gap-3 cursor-pointer font-medium text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-primary"
                  />
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </label>
                <button className="font-bold text-red-500 hover:underline flex items-center gap-1 uppercase text-xs">
                  <span className="material-symbols-outlined text-sm">
                    delete_sweep
                  </span>
                  Dọn dẹp giỏ hàng
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (1/3): TỔNG KẾT THANH TOÁN (Mapping sang bảng ORDER) */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  receipt_long
                </span>
                Thông tin đơn hàng
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Tạm tính ({cartItems.length} món)
                  </span>
                  <span className="font-bold text-slate-800">₫2.700.000</span>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>Hạng đối tác</span>
                    <span className="bg-orange-100 text-primary text-[10px] px-1.5 font-bold rounded">
                      PLATINUM
                    </span>
                  </div>
                  <span className="font-bold text-green-600">-₫135.000</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-slate-700">
                      Tổng thanh toán:
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary leading-none">
                        ₫2.565.000
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary border border-primary h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white font-bold text-sm md:text-base"
              >
                Xác nhận nhập hàng
              </button>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-50">
                <div className="flex items-start gap-3 text-xs text-slate-500 italic leading-relaxed">
                  <span className="material-symbols-outlined text-sm text-blue-500">
                    verified_user
                  </span>
                  Dữ liệu nhập hàng sẽ được lưu vào hệ thống Audit Log để quản
                  lý đối soát.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
