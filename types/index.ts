export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
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
