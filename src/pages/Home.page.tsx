import { CheckCircle, Mail, PhoneCall, Verified } from "lucide-react"

const HomePage = () => {
  return (
    <div>
      <section className="relative w-full overflow-hidden">
        <div className="max-w mx-auto px-4 sm:px-6 lg:px-40 py-8">
          <div className="relative rounded-2xl overflow-hidden min-h-150 flex items-center bg-cover bg-center"
            data-alt="Interior of a modern ChoiCoffee shop with warm lighting and wooden furniture" 
            style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuATRRv2ZVajSaGD94NFN2QVtxBuEUc58-hn9bXRn5Ni_2E6sNaeXmI20wRKsopabiRZ0EYu8FdfXlRw_ezrPtr_7Be_iQ0SA0uYXAOV6S9B2GjK6R1af7muXnAVH1CPfcj81HIRa48bWl02CsEcS2ZQVaFEX1nkrVGMoED33cbbWRNXSfPGMGb7qiHGEBl40ikPr0dbjB7oDrihvPsgei4_-tYH9rMhGD0bIiPRqL5BvaF_gKwTmJzjPqBpShcXx49jzfv9rnd9KErT')"}}>
              <div className="p-8 md:p-16 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary text-xs font-bold rounded-full mb-4 border border-primary/30 uppercase tracking-widest">
                  Hợp tác chiến lược
                </span>
                <h2 className="text-white text-4xl md:text-6xl font-black leading-tight mb-6">
                  Kiến Tạo Giá Trị <br/> Bền Vững Cùng <br/> 
                  <span className="text-primary">ChoiCoffee</span>
                </h2>
                <p className="text-gray-200 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                  Khởi nghiệp kinh doanh cà phê chuyên nghiệp với 
                  chuỗi cung ứng khép kín và hỗ trợ marketing toàn diện từ thương hiệu hàng đầu.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                   title="Tìm hiểu chương trình hợp tác chiến lược"
                   className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all flex items-center gap-2 cursor-pointer">
                     Nhận Tư Vấn Ngay
                     <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button
                  title="Xem thêm về ChoiCoffee"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-lg font-bold text-lg transition-all cursor-pointer">
                     Xem Video Giới Thiệu
                  </button>
                </div>
              </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white dark:bg-background-dark">
        <div className="max-w mx-auto px-4 sm:px-6 lg:px-40">
          <div className="mb-16">
            <h3 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Thế mạnh vượt trội</h3>
            <h2 className="text-3xl md:text-4xl font-black text-charcoal dark:text-white">Tại Sao Chọn ChoiCoffee?</h2>
            <p className="mt-4 text-gray-500 max-w-2xl text-lg">
              Chúng tôi mang đến giải pháp kinh doanh tối ưu, giúp đối tác tối thiểu hóa rủi ro và tối đa hóa lợi nhuận bền vững.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-background-light dark:bg-zinc-900 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <span className=" text-3xl"><Verified/></span>                  
              </div>
                <h4 className="text-xl font-bold mb-3">Thương hiệu uy tín</h4>
                  <p className="text-gray-500 leading-relaxed">
                    Nền tảng thương hiệu vững chắc với hàng ngàn khách hàng trung thành và độ nhận diện cao trên thị trường.
                  </p>           
            </div>
            <div className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-background-light dark:bg-zinc-900 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
                </div>
                <h4 className="text-xl font-bold mb-3">Chuỗi Cung Ứng Farm-to-Cup</h4>
                <p className="text-gray-500 leading-relaxed">
                  Kiểm soát chất lượng hạt cà phê tuyệt đối từ nông trường tại Đắk Lắk đến tận tay người tiêu dùng.
                </p>
            </div>

            <div className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-background-light dark:bg-zinc-900 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">campaign</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Hỗ Trợ Marketing 360</h4>
              <p className="text-gray-500 leading-relaxed">
                Đồng hành cùng đối tác trong các chiến dịch truyền thông đa kênh để thu hút và giữ chân khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background-light dark:bg-zinc-950">
        <div className="max-w mx-auto px-4 sm:px-6 lg:px-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-charcoal dark:text-white">Mô Hình Nhượng Quyền</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">Lựa chọn mô hình phù hợp với ngân sách và vị trí kinh doanh của bạn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-lg">PHỔ BIẾN</div>
              <h3 className="text-2xl font-bold mb-2">Mô hình Kiosk</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-primary">10-20m²</span>
              </div>
              <p className="text-gray-500 mb-8 font-medium">
                Lựa chọn tối ưu cho mặt bằng vỉa hè, tòa nhà văn phòng hoặc trung tâm thương mại.
              </p>
              <ul className="space-y-4 mb-10 grow">
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className=" text-primary text-xl"><CheckCircle/></span>
                  <span>Vốn đầu tư thấp, thu hồi nhanh</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-primary text-xl"><CheckCircle/></span>
                  <span>Tối ưu hóa quy trình vận hành</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-primary text-xl"><CheckCircle/></span>
                  <span>Menu đồ uống mang đi đặc sắc</span>
                </li>
              </ul>
              <button className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all cursor-pointer">
                Tìm hiểu
              </button>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-charcoal text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                CAO CẤP
              </div>
              <h3 className="text-2xl font-bold mb-2">Mô hình Store</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-primary">50m²+</span>
              </div>
              <p className="text-gray-500 mb-8 font-medium">Không gian trải nghiệm đẳng cấp dành cho khách hàng thưởng thức tại chỗ.</p>
              <ul className="space-y-4 mb-10 grow">
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-primary text-xl"><CheckCircle/></span>
                  <span>Kiến trúc hiện đại, sang trọng</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-primary text-xl"><CheckCircle/></span>
                  <span>Khu vực chỗ ngồi rộng rãi, thoải mái</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-primary text-xl"><CheckCircle/></span>
                  <span>Full menu và các dòng sản phẩm quà tặng</span>
                </li>
              </ul>
              <button 
                className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all"
              >
                Tìm hiểu              
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-white dark:bg-background-dark">
        <div className="max-w mx-auto px-4 sm:px-6 lg:px-40">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Bạn Đã Sẵn Sàng <br/> Đồng Hành Cùng Chúng Tôi?
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Để lại thông tin, đội ngũ tư vấn của ChoiCoffee sẽ liên hệ với bạn trong vòng 24h để trao đổi chi tiết về cơ hội kinh doanh.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className=""><PhoneCall/></span>
                  </div>
                  <div className="">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Hotline</p>
                    <p className="text-xl font-bold">0388286068</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className=""><Mail/></span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-xl font-bold">contact@choicoffee.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg bg-background-light dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Họ và tên *</label>
                  <input className="w-full bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary" 
                  placeholder="Nguyễn Văn A" 
                  type="text"/>
                </div>
                <div className="">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Số điện thoại *</label>
                  <input className="w-full bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                  placeholder="0901 234 567"
                  type="tel"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Khu vực dự định mở quán</label>
                  <select 
                  title="area"
                  className="w-full bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary">
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                    <option>Khu vực khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Ngân sách đầu tư dự kiến</label>
                  <select
                  title="budget"
                  className="w-full bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                  >
                    <option>Dưới 500 triệu</option>
                    <option>500 triệu - 1 tỷ</option>
                    <option>Trên 1 tỷ</option>
                  </select>
                </div>
                <button
                 className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-lg transition-all mt-4 uppercase tracking-wider cursor-pointer">
                  Đăng Ký Tư Vấn
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">Bằng cách nhấp vào đăng ký, bạn đồng ý với các Điều khoản bảo mật của chúng tôi.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


export default HomePage