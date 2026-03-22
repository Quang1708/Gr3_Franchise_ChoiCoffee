import { getCartByCustomer } from "../services/cart01.service"

export const getCustomerCart = async (customerId: string, status?: string) => {
    return await getCartByCustomer(customerId, status)
}