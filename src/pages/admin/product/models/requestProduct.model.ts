export interface RequestProduct {
	SKU: string;
	name: string;
	img?: string;
	description?: string;
	content?: string;
	minPrice: number;
	maxPrice: number;
	isActive?: boolean;
}

export type UpdateRequestProduct = Partial<RequestProduct>;
