import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react"; // Додали Search
import VideoSelect from "@/app/admin/VideoSelect";
import FeaturedToggle from "./FeaturedToggle";
import { v2 as cloudinary } from 'cloudinary';

// Налаштування Cloudinary (залишаємо як було)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function toggleFeatured(id: string, currentStatus: boolean) {
  "use server";
  await prisma.product.update({
    where: { id },
    data: { isFeatured: !currentStatus }
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

const getStatusStyles = (stock: number) => {
  if (stock > 5) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (stock > 0) return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-rose-50 text-rose-600 border-rose-100";
};

// Додаємо тип для props, щоб отримати пошуковий запит з URL
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params.query || "";

  const isAdmin = (session?.user as any)?.role === "ADMIN" || session?.user?.email === "pristinskayaalina9@gmail.com";
  
  if (!isAdmin) redirect("/");

  // Фільтрація товарів через Prisma
  // Розбиваємо запит на окремі слова (напр. "Шторка Cuddly" -> ["Шторка", "Cuddly"])
  const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);

  const products = await prisma.product.findMany({
    where: {
      AND: searchWords.map(word => ({
        OR: [
          { name: { contains: word, mode: 'insensitive' } },
          { id: { contains: word, mode: 'insensitive' } },
          { videoUrl: { contains: word, mode: 'insensitive' } },
        ]
      }))
    },
    orderBy: { createdAt: "desc" },
  });

  // Отримання відео (залишаємо твій блок)
  let allVideos = [];
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      asset_folder: 'shorts', 
      max_results: 100
    });
    allVideos = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url
    }));
  } catch (e) {
    console.error("Cloudinary Error:", e);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Менеджер складу</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Інвентар</h1>
          </div>

          {/* БЛОК ПОШУКУ ТА КНОПКИ */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* ФОРМА ПОШУКУ */}
            <form action="/admin/products" className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Пошук за назвою або ID..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-medium shadow-sm"
              />
            </form>

            <Link 
              href="/admin/products/new" 
              className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <Plus className="w-4 h-4" /> Додати
            </Link>
          </div>
        </header>

        {/* ТАБЛИЦЯ (без змін у логіці) */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Товар</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Вітрина</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Склад</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Шортс & Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.png"}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="font-black text-base leading-tight mb-1">{product.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {product.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <FeaturedToggle 
                          productId={product.id}
                          initialIsFeatured={product.isFeatured}
                          toggleAction={toggleFeatured}
                        />
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(product.stock)}`}>
                          {product.stock} шт.
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end items-center gap-4">
                          <VideoSelect 
                            productId={product.id} 
                            currentVideo={product.videoUrl} 
                            allVideos={allVideos}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
              Товарів не знайдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}