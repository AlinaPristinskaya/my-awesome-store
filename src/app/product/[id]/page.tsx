import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/ui/AddToCartButton"; 
import FadeIn from "@/components/FadeIn";
import ProductList from "@/components/ProductList";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 3,
    include: { category: true },
  });

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="mb-12">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-indigo-600 transition">
              ← Back to Store
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-32">
            <div className="relative aspect-4/5 rounded-4xl overflow-hidden bg-gray-50 border border-gray-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
                {product.category.name}
              </span>
              <h1 className="text-5xl font-black tracking-tighter mb-4">{product.name}</h1>
              <p className="text-3xl font-black mb-8">${product.price.toLocaleString('en-US')}</p>
              <p className="text-gray-500 mb-10 leading-relaxed text-lg">{product.description}</p>
              
              <AddToCartButton product={product} />
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="border-t border-gray-100 pt-20">
              <h2 className="text-4xl font-black tracking-tighter mb-12">Related Products</h2>
              <ProductList products={relatedProducts} />
            </section>
          )}
        </FadeIn>
      </div>
    </div>
  );
}