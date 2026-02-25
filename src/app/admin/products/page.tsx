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
  searchParams: Promise<{ query?: string; categoryId?: string; subCategoryId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  
  const query = params.query || "";
  const categoryId = params.categoryId || "";
  const subCategoryId = params.subCategoryId || "";

  const isAdmin = (session?.user as any)?.role === "ADMIN" || session?.user?.email === "pristinskayaalina9@gmail.com";
  if (!isAdmin) redirect("/");

  // 1. Отримуємо всі категорії та підкатегорії з підрахунком товарів
  const [categories, subCategories] = await Promise.all([
    prisma.category.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true } // Підрахунок для CRM категорій
        }
      }
    }),
    prisma.subCategory.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true } // Підрахунок для ваших ручних підкатегорій
        }
      }
    }),
  ]);

  // 2. Будуємо умови фільтрації для списку товарів
  const where: any = { AND: [] };

  if (query) {
    where.AND.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ]
    });
  }

  if (subCategoryId) {
    // Якщо обрана ручна підкатегорія
    where.AND.push({ subCategoryId: subCategoryId });
  } else if (categoryId) {
    // Логіка для головної категорії + її дітей (SalesDrive)
    const childIds = categories
      .filter(c => c.parentId === categoryId)
      .map(c => c.id);

    where.AND.push({
      OR: [
        { categoryId: categoryId },
        { categoryId: { in: childIds } }
      ]
    });
  }

  // 3. Завантажуємо самі товари
  const products = await prisma.product.findMany({
    where: where.AND.length > 0 ? where : {},
    include: { 
      category: true,
    },
    orderBy: [{ priority: 'desc' }, { createdAt: "desc" }],
  });

  // Завантажуємо відео з Cloudinary
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

  // Формуємо дерево категорій для Sidebar/Selects
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

  return (
    <AdminProductsClient 
      initialProducts={products}
      categoryTree={categoryTree}
      subCategories={subCategories} // Тут уже об'єкти з _count всередині
      categories={categories}       // Передаємо повний список з _count
      allVideos={allVideos}
      categoryId={categoryId}
      subCategoryId={subCategoryId}
      query={query}
    />
  );
}