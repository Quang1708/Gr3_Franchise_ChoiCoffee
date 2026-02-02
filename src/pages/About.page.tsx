import React from 'react';

const AboutPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-white font-display overflow-x-hidden">

      <div className="w-full">
        <div className="relative w-full h-[400px] md:h-[400px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBQwUhOUhLb38KFCcBdDR_iMncgoSePUJ9k8jiVOoaH7HWntKT3twQbyfWzjGYsAmudIx4phIpoDkG4NnFTHpO5XCR0YzcNvuu0oak_7Xpyqioy8JkmIHe1ElaIRF9VHjZb9XIvBRT9IUEH-tRWOnHOcnJQatKry1gTE8LQZqbdo4PcCCySNH5fBPn5iB1gSst7nFLY3uXHCs6QEt2-fRRNHFQoGuQn1AQmPqj5wZfVPv6JeGYGZvuXHXepxlipNnGp_IL1xIp8Cqe8")' }}
          ></div>
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4 drop-shadow-md">
              Gói trọn đam mê<br />trong từng hạt cà phê
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light max-w-[52ch] leading-relaxed">
              Hành trình mang hương vị cà phê đích thực từ những nông trại cao nguyên đến tận tay bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-6 py-16">
        <div className="flex flex-col gap-2 text-center mb-12">
          <p className="text-charcoal text-3xl md:text-4xl font-black leading-tight">Về ChoiCoffee</p>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-2"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-charcoal text-lg md:text-xl font-bold mb-6 text-center italic">
            "Hành trình từ hạt đến tách"
          </h3>
          <div className="space-y-6 text-clay text-sm md:text-base leading-relaxed text-center font-normal">
            <p>
              ChoiCoffee bắt đầu từ tình yêu mãnh liệt với hương vị cà phê truyền thống.
              Chúng tôi tin rằng mỗi hạt cà phê đều mang trong mình một câu chuyện riêng về vùng đất, khí hậu
              và đôi bàn tay của những người nông dân cần mẫn.
            </p>
            <p>
              Hành trình của chúng tôi không chỉ là việc tìm kiếm những hạt cà phê tốt nhất,
              mà còn là sự thấu hiểu nghệ thuật rang xay để đánh thức trọn vẹn hương vị tinh túy.
            </p>
            <p>
              Hôm nay, ChoiCoffee không chỉ là một điểm dừng chân để thưởng thức đồ uống,
              mà là nơi chúng tôi kết nối những tâm hồn yêu cà phê, cùng nhau chia sẻ những khoảnh khắc bình yên.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-background-light px-4 md:px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-charcoal text-xl md:text-2xl font-bold mb-2">Giá trị cốt lõi</h2>
            <p className="text-clay text-xs md:text-sm">Những nguyên tắc vàng dẫn dắt chúng tôi trong mọi hoạt động.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { icon: 'verified', title: 'Chất lượng', desc: 'Tuyển chọn hạt đạt chuẩn, quy trình rang xay khép kín giữ trọn hương vị.' },
              { icon: 'groups', title: 'Cộng đồng', desc: 'Không gian lý tưởng để kết nối, giao lưu và lan tỏa những giá trị tích cực.' },
              { icon: 'local_cafe', title: 'Trải nghiệm', desc: 'Chăm chút từng chi tiết nhỏ để nâng tầm hành trình thưởng thức của bạn.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-primary/10 shadow-sm hover:shadow-md transition-all flex items-center justify-center flex-col group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 transition-transform">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-charcoal text-sm md:text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-clay text-xs md:text-sm leading-relaxed text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 px-6 bg-primary overflow-hidden relative flex justify-center items-center">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[15rem] md:text-[30rem] select-none">format_quote</span>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="max-w-[90%] md:max-w-[55ch] text-center text-charcoal text-xl md:text-2xl font-bold leading-relaxed">
            "Tại ChoiCoffee, chúng tôi không chỉ bán cà phê. <br className="hidden md:block" />
            Chúng tôi chia sẻ một phong cách sống - <br className="hidden md:block" />
            nơi mọi người có thể 'CHƠI' cùng đam mê và tìm thấy sự thư thái giữa bộn bề cuộc sống."
          </h2>
        </div>
      </div>

      <div className="py-32 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-charcoal text-2xl md:text-3xl font-bold mb-2">Sẵn sàng cùng ChoiCoffee?</h2>
          <p className="text-clay text-xs md:text-sm mb-12">Gia nhập hệ thống nhượng quyền chuyên nghiệp và cùng chúng tôi lan tỏa văn hóa cà phê Việt.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="w-full sm:w-auto bg-primary text-white font-bold px-12 py-3.5 rounded-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
              Liên hệ nhượng quyền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;