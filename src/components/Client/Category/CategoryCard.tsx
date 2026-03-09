

const CategoryCard = () => {
  return (
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
    </div>
  );
}


export default CategoryCard