import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateProductUpdate } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

function parseImages(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

// Parses the route id; returns null when it is not a positive integer.
function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function isNotFound(e: unknown): boolean {
  return (
    !!e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025"
  );
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseId((await params).id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ...product, images: parseImages(product.images) });
  } catch {
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
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
    const result = validateProductUpdate(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const v = result.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(v.name !== undefined && { name: v.name }),
        ...(v.description !== undefined && { description: v.description }),
        ...(v.price !== undefined && { price: v.price }),
        ...(v.currency !== undefined && { currency: v.currency }),
        ...(v.images !== undefined && { images: JSON.stringify(v.images) }),
        ...(v.categoryId !== undefined && { categoryId: v.categoryId }),
        ...(v.inStock !== undefined && { inStock: v.inStock }),
        ...(v.featured !== undefined && { featured: v.featured }),
      },
      include: { category: true },
    });

    return NextResponse.json({ ...product, images: parseImages(product.images) });
  } catch (e) {
    if (isNotFound(e)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (e && typeof e === "object" && "code" in e && e.code === "P2003") {
      return NextResponse.json(
        { error: "categoryId does not exist" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseId((await params).id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (isNotFound(e)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
