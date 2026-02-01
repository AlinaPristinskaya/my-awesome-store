import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Star } from "lucide-react";
import VideoSelect from "@/app/admin/VideoSelect";
import { v2 as cloudinary } from 'cloudinary'; // Додай цей імпорт

// Налаштування Cloudinary прямо тут
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getStatusStyles = (stock: number) => {
  if (stock > 5) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (stock > 0) return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-rose-50 text-rose-600 border-rose-100";
};

export default async function AdminProductsPage() {
  const session = await auth();

  if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // ВИКЛИКАЄМО CLOUDINARY НАПРЯМУ (без fetch)
  let allVideos = [];
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      asset_folder: 'shorts', // Твоя папка
      max_results: 100
    });
    
    allVideos = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url
    }));
  } catch (e) {
    console.error("Cloudinary Direct Error:", e);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Менеджер складу</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Інвентар</h1>
          </div>
          
          <Link 
            href="/admin/products/new" 
            className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl"
          >
            <Plus className="w-4 h-4" /> Додати товар
          </Link>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
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
                      <form action={async () => {
                        "use server";
                        await prisma.product.update({
                          where: { id: product.id },
                          data: { isFeatured: !product.isFeatured }
                        });
                        revalidatePath("/admin/products");
                      }}>
                        <button type="submit" className={`p-2 rounded-full transition-colors ${product.isFeatured ? 'text-indigo-600' : 'text-gray-200 hover:text-gray-400'}`}>
                          <Star className={`w-6 h-6 ${product.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </form>
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
                        {/* Решта кнопок видалення */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}