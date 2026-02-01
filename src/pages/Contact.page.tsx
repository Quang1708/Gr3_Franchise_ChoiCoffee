const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop")'
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-md">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light max-w-3xl mx-auto">
            Kết nối với ChoiCoffee để khởi đầu hành trình nhượng quyền bền vững và kiến tạo giá trị văn hóa cà phê Việt.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto w-full px-6 py-16 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Contact Form */}
          <div className="flex flex-col animate-fade-in">
            <div className="mb-8">
              <h2 className="text-charcoal dark:text-white text-3xl font-bold mb-4">Gửi yêu cầu tư vấn</h2>
              <p className="text-clay dark:text-white/60">Để lại thông tin, đội ngũ tư vấn chiến lược của chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ làm việc.</p>
            </div>

            <form className="space-y-6">
              <div className="flex flex-col gap-1">
                <label className="text-charcoal dark:text-white text-sm font-semibold">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  required
                  className="w-full rounded-lg border border-input-border dark:border-white/10 dark:bg-white/5 h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-clay/50"
                  placeholder="Nguyễn Văn A"
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-charcoal dark:text-white text-sm font-semibold">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  required
                  className="w-full rounded-lg border border-input-border dark:border-white/10 dark:bg-white/5 h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-clay/50"
                  placeholder="0901 234 567"
                  type="tel"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-charcoal dark:text-white text-sm font-semibold">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  required
                  className="w-full rounded-lg border border-input-border dark:border-white/10 dark:bg-white/5 h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-clay/50"
                  placeholder="partner@choicoffee.com"
                  type="email"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Gửi yêu cầu ngay</span>
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>

          {/* Right Column: Info & Map */}
          <div className="flex flex-col gap-5">
            <div className="bg-white dark:bg-white/5 p-7 rounded-2xl border border-primary/10 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-primary uppercase tracking-wider">Thông tin liên hệ</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Trụ sở chính</p>
                    <p className="text-clay dark:text-white/60">
                      FPT Software HCM - Lô T2, Đường D1, Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">call</span>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Hotline tư vấn</p>
                    <p className="text-clay dark:text-white/60">(+84) 243 768 9048 (24/7)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">mail</span>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Email hợp tác</p>
                    <p className="text-clay dark:text-white/60">franchise@choicoffee.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="rounded-2xl overflow-hidden border border-input-border dark:border-white/10 shadow-lg h-[300px] relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.443661450942!2d106.7799512153344!3d10.85233199227003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763982b5319%3A0x172392c4740cf487!2sFPT%20Software!5e0!3m2!1svi!2s!4v1644000000000!5m2!1svi!2s"
                title="Google Map FPT Software"
                className="w-full h-full border-0 contrast-[1.1] transition-all duration-500"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;