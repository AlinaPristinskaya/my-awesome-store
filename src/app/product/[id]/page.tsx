import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { ChevronLeft, ShieldCheck, Truck, RefreshCcw, Info } from "lucide-react";
import Link from "next/link";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  // Використовуємо масив images або заглушку
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder-product.png'];

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Хлібні крихти / Назад */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
            <ChevronLeft className="w-4 h-4" /> Назад до каталогу
          </Link>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden sm:block">
            Артикул: {product.id.slice(-6).toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
          
          {/* ЛІВА ЧАСТИНА: ГАЛЕРЕЯ */}
          <div className="relative">
             <ImageGallery images={allImages} />
          </div>

          {/* ПРАВА ЧАСТИНА: ІНФОРМАЦІЯ */}
          <div className="flex flex-col">
            <header className="mb-10 border-b border-gray-100 pb-10">
              <Link 
                href={`/?categoryId=${product.categoryId}`}
                className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-6 block hover:underline"
              >
                {product.category?.name || "Категорія"}
              </Link>
              
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 leading-[0.9] lg:leading-[0.85]">
                {product.name}
              </h1>

              <div className="flex items-end gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Ціна за одиницю</span>
                  <span className="text-5xl font-black text-black">
                    {product.price}<span className="text-2xl ml-1">грн</span>
                  </span>
                </div>
                {product.stock > 0 && (
                   <div className="mb-2 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-md flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      В наявності
                   </div>
                )}
              </div>
            </header>

            {/* ДЕТАЛЬНИЙ ОПИС З ПІДТРИМКОЮ HTML ТА TYPOGRAPHY */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                 <Info className="w-4 h-4 text-indigo-600" />
                 <h3 className="text-black font-black uppercase text-[12px] tracking-widest">
                   Характеристики та опис
                 </h3>
              </div>
              
              <div 
                className="prose prose-indigo prose-sm max-w-none 
                           text-gray-600 font-medium
                           prose-headings:text-black prose-headings:font-black
                           prose-p:leading-relaxed prose-p:mb-4
                           prose-strong:text-black prose-strong:font-black
                           prose-li:marker:text-indigo-600"
                dangerouslySetInnerHTML={{ __html: product.description || "Опис цього товару скоро з'явиться..." }} 
              />
            </div>

            {/* НИЖНЯ ПАНЕЛЬ: ДІЇ ТА СЕРВІС */}
            <div className="mt-auto pt-10 border-t-2 border-black/5">
              <AddToCartButton product={product} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Швидка<br/>доставка</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Гарантія<br/>якості</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <RefreshCcw className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">14 днів на<br/>повернення</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}