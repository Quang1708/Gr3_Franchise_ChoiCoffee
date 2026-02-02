import React from 'react';

const ContactPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-white font-display overflow-x-hidden">

      <div className="relative w-full h-[250px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop")'
          }}
        ></div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4 drop-shadow-md">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Kết nối với ChoiCoffee để khởi đầu hành trình nhượng quyền bền vững và kiến tạo giá trị văn hóa cà phê Việt.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">

          <div className="flex flex-col order-2 lg:order-1">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-charcoal text-lg md:text-xl font-bold mb-3">Gửi yêu cầu tư vấn</h2>
              <p className="text-clay text-sm md:text-base">Để lại thông tin, đội ngũ tư vấn chiến lược của chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ làm việc.</p>
            </div>

            <form className="space-y-5 md:space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold ml-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  required
                  className="w-full rounded-xl border border-input-border h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-clay/50 text-sm md:text-base"
                  placeholder="Nguyễn Văn A"
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold ml-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  required
                  className="w-full rounded-xl border border-input-border h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-clay/50 text-sm md:text-base"
                  placeholder="0901 234 567"
                  type="tel"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold ml-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  required
                  className="w-full rounded-xl border border-input-border h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-clay/50 text-sm md:text-base"
                  placeholder="partner@choicoffee.com"
                  type="email"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3.5 md:py-4 rounded-xl shadow-xl shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Gửi yêu cầu ngay</span>
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-primary/10 shadow-sm">
              <h3 className="text-xl md:text-xl font-bold mb-6 text-primary uppercase tracking-wider text-center lg:text-left">Thông tin liên hệ</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl md:text-2xl">location_on</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-sm md:text-base mb-1">Trụ sở chính</p>
                    <p className="text-clay text-xs md:text-sm leading-relaxed">
                      FPT Software HCM - Lô T2, Đường D1, Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl md:text-2xl">call</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-sm md:text-base mb-1">Hotline tư vấn</p>
                    <p className="text-clay text-xs md:text-sm">(+84) 243 768 9048 (24/7)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl md:text-2xl">mail</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-sm md:text-base mb-1">Email hợp tác</p>
                    <p className="text-clay text-xs md:text-sm">franchise@choicoffee.vn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-input-border shadow-lg h-[250px] md:h-[350px] relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4436614509425!2d106.772597!3d10.852264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f2381667%3A0x28456475e0481d02!2sFPT%20Software%20HCMC!5e0!3m2!1svi!2s!4v1715678901234!5m2!1svi!2s"
                title="Google Map FPT Software"
                className="w-full h-full border-0 contrast-[1.1]"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;