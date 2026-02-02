export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  stock: number;
  badge?: string | null;
  badgeLabel?: string;
  image: string;
  isOutOfStock: boolean;
  description?: string;
  specifications?: {
    origin?: string;
    roastLevel?: string;
    weight?: string;
    processing?: string;
    grindSize?: string;
    material?: string;
    capacity?: string;
    power?: string;
    voltage?: string;
    warranty?: string;
  };
};