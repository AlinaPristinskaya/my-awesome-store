import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";

export default async function AddProductPage() {
  const categories = await prisma.category.findMany(); // Берем реальные категории

  return (
    <div className="min-h-screen bg-[#fafafa] p-12">
      <div className="max-w-3xl mx-auto">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}