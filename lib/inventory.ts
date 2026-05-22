// Shared inventory helpers — safe to import from both server and client code.
// No server-only dependencies here.

import type { MovementType, StockStatus } from "@/types";

export const MOVEMENT_TYPES: readonly MovementType[] = [
  "restock",
  "sale",
  "adjustment",
  "count",
  "return",
  "damage",
] as const;

interface MovementMeta {
  readonly label: string;
  readonly color: string;
  readonly icon: string;
}

// Display metadata per movement type. `count` is a stock-take (absolute set).
export const MOVEMENT_META: Record<MovementType, MovementMeta> = {
  restock: { label: "Restock", color: "#2a7a2a", icon: "📥" },
  sale: { label: "Sale", color: "#cc4444", icon: "🛒" },
  adjustment: { label: "Adjustment", color: "#6366F1", icon: "✏️" },
  count: { label: "Stock Count", color: "#B5532A", icon: "🔢" },
  return: { label: "Return", color: "#D4A574", icon: "↩️" },
  damage: { label: "Damage / Loss", color: "#cc4444", icon: "⚠️" },
};

export function isMovementType(v: unknown): v is MovementType {
  return typeof v === "string" && (MOVEMENT_TYPES as readonly string[]).includes(v);
}

// Stock status from quantity and the per-product low-stock threshold.
export function stockStatus(quantity: number, lowStockThreshold: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= lowStockThreshold) return "low";
  return "ok";
}

interface StatusMeta {
  readonly label: string;
  readonly color: string;
  readonly bg: string;
}

export const STATUS_META: Record<StockStatus, StatusMeta> = {
  ok: { label: "In Stock", color: "#2a7a2a", bg: "rgba(42,122,42,0.1)" },
  low: { label: "Low Stock", color: "#B5532A", bg: "rgba(181,83,42,0.12)" },
  out: { label: "Out of Stock", color: "#cc4444", bg: "rgba(204,68,68,0.1)" },
};
