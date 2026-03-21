import { z } from "zod";

const getCartSchema = (mode: "create" | "edit" | "view") => {
    return z.object({
        customer_id: z.string ,
    });
}

