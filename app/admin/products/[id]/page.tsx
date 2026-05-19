import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import ProductForm from "@/components/admin/ProductForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Params) {
  const { id } = await params;
  const raw = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });
  if (!raw) notFound();

  const product = { ...raw, images: JSON.parse(raw.images as string) as string[] };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 600 }}>Edit Product</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{product.name}</p>
      </div>
      <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", padding: "2rem" }}>
        <ProductForm
          mode="edit"
          initialData={{
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            price: String(product.price),
            currency: product.currency,
            categoryId: String(product.categoryId),
            inStock: product.inStock,
            featured: product.featured,
            images: product.images,
          }}
        />
      </div>
    </div>
  );
}
