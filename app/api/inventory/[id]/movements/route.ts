import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseId((await params).id);
    if (id === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Most recent first; capped so the audit log can't return unbounded rows.
    const movements = await prisma.stockMovement.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(movements);
  } catch {
    return NextResponse.json(
      { error: "Failed to load stock history" },
      { status: 500 }
    );
  }
}
