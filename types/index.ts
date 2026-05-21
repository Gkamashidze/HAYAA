export interface Category {
  id: number;
  name: string;
  nameFa: string | null;
  slug: string;
  image: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  nameFa: string | null;
  description: string | null;
  descriptionFa: string | null;
  price: number;
  currency: string;
  images: string[];
  categoryId: number;
  category: Category;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image: string | null;
}
