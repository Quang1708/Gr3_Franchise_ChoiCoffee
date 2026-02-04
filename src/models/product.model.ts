export interface ProductSpecifications {
  origin?: string;
  roastLevel?: string;
  processing?: string;
  weight?: string;
  grindSize?: string;
  warranty?: string;
  power?: string;
  voltage?: string;
  capacity?: string;
  material?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  stock: number;
  badge: string | null;
  badgeLabel?: string;
  image: string;
  isOutOfStock: boolean;
  description?: string;
  specifications?: ProductSpecifications;
}
