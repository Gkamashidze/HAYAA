import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateStockAdjust } from "@/lib/validation";
import { stockStatus } from "@/lib/inventory";
import type { InventoryItem, StockMovement } from "@/types";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function firstImage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseId((await params).id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const result = validateStockAdjust(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { mode, value, type, note } = result.data;

    // Read-modify-write in a single transaction so the recorded before/after
    // and the new quantity stay consistent under concurrent edits.
    const outcome = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!product) return { error: "not_found" as const };

      const before = product.quantity;
      const after = mode === "set" ? value : before + value;
      if (after < 0) {
        return { error: "negative" as const, before };
      }
      const delta = after - before;

      const movement = await tx.stockMovement.create({
        data: { productId: id, type, delta, before, after, note },
      });

      const updated = await tx.product.update({
        where: { id },
        data: { quantity: after, inStock: after > 0 },
        include: { category: true },
      });

      return { product: updated, movement };
    });

    if ("error" in outcome) {
      if (outcome.error === "not_found") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Cannot remove more than the ${outcome.before} units on hand` },
        { status: 400 }
      );
    }

    const p = outcome.product;
    const item: InventoryItem = {
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
      status: stockStatus(p.quantity, p.lowStockThreshold),
      stockValue: Math.round(p.quantity * p.price * 100) / 100,
    };

    return NextResponse.json({
      item,
      movement: outcome.movement as unknown as StockMovement,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    );
  }
}
