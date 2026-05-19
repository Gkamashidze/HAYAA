import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name: body.name, slug: body.slug, image: body.image ?? null },
  });
  return NextResponse.json(category, { status: 201 });
}
