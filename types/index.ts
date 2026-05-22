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
  costPrice: number | null;
  currency: string;
  images: string[];
  categoryId: number;
  category: Category;
  sku: string | null;
  quantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = "ok" | "low" | "out";

export type MovementType =
  | "restock"
  | "sale"
  | "adjustment"
  | "count"
  | "return"
  | "damage";

export interface StockMovement {
  id: number;
  productId: number;
  type: MovementType;
  delta: number;
  before: number;
  after: number;
  note: string | null;
  createdAt: string;
}

// One row in the inventory table — a product plus its computed stock figures.
export interface InventoryItem {
  id: number;
  name: string;
  sku: string | null;
  categoryName: string;
  image: string | null;
  quantity: number;
  lowStockThreshold: number;
  price: number;
  costPrice: number | null;
  currency: string;
  inStock: boolean;
  status: StockStatus;
  stockValue: number;
}

export interface InventorySummary {
  totalSkus: number;
  totalUnits: number;
  totalRetailValue: number;
  totalCostValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
  summary: InventorySummary;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image: string | null;
}
