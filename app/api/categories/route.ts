import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateCategoryCreate, validateCategoryReorder } from "@/lib/validation";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to load categories" },
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
    const result = validateCategoryCreate(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const data = result.data;

    // New categories go to the bottom of the list.
    const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: { name: data.name, nameFa: data.nameFa, slug: data.slug, image: data.image, sortOrder },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    // Unique constraint violation — slug already exists.
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// Reorders categories. Body: { order: number[] } — category ids in display order.
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const result = validateCategoryReorder(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const order = result.data;

    await prisma.$transaction(
      order.map((id, index) =>
        prisma.category.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    // An id in the list does not exist.
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "One or more categories no longer exist" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
