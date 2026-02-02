const ROUTER_URL = {
    HOME: "/",
    ABOUT: `/about`,
    CONTACT: `/contact`,
    MENU : `/menu`,
    MEMBER: `/member`,
    FRANCHISE: `/franchise`,
    
    CLIENT: `/client`,
    CLIENT_ROUTER: {
        PRODUCT_DETAIL: `/client/product/:productId`,
        CLIENT_ORDER: `/client/order`,
    },


    ADMIN: `/admin`,
    ADMIN_ROUTER: {
    ADMIN_DASHBOARD: `/admin/dashboard`,
    ADMIN_MENU: `/admin/menu`,
    ADMIN_CATEGORY: `/admin/category`,
    ADMIN_CUSTOMER: `/admin/customer`,
    ADMIN_FRANCHISE: `/admin/franchise`,
    ADMIN_INVENTORY: `/admin/inventory`,
    ADMIN_LOYALTY: `/admin/loyalty`,
    ADMIN_ORDER: `/admin/order`,
    ADMIN_PAYMENT: `/admin/payment`,
    ADMIN_PRODUCT: `/admin/product`,
    ADMIN_USER: `/admin/user`,
    ADMIN_SETTINGS: `/admin/settings`,
    ADMIN_LOGOUT: `/admin/logout`,
    ADMIN_LOGIN: `/admin/login`,
    FORGOT_PASSWORD: `/admin/forgot-password`,
    RESET_PASSWORD: `/admin/reset-password`,
    VERIFY_TOKEN: "/admin/verify",
    }
}

export default ROUTER_URL;