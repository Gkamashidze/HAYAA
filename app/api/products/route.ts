import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
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
    images: JSON.parse(p.images as string) as string[],
  }));

  return NextResponse.json(serialized);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || body.price == null || !body.categoryId) {
    return NextResponse.json({ error: "name, price, categoryId required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      price: Number(body.price),
      currency: body.currency ?? "GEL",
      images: JSON.stringify(body.images ?? []),
      categoryId: Number(body.categoryId),
      inStock: body.inStock ?? true,
      featured: body.featured ?? false,
    },
    include: { category: true },
  });

  return NextResponse.json(
    { ...product, images: JSON.parse(product.images as string) },
    { status: 201 }
  );
}
