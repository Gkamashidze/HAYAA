import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateCategoryCreate } from "@/lib/validation";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
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

    const category = await prisma.category.create({
      data: { name: data.name, slug: data.slug, image: data.image },
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
