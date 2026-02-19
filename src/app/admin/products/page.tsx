import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import VideoSelect from "@/app/admin/VideoSelect";
import FeaturedToggle from "@/app/admin/products/FeaturedToggle";
import PriorityToggle from "@/app/admin/products/PriorityToggle";
import CategoryFilter from "./CategoryFilter";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

async function toggleFeatured(id: string, currentStatus: boolean) {
  "use server";
  await prisma.product.update({ where: { id }, data: { isFeatured: !currentStatus } });
  revalidatePath("/admin/products");
}

async function updatePriority(id: string, priority: number) {
  "use server";
  await prisma.product.update({ where: { id }, data: { priority } });
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; categoryId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params.query || "";
  const categoryId = params.categoryId || "";

  const isAdmin = (session?.user as any)?.role === "ADMIN" || session?.user?.email === "pristinskayaalina9@gmail.com";
  if (!isAdmin) redirect("/");

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);

  const products = await prisma.product.findMany({
    where: {
      AND: [
        categoryId ? { categoryId } : {},
        ...searchWords.map(word => ({
          OR: [
            { name: { contains: word, mode: 'insensitive' } },
            { id: { contains: word, mode: 'insensitive' } },
          ]
        }))
      ]
    },
    include: { category: true },
    orderBy: [{ priority: 'desc' }, { createdAt: "desc" }],
  });

  let allVideos = [];
  try {
    const result = await cloudinary.api.resources({ resource_type: 'video', type: 'upload', asset_folder: 'shorts', max_results: 100 });
    allVideos = result.resources.map((r: any) => ({ public_id: r.public_id, secure_url: r.secure_url }));
  } catch (e) { console.error(e); }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Менеджмент</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase">Інвентар</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            <CategoryFilter categories={categories} currentCategoryId={categoryId} />

            <form action="/admin/products" className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Пошук..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-medium"
              />
            </form>

            <Link href="/admin/products/new" className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl">
              <Plus className="w-4 h-4" /> Додати
            </Link>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="p-8">Товар / Категорія</th>
                <th className="p-8 text-center">Рейтинг (1-3)</th>
                <th className="p-8 text-center">Вітрина</th>
                <th className="p-8 text-right">Відео & Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/20 transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image src={product.images[0] || "/placeholder.png"} alt="" fill className="object-cover" unoptimized />
                      </div>
                      <div>
                        <p className="font-black text-base leading-tight mb-1">{product.name}</p>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-center">
                      <PriorityToggle productId={product.id} currentPriority={product.priority || 1} updateAction={updatePriority} />
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <FeaturedToggle productId={product.id} initialIsFeatured={product.isFeatured} toggleAction={toggleFeatured} />
                  </td>
                  <td className="p-8 text-right">
                    <VideoSelect productId={product.id} currentVideo={product.videoUrl} allVideos={allVideos} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}