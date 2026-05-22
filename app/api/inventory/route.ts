import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stockStatus } from "@/lib/inventory";
import type { InventoryItem, InventoryResponse, StockStatus } from "@/types";

// Inventory exposes cost prices and margins — admin only.
function firstImage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null;
  } catch {
    return null;
  }
}

const STATUS_RANK: Record<StockStatus, number> = { out: 0, low: 1, ok: 2 };

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const items: InventoryItem[] = products
      .map((p) => {
        const status = stockStatus(p.quantity, p.lowStockThreshold);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          categoryName: p.category.name,
          image: firstImage(p.images),
          quantity: p.quantity,
          lowStockThreshold: p.lowStockThreshold,
          price: p.price,
          costPrice: p.costPrice,
          currency: p.currency,
          inStock: p.inStock,
          status,
          stockValue: Math.round(p.quantity * p.price * 100) / 100,
        };
      })
      // Most actionable first: out of stock, then low, then ok; then by name.
      .sort(
        (a, b) =>
          STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          a.name.localeCompare(b.name)
      );

    const summary: InventoryResponse["summary"] = {
      totalSkus: items.length,
      totalUnits: items.reduce((sum, i) => sum + i.quantity, 0),
      totalRetailValue:
        Math.round(items.reduce((sum, i) => sum + i.quantity * i.price, 0) * 100) / 100,
      totalCostValue:
        Math.round(
          items.reduce((sum, i) => sum + i.quantity * (i.costPrice ?? 0), 0) * 100
        ) / 100,
      lowStockCount: items.filter((i) => i.status === "low").length,
      outOfStockCount: items.filter((i) => i.status === "out").length,
    };

    return NextResponse.json({ items, summary } satisfies InventoryResponse);
  } catch {
    return NextResponse.json(
      { error: "Failed to load inventory" },
      { status: 500 }
    );
  }
}
