const PRODUCTS = [
    {
      id: "CF-001",
      name: "Robusta Honey Đặc Sản - Túi 1kg",
      category: "coffee-beans",
      price: 245000,
      originalPrice: 280000,
      unit: "túi",
      stock: 45,
      badge: "best-seller",
      badgeLabel: "Bán chạy",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoejiyfRfGiCV7suDoOSdxe96n-2N7QFhBgIB4pcm9uDPZ4yzYYQXVViIJvS2HlGxtYbYO0MDtM1GULIm7NnRxmAEFo-lcES2eq0_iZ4JCk28NvBnbqfUItB42aH8vDozmGgApSSyUKaMs9S2VRauZPERZD9z45iLQo62xdWACg6ybrKnJngmGXe8xRUvSJPCNtWFnriJPMp-hwzMAsKSP9G9xe4z4CJgUO8ErMqxjqF2B7p_Idrtpx_7kyfK-vwZv1YW7B44gxYF7",
      isOutOfStock: false,
      description:
        "Robusta Honey đặc sản được chế biến theo phương pháp Honey, giữ lại lớp nhầy tự nhiên giúp hạt cà phê có vị ngọt dịu, hậu vị kéo dài. Phù hợp pha phin, espresso hoặc cold brew.",

      specifications: {
        origin: "Đắk Lắk, Việt Nam",
        roastLevel: "Medium",
        processing: "Honey",
        weight: "1kg",
        grindSize: "Nguyên hạt",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "CF-005",
      name: "Arabica Cầu Đất (High-Grade) - Túi 1kg",
      category: "coffee-beans",
      price: 380000,
      originalPrice: null,
      unit: "túi",
      stock: 12,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGC0JeVY6uEZorXEIGE1WTRoXEu57xyRIt5xrh-EzheuKhMB0oM5IXvnyMsFU7Ge0F1VJD67HrQ636iT3rSmphS3zqK6w3DL1I9hbK7PTSLof8n9CGk7gv-deJeswAgHu_wHm7GymxsOQil6OFBR-OEi9T9Y8VlyICP3WrD3Iil_7r_PbwuDHJl5_sihoryqCiC-9O7byAC1XZfm4PaxAIJOj05XOcUwFCp4Yeerwi3HmKWoR5x_66WiFElgvmwgBoTxwtkPHyIfrx",
      isOutOfStock: false,
      description:
        "Arabica Cầu Đất high-grade với hương thơm hoa quả nhẹ, vị chua thanh cân bằng và hậu vị sạch. Phù hợp cho espresso, pour-over và hand brew.",

      specifications: {
        origin: "Cầu Đất, Lâm Đồng, Việt Nam",
        roastLevel: "Medium Light",
        processing: "Washed",
        weight: "1kg",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-012",
      name: "Choi Signature Blend (Robusta & Arabica)",
      category: "coffee-beans",
      price: 295000,
      originalPrice: null,
      unit: "túi",
      stock: 1,
      badge: "signature",
      badgeLabel: "Signature",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ13uYqD9Zg2VK76dSgJAj7twqjB8VT3nurdifiXtu81yKtCbtCBY86CV4Uq1Yld6PmyGX3YDtXNxNmV4O8OkB_-lTaCDJKADsxEVKICNGu8R3acDcNWNpQdsgFPYELbO8d48zoPAYTHdmJqykMRb83imJEX9GoI60EMiXtIit0fuYggwymQLVTaX4yxB3_wGERoKD_dEphz8rzHoGBA5uiB844367Oa03wWGxCU8VThQoJXRInyH7kn-Us0SHxS0BkjzaAiwF02p6",
      isOutOfStock: false,
      description:
        "Signature Blend của Choi Coffee kết hợp Robusta và Arabica theo tỷ lệ tối ưu, mang lại body mạnh mẽ, hậu vị chocolate và hương thơm cân bằng.",

      specifications: {
        origin: "Việt Nam",
        roastLevel: "Medium",
        processing: "Blend",
        weight: "1kg",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-020",
      name: "Cà phê Bột Pha Phin Truyền Thống - Túi 500g",
      category: "ground-coffee",
      price: 110000,
      originalPrice: null,
      unit: "túi",
      stock: 120,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDFc4NoPEJVXRLlvvA_na60sYZrLDRrUQ-xi39fMQcPxHrVGezNdwukzpYWmsckTjUKQFrldmc9qsptmdWlt4s3ndCyH2uGOG9esB2HwWjR5ngiLPBxr08VGNMftlVFybo_SM_-IMCS1folG2RKDfN6RV_ry8PZOlljILymwwJnZJh9JTpmCLWVeIgJbVprPROh0Y4q7AbToiThd5lKs-5iQxM8o_t5v9GjRg0O30KnRIlRAf5nZBLNEs3MpChIKuTGGYJcWZxDFmWM",
      isOutOfStock: false,
      description:
        "Cà phê bột rang xay sẵn dành cho pha phin truyền thống, vị đậm đà, dễ uống, phù hợp sử dụng hằng ngày.",

      specifications: {
        origin: "Việt Nam",
        roastLevel: "Medium Dark",
        processing: "Traditional",
        weight: "500g",
        grindSize: "Xay phin",
      },
    },
    {
      id: "CF-009",
      name: "Single Origin Ethiopia - Túi 250g",
      category: "coffee-beans",
      price: 450000,
      originalPrice: null,
      unit: "túi",
      stock: 0,
      badge: "out-of-stock",
      badgeLabel: "Hết hàng",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBKdehjQyfvMmm9Wv5lxZF0HZt_a3iv2ea5BO8iVOeikPyD3CPGS2JP41O5PJ2_616VQZgok4sx5CjzeCKOFisedsQ03aQkz5BZNWutr4AdLKLyp6VhrwMgzZUse7yELnfgxXa4uwlpZnZ-d6_QoZsGHrrejFCuKkuq0O-HZRVSHdF1P8jqOeOkXE5YGJ-IgjVvbUBw6KBveMm9R_EPHzs8Y2ShrkbxkgEvuddTGupU9VRYi6PiFpqQlKx2jl8ZBSovBHGyRP9vBkyv",
      isOutOfStock: true,
      description:
        "Cà phê Arabica Single Origin từ Ethiopia với hương hoa quả nhiệt đới, vị chua thanh tao và body nhẹ. Phù hợp pour-over và hand brew.",

      specifications: {
        origin: "Ethiopia",
        roastLevel: "Light",
        processing: "Washed",
        weight: "250g",
        grindSize: "Nguyên hạt",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "CF-013",
      name: "Arabica Đà Lạt Premium - Túi 500g",
      category: "coffee-beans",
      price: 320000,
      originalPrice: 350000,
      unit: "túi",
      stock: 28,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoejiyfRfGiCV7suDoOSdxe96n-2N7QFhBgIB4pcm9uDPZ4yzYYQXVViIJvS2HlGxtYbYO0MDtM1GULIm7NnRxmAEFo-lcES2eq0_iZ4JCk28NvBnbqfUItB42aH8vDozmGgApSSyUKaMs9S2VRauZPERZD9z45iLQo62xdWACg6ybrKnJngmGXe8xRUvSJPCNtWFnriJPMp-hwzMAsKSP9G9xe4z4CJgUO8ErMqxjqF2B7p_Idrtpx_7kyfK-vwZv1YW7B44gxYF7",
      isOutOfStock: false,
      description:
        "Arabica Đà Lạt Premium với hương thơm dịu, vị chua thanh nhẹ, hậu vị ngọt. Phù hợp nhiều phương pháp pha.",

      specifications: {
        origin: "Đà Lạt, Việt Nam",
        roastLevel: "Medium Light",
        processing: "Washed",
        weight: "500g",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-014",
      name: "Robusta Buôn Ma Thuột - Túi 1kg",
      category: "coffee-beans",
      price: 210000,
      originalPrice: null,
      unit: "túi",
      stock: 67,
      badge: "best-seller",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGC0JeVY6uEZorXEIGE1WTRoXEu57xyRIt5xrh-EzheuKhMB0oM5IXvnyMsFU7Ge0F1VJD67HrQ636iT3rSmphS3zqK6w3DL1I9hbK7PTSLof8n9CGk7gv-deJeswAgHu_wHm7GymxsOQil6OFBR-OEi9T9Y8VlyICP3WrD3Iil_7r_PbwuDHJl5_sihoryqCiC-9O7byAC1XZfm4PaxAIJOj05XOcUwFCp4Yeerwi3HmKWoR5x_66WiFElgvmwgBoTxwtkPHyIfrx",
      isOutOfStock: false,
      description:
        "Robusta Buôn Ma Thuột với body mạnh, vị đắng rõ và hậu vị chocolate. Phù hợp pha phin và espresso.",

      specifications: {
        origin: "Buôn Ma Thuột, Đắk Lắk",
        roastLevel: "Medium Dark",
        processing: "Natural",
        weight: "1kg",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-015",
      name: "Arabica Colombia Supremo - Túi 250g",
      category: "coffee-beans",
      price: 395000,
      originalPrice: null,
      unit: "túi",
      stock: 15,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ13uYqD9Zg2VK76dSgJAj7twqjB8VT3nurdifiXtu81yKtCbtCBY86CV4Uq1Yld6PmyGX3YDtXNxNmV4O8OkB_-lTaCDJKADsxEVKICNGu8R3acDcNWNpQdsgFPYELbO8d48zoPAYTHdmJqykMRb83imJEX9GoI60EMiXtIit0fuYggwymQLVTaX4yxB3_wGERoKD_dEphz8rzHoGBA5uiB844367Oa03wWGxCU8VThQoJXRInyH7kn-Us0SHxS0BkjzaAiwF02p6",
      isOutOfStock: false,
      description:
        "Arabica Colombia Supremo với hương caramel, vị cân bằng và hậu vị ngọt nhẹ. Thích hợp pour-over và espresso.",

      specifications: {
        origin: "Colombia",
        roastLevel: "Medium",
        processing: "Washed",
        weight: "250g",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-016",
      name: "Culi Robusta Đặc Biệt - Túi 1kg",
      category: "coffee-beans",
      price: 275000,
      originalPrice: null,
      unit: "túi",
      stock: 33,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoejiyfRfGiCV7suDoOSdxe96n-2N7QFhBgIB4pcm9uDPZ4yzYYQXVViIJvS2HlGxtYbYO0MDtM1GULIm7NnRxmAEFo-lcES2eq0_iZ4JCk28NvBnbqfUItB42aH8vDozmGgApSSyUKaMs9S2VRauZPERZD9z45iLQo62xdWACg6ybrKnJngmGXe8xRUvSJPCNtWFnriJPMp-hwzMAsKSP9G9xe4z4CJgUO8ErMqxjqF2B7p_Idrtpx_7kyfK-vwZv1YW7B44gxYF7",
      isOutOfStock: false,
      description:
        "Culi Robusta với hạt tròn đặc trưng, body dày, vị đậm và hậu vị kéo dài. Phù hợp cho espresso.",

      specifications: {
        origin: "Việt Nam",
        roastLevel: "Dark",
        processing: "Natural",
        weight: "1kg",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-017",
      name: "Arabica Typica Đà Lạt - Túi 500g",
      category: "coffee-beans",
      price: 340000,
      originalPrice: null,
      unit: "túi",
      stock: 19,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGC0JeVY6uEZorXEIGE1WTRoXEu57xyRIt5xrh-EzheuKhMB0oM5IXvnyMsFU7Ge0F1VJD67HrQ636iT3rSmphS3zqK6w3DL1I9hbK7PTSLof8n9CGk7gv-deJeswAgHu_wHm7GymxsOQil6OFBR-OEi9T9Y8VlyICP3WrD3Iil_7r_PbwuDHJl5_sihoryqCiC-9O7byAC1XZfm4PaxAIJOj05XOcUwFCp4Yeerwi3HmKWoR5x_66WiFElgvmwgBoTxwtkPHyIfrx",
      isOutOfStock: false,
      description:
        "Arabica Typica Đà Lạt với hương hoa nhẹ, vị chua thanh và hậu vị sạch. Lý tưởng cho hand brew.",

      specifications: {
        origin: "Đà Lạt, Việt Nam",
        roastLevel: "Light",
        processing: "Washed",
        weight: "500g",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-018",
      name: "Robusta Peaberry Đặc Sản - Túi 500g",
      category: "coffee-beans",
      price: 260000,
      originalPrice: 290000,
      unit: "túi",
      stock: 22,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ13uYqD9Zg2VK76dSgJAj7twqjB8VT3nurdifiXtu81yKtCbtCBY86CV4Uq1Yld6PmyGX3YDtXNxNmV4O8OkB_-lTaCDJKADsxEVKICNGu8R3acDcNWNpQdsgFPYELbO8d48zoPAYTHdmJqykMRb83imJEX9GoI60EMiXtIit0fuYggwymQLVTaX4yxB3_wGERoKD_dEphz8rzHoGBA5uiB844367Oa03wWGxCU8VThQoJXRInyH7kn-Us0SHxS0BkjzaAiwF02p6",
      isOutOfStock: false,
      description:
        "Robusta Peaberry đặc sản với vị đậm, hậu vị chocolate và body dày, thích hợp pha phin và espresso.",

      specifications: {
        origin: "Việt Nam",
        roastLevel: "Medium Dark",
        processing: "Honey",
        weight: "500g",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-019",
      name: "Arabica Bourbon Đỏ - Túi 250g",
      category: "coffee-beans",
      price: 410000,
      originalPrice: null,
      unit: "túi",
      stock: 8,
      badge: "signature",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBKdehjQyfvMmm9Wv5lxZF0HZt_a3iv2ea5BO8iVOeikPyD3CPGS2JP41O5PJ2_616VQZgok4sx5CjzeCKOFisedsQ03aQkz5BZNWutr4AdLKLyp6VhrwMgzZUse7yELnfgxXa4uwlpZnZ-d6_QoZsGHrrejFCuKkuq0O-HZRVSHdF1P8jqOeOkXE5YGJ-IgjVvbUBw6KBveMm9R_EPHzs8Y2ShrkbxkgEvuddTGupU9VRYi6PiFpqQlKx2jl8ZBSovBHGyRP9vBkyv",
      isOutOfStock: false,
      description:
        "Arabica Bourbon Đỏ với vị ngọt tự nhiên, hậu vị dài và hương trái cây chín. Phù hợp pour-over cao cấp.",

      specifications: {
        origin: "Việt Nam",
        roastLevel: "Light Medium",
        processing: "Washed",
        weight: "250g",
        grindSize: "Nguyên hạt",
      },
    },
    {
      id: "CF-021",
      name: "Blend Đặc Biệt Choi Coffee - Túi 1kg",
      category: "coffee-beans",
      price: 285000,
      originalPrice: null,
      unit: "túi",
      stock: 41,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoejiyfRfGiCV7suDoOSdxe96n-2N7QFhBgIB4pcm9uDPZ4yzYYQXVViIJvS2HlGxtYbYO0MDtM1GULIm7NnRxmAEFo-lcES2eq0_iZ4JCk28NvBnbqfUItB42aH8vDozmGgApSSyUKaMs9S2VRauZPERZD9z45iLQo62xdWACg6ybrKnJngmGXe8xRUvSJPCNtWFnriJPMp-hwzMAsKSP9G9xe4z4CJgUO8ErMqxjqF2B7p_Idrtpx_7kyfK-vwZv1YW7B44gxYF7",
      isOutOfStock: false,
      description:
        "Máy xay cà phê chuyên nghiệp với độ chính xác cao, phù hợp cho quán cà phê và gia đình nâng cao.",

      specifications: {
        power: "350W",
        voltage: "220V",
        material: "Thép & nhựa cao cấp",
        warranty: "12 tháng",
      },
    },
    {
      id: "CF-022",
      name: "Arabica Catimor Sơn La - Túi 500g",
      category: "coffee-beans",
      price: 305000,
      originalPrice: null,
      unit: "túi",
      stock: 26,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGC0JeVY6uEZorXEIGE1WTRoXEu57xyRIt5xrh-EzheuKhMB0oM5IXvnyMsFU7Ge0F1VJD67HrQ636iT3rSmphS3zqK6w3DL1I9hbK7PTSLof8n9CGk7gv-deJeswAgHu_wHm7GymxsOQil6OFBR-OEi9T9Y8VlyICP3WrD3Iil_7r_PbwuDHJl5_sihoryqCiC-9O7byAC1XZfm4PaxAIJOj05XOcUwFCp4Yeerwi3HmKWoR5x_66WiFElgvmwgBoTxwtkPHyIfrx",
      isOutOfStock: false,
    },
    {
      id: "CF-023",
      name: "Robusta Gia Lai Đặc Sản - Túi 1kg",
      category: "coffee-beans",
      price: 235000,
      originalPrice: null,
      unit: "túi",
      stock: 54,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ13uYqD9Zg2VK76dSgJAj7twqjB8VT3nurdifiXtu81yKtCbtCBY86CV4Uq1Yld6PmyGX3YDtXNxNmV4O8OkB_-lTaCDJKADsxEVKICNGu8R3acDcNWNpQdsgFPYELbO8d48zoPAYTHdmJqykMRb83imJEX9GoI60EMiXtIit0fuYggwymQLVTaX4yxB3_wGERoKD_dEphz8rzHoGBA5uiB844367Oa03wWGxCU8VThQoJXRInyH7kn-Us0SHxS0BkjzaAiwF02p6",
      isOutOfStock: false,
    },
    {
      id: "MC-001",
      name: "Máy Pha Cà Phê Espresso Delonghi",
      category: "machines",
      price: 12500000,
      originalPrice: null,
      unit: "chiếc",
      stock: 8,
      badge: "best-seller",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoejiyfRfGiCV7suDoOSdxe96n-2N7QFhBgIB4pcm9uDPZ4yzYYQXVViIJvS2HlGxtYbYO0MDtM1GULIm7NnRxmAEFo-lcES2eq0_iZ4JCk28NvBnbqfUItB42aH8vDozmGgApSSyUKaMs9S2VRauZPERZD9z45iLQo62xdWACg6ybrKnJngmGXe8xRUvSJPCNtWFnriJPMp-hwzMAsKSP9G9xe4z4CJgUO8ErMqxjqF2B7p_Idrtpx_7kyfK-vwZv1YW7B44gxYF7",
      isOutOfStock: false,
      description:
        "Máy pha cà phê espresso Delonghi dành cho gia đình và quán nhỏ. Thiết kế hiện đại, dễ sử dụng, cho ra espresso chuẩn vị.",

      specifications: {
        power: "1450W",
        voltage: "220V / 50Hz",
        capacity: "1.8L",
        material: "Thép không gỉ",
        warranty: "12 tháng chính hãng",
      },
    },
    {
      id: "MC-002",
      name: "Máy Xay Cà Phê Chuyên Nghiệp",
      category: "machines",
      price: 4800000,
      originalPrice: 5200000,
      unit: "chiếc",
      stock: 12,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCIHkN8enwgBkfJ9hOJOKfWOqk3qdv3pwwt4JV8YLly5r5Ujh0v8POc8km8hC8PiJLbp3srOGUqbsDeESqqACiY7Sq9P443wZOttj4NkncBFwbeWhOJvRKqErOMEZRC_jkIxbpvT0dU7xPOWSKfudH2hVIDw0uJN42fZpg5wgjnvNJiFjR-elRm_o1QKBQgVh-KGVL5lUZ5YtfgZni-3ctYMXdKgOnQbzgTjjYddTy1_QhfTnAmWZTswz1o3lM-DDdSwQZDVDX0PIBl",
      isOutOfStock: false,
      description:
        "Máy xay cà phê chuyên nghiệp với độ chính xác cao, phù hợp cho quán cà phê và gia đình nâng cao.",

      specifications: {
        power: "350W",
        voltage: "220V",
        material: "Thép & nhựa cao cấp",
        warranty: "12 tháng",
      },
    },
    {
      id: "MC-003",
      name: "Máy Pha Cà Phê Tự Động Jura",
      category: "machines",
      price: 28500000,
      originalPrice: null,
      unit: "chiếc",
      stock: 3,
      badge: "signature",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCIHkN8enwgBkfJ9hOJOKfWOqk3qdv3pwwt4JV8YLly5r5Ujh0v8POc8km8hC8PiJLbp3srOGUqbsDeESqqACiY7Sq9P443wZOttj4NkncBFwbeWhOJvRKqErOMEZRC_jkIxbpvT0dU7xPOWSKfudH2hVIDw0uJN42fZpg5wgjnvNJiFjR-elRm_o1QKBQgVh-KGVL5lUZ5YtfgZni-3ctYMXdKgOnQbzgTjjYddTy1_QhfTnAmWZTswz1o3lM-DDdSwQZDVDX0PIBl",
      isOutOfStock: false,
      description:
        "Máy pha cà phê tự động Jura cao cấp, tích hợp nhiều chế độ pha, cho chất lượng cà phê đồng đều.",

      specifications: {
        power: "1450W",
        voltage: "220V",
        capacity: "2.0L",
        material: "Thép không gỉ",
        warranty: "24 tháng",
      },
    },
    {
      id: "SP-001",
      name: "Ly Giấy Cao Cấp (100 cái)",
      category: "supplies",
      price: 180000,
      originalPrice: null,
      unit: "hộp",
      stock: 150,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZnPJvRDbMsKx7FR00AWNBfUKecu7CbBQsu-xiJeeTmh_kHJYid-d9-IDm2VbIH2BlX3WH29mZoqZ7-K40EFtdcdFQVZNSYI9fFfHREllm9dJBURRfVvcYXFhBsNFrs2ezg59yq-HkLRjJOCqq_GbuA0XzWw6me6Je1ZhzvO3ZAKSV9F3263ubkrPH4pmjGm6CxPbGWttMhPnU3kvf5lU_jZ6acT-ltsXFOxo_k0D9jNJGcr6ohs8QtFzpRm4IlSVSn8nu0O8LG0La",
      isOutOfStock: false,
      description:
        "Sản phẩm phụ trợ chất lượng cao, phù hợp sử dụng trong quán cà phê hoặc gia đình.",

      specifications: {
        material: "Theo tiêu chuẩn ngành",
        origin: "Việt Nam",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "SP-002",
      name: "Ống Hút Giấy Phân Hủy (500 cái)",
      category: "supplies",
      price: 95000,
      originalPrice: null,
      unit: "hộp",
      stock: 200,
      badge: "best-seller",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZnPJvRDbMsKx7FR00AWNBfUKecu7CbBQsu-xiJeeTmh_kHJYid-d9-IDm2VbIH2BlX3WH29mZoqZ7-K40EFtdcdFQVZNSYI9fFfHREllm9dJBURRfVvcYXFhBsNFrs2ezg59yq-HkLRjJOCqq_GbuA0XzWw6me6Je1ZhzvO3ZAKSV9F3263ubkrPH4pmjGm6CxPbGWttMhPnU3kvf5lU_jZ6acT-ltsXFOxo_k0D9jNJGcr6ohs8QtFzpRm4IlSVSn8nu0O8LG0La",
      isOutOfStock: false,
      description:
        "Sản phẩm phụ trợ chất lượng cao, phù hợp sử dụng trong quán cà phê hoặc gia đình.",

      specifications: {
        material: "Theo tiêu chuẩn ngành",
        origin: "Việt Nam",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "SP-003",
      name: "Bột Cacao Nguyên Chất - Hộp 500g",
      category: "supplies",
      price: 185000,
      originalPrice: null,
      unit: "hộp",
      stock: 25,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZnPJvRDbMsKx7FR00AWNBfUKecu7CbBQsu-xiJeeTmh_kHJYid-d9-IDm2VbIH2BlX3WH29mZoqZ7-K40EFtdcdFQVZNSYI9fFfHREllm9dJBURRfVvcYXFhBsNFrs2ezg59yq-HkLRjJOCqq_GbuA0XzWw6me6Je1ZhzvO3ZAKSV9F3263ubkrPH4pmjGm6CxPbGWttMhPnU3kvf5lU_jZ6acT-ltsXFOxo_k0D9jNJGcr6ohs8QtFzpRm4IlSVSn8nu0O8LG0La",
      isOutOfStock: false,
      description:
        "Sản phẩm phụ trợ chất lượng cao, phù hợp sử dụng trong quán cà phê hoặc gia đình.",

      specifications: {
        material: "Theo tiêu chuẩn ngành",
        origin: "Việt Nam",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "TL-001",
      name: "Bình Đánh Sữa Inox 304 - 600ml",
      category: "tools",
      price: 285000,
      originalPrice: null,
      unit: "cái",
      stock: 45,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoejiyfRfGiCV7suDoOSdxe96n-2N7QFhBgIB4pcm9uDPZ4yzYYQXVViIJvS2HlGxtYbYO0MDtM1GULIm7NnRxmAEFo-lcES2eq0_iZ4JCk28NvBnbqfUItB42aH8vDozmGgApSSyUKaMs9S2VRauZPERZD9z45iLQo62xdWACg6ybrKnJngmGXe8xRUvSJPCNtWFnriJPMp-hwzMAsKSP9G9xe4z4CJgUO8ErMqxjqF2B7p_Idrtpx_7kyfK-vwZv1YW7B44gxYF7",
      isOutOfStock: false,
      description:
        "Sản phẩm phụ trợ chất lượng cao, phù hợp sử dụng trong quán cà phê hoặc gia đình.",

      specifications: {
        material: "Theo tiêu chuẩn ngành",
        origin: "Việt Nam",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "TL-002",
      name: "Phin Pha Cà Phê Việt Nam Size Lớn",
      category: "tools",
      price: 125000,
      originalPrice: 150000,
      unit: "cái",
      stock: 78,
      badge: "best-seller",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGC0JeVY6uEZorXEIGE1WTRoXEu57xyRIt5xrh-EzheuKhMB0oM5IXvnyMsFU7Ge0F1VJD67HrQ636iT3rSmphS3zqK6w3DL1I9hbK7PTSLof8n9CGk7gv-deJeswAgHu_wHm7GymxsOQil6OFBR-OEi9T9Y8VlyICP3WrD3Iil_7r_PbwuDHJl5_sihoryqCiC-9O7byAC1XZfm4PaxAIJOj05XOcUwFCp4Yeerwi3HmKWoR5x_66WiFElgvmwgBoTxwtkPHyIfrx",
      isOutOfStock: false,
      description:
        "Phin pha cà phê truyền thống Việt Nam, chất liệu inox dày dặn, giữ nhiệt tốt, cho hương vị cà phê đậm đà.",

      specifications: {
        material: "Inox 304",
        capacity: "170ml",
        origin: "Việt Nam",
        warranty: "Không áp dụng",
      },
    },
    {
      id: "TL-003",
      name: "Tamper Ép Cà Phê 58mm Chuyên Nghiệp",
      category: "tools",
      price: 395000,
      originalPrice: null,
      unit: "cái",
      stock: 32,
      badge: null,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ13uYqD9Zg2VK76dSgJAj7twqjB8VT3nurdifiXtu81yKtCbtCBY86CV4Uq1Yld6PmyGX3YDtXNxNmV4O8OkB_-lTaCDJKADsxEVKICNGu8R3acDcNWNpQdsgFPYELbO8d48zoPAYTHdmJqykMRb83imJEX9GoI60EMiXtIit0fuYggwymQLVTaX4yxB3_wGERoKD_dEphz8rzHoGBA5uiB844367Oa03wWGxCU8VThQoJXRInyH7kn-Us0SHxS0BkjzaAiwF02p6",
      isOutOfStock: false,
      description:
        "Sản phẩm phụ trợ chất lượng cao, phù hợp sử dụng trong quán cà phê hoặc gia đình.",

      specifications: {
        material: "Theo tiêu chuẩn ngành",
        origin: "Việt Nam",
        warranty: "Không áp dụng",
      },
    },
  ];
    export default PRODUCTS;

