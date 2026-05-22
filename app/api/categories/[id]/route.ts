import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateCategoryUpdate } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

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
    const result = validateCategoryUpdate(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const v = result.data;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(v.name !== undefined && { name: v.name }),
        ...(v.nameFa !== undefined && { nameFa: v.nameFa }),
        ...(v.slug !== undefined && { slug: v.slug }),
        ...(v.image !== undefined && { image: v.image }),
      },
    });

    return NextResponse.json(category);
  } catch (e) {
    if (isNotFound(e)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Unique constraint violation — slug already exists.
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
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

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (isNotFound(e)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Foreign key constraint — category still has products attached.
    if (e && typeof e === "object" && "code" in e && e.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Cannot delete a category that still has products. Move or delete its products first.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
