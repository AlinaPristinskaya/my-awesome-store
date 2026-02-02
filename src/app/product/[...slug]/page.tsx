import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string[] }> // Тепер приймаємо масив сегментів URL
}) {
  const { slug } = await params;

  // Збираємо всі частини URL назад у рядок з роздільником "/", 
  // щоб знайти товар у базі (наприклад, "2781/grey")
  const fullId = slug.join('/');

  const product = await prisma.product.findUnique({
    where: { id: fullId },
    include: { category: true },
  });

  if (!product) notFound();

  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? (product.images as string[])
    : ['/placeholder-product.png'];

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <ChevronLeft className="w-4 h-4" /> Назад до каталогу
          </Link>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            ID: {product.id.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
          <div className="relative">
             <ImageGallery images={allImages} videoUrl={product.videoUrl} />
          </div>

          <div className="flex flex-col">
            <header className="mb-10 border-b border-gray-100 pb-10">
              <Link 
                href={`/?categoryId=${product.categoryId}`}
                className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-6 block hover:underline"
              >
                {product.category?.name || "Категорія"}
              </Link>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">
                {product.name}
              </h1>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Ціна</span>
                <span className="text-5xl font-black text-black">
                  {product.price}<span className="text-2xl ml-1 font-medium text-gray-400 tracking-normal">грн</span>
                </span>
              </div>
            </header>

            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                 <Info className="w-4 h-4 text-indigo-600" />
                 <h3 className="text-black font-black uppercase text-[12px] tracking-widest">Про товар</h3>
              </div>
              <div 
                className="prose prose-indigo prose-sm max-w-none text-gray-600 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || "Опис відсутній" }} 
              />
            </div>

            <div className="mt-auto pt-10 border-t-2 border-black/5">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}