import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/ui/AddToCartButton"; 
import FadeIn from "@/components/FadeIn";
import ProductList from "@/components/ProductList";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // 1. Next.js 15 требует ожидания параметров
  const { id } = await params;

  // 2. Загружаем товар
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  // 3. Загружаем похожие товары (из той же категории)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id }, // Исключаем текущий товар
    },
    take: 3,
    include: { category: true },
  });

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          {/* Кнопка назад */}
          <div className="mb-12">
            <Link 
              href="/" 
              className="text-sm font-bold uppercase tracking-widest hover:text-indigo-600 transition flex items-center gap-2"
            >
              <span className="text-xl">←</span> Back to Store
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-32">
            {/* Изображение товара */}
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Контентная часть */}
            <div className="flex flex-col justify-center">
              <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-4">
                {product.category.name}
              </span>
              
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-6 italic uppercase">
                {product.name}
              </h1>
              
              <p className="text-3xl font-black mb-8 text-black/90">
                ${product.price.toLocaleString('en-US')}
              </p>
              
              <div className="h-px w-20 bg-indigo-600 mb-8" /> {/* Декоративная линия */}
              
              <p className="text-gray-500 mb-10 leading-relaxed text-lg font-medium italic">
                {product.description}
              </p>
              
              <div className="max-w-xs">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>

          {/* Секция похожих товаров */}
          {relatedProducts.length > 0 && (
            <section className="border-t border-gray-100 pt-20">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                    Related <span className="text-indigo-600">Items</span>
                  </h2>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">
                    Complete your collection
                  </p>
                </div>
              </div>
              <ProductList products={relatedProducts} />
            </section>
          )}
        </FadeIn>
      </div>
    </div>
  );
}