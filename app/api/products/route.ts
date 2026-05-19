import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateProductCreate } from "@/lib/validation";

// Stored as a JSON string; tolerate a corrupt value instead of crashing.
function parseImages(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (category) where.category = { slug: category };
    if (featured === "true") where.featured = true;
    if (search) where.name = { contains: search };

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const serialized = products.map((p) => ({
      ...p,
      images: parseImages(p.images),
    }));

    return NextResponse.json(serialized);
  } catch {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const result = validateProductCreate(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const data = result.data;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        images: JSON.stringify(data.images),
        categoryId: data.categoryId,
        inStock: data.inStock,
        featured: data.featured,
      },
      include: { category: true },
    });

    return NextResponse.json(
      { ...product, images: parseImages(product.images) },
      { status: 201 }
    );
  } catch (e) {
    // Foreign key violation — categoryId does not exist.
    if (e && typeof e === "object" && "code" in e && e.code === "P2003") {
      return NextResponse.json(
        { error: "categoryId does not exist" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
