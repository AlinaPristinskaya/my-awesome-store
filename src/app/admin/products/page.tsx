import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminProductsClient from "./AdminProductsClient";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

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

 // Оновлений фрагмент у src/app/admin/products/page.tsx
const [categories, subCategories, products] = await Promise.all([
  prisma.category.findMany({ orderBy: { name: 'asc' } }),
  prisma.subCategory.findMany(),
  prisma.product.findMany({
    where: {
      AND: [
        categoryId ? { categoryId } : {},
        query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ]
        } : {}
      ]
    },
    include: { 
      category: true,
      // Ми не можемо зробити include для subCategory, якщо це просто ID, 
      // але ми можемо переконатися, що воно завантажується
    },
    orderBy: [{ priority: 'desc' }, { createdAt: "desc" }],
  })
]);

  // Загружаем видео из Cloudinary (твой баннер и ролики)
  let allVideos: any[] = [];
  try {
    const result = await cloudinary.api.resources({ 
      resource_type: 'video', 
      max_results: 500 
    });
    allVideos = result.resources.map((r: any) => ({ 
      public_id: r.public_id, 
      secure_url: r.secure_url 
    }));
  } catch (e) { 
    console.error("Cloudinary Error:", e); 
  }

  // Формируем дерево для селектов
  const categoryTree: Record<string, any> = {};
  categories.filter(c => !c.parentId).forEach(p => {
    categoryTree[p.name] = {
      id: p.id,
      children: categories.filter(c => c.parentId === p.id).map(c => ({ 
        id: c.id, 
        displayName: c.name 
      }))
    };
  });
console.log("SERVER LOG - First product subCategory:", products[0]?.subCategoryId);
  return (
    <AdminProductsClient 
      initialProducts={products}
      categoryTree={categoryTree}
      subCategories={subCategories}
      allVideos={allVideos} // Видео на месте
      categoryId={categoryId}
      query={query}
    />
  );
}