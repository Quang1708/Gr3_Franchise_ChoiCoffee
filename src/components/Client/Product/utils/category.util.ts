import type { CategoryFranchise } from "../models/category.model";

/**
 * Kiểm tra xem category có phải là topping category không
 * @param category - CategoryFranchise object
 * @returns true nếu là topping category
 */
export const isToppingCategory = (category: CategoryFranchise): boolean => {
    return category.category_name.toLowerCase().includes('topping') ||
           category.category_code.toLowerCase().includes('topping');
};

/**
 * Lấy topping category id từ localStorage
 * @returns topping category id hoặc null
 */
export const getToppingCategoryId = (): string | null => {
    return localStorage.getItem('toppingCategoryId');
};

/**
 * Lưu topping category id vào localStorage
 * @param categoryId - ID của topping category
 */
export const setToppingCategoryId = (categoryId: string): void => {
    localStorage.setItem('toppingCategoryId', categoryId);
};

/**
 * Xóa topping category id khỏi localStorage
 */
export const removeToppingCategoryId = (): void => {
    localStorage.removeItem('toppingCategoryId');
};
