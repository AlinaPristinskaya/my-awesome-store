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

  // Перевірка прав доступу
  const isAdmin = (session?.user as any)?.role === "ADMIN" || session?.user?.email === "pristinskayaalina9@gmail.com";
  if (!isAdmin) redirect("/");

  // 1. Отримуємо всі категорії (CRM) та підкатегорії (Front) з підрахунком товарів
  // Ми не додаємо де filter { isHidden: false }, щоб в адмінці бачити реальні залишки
  const [categories, subCategories] = await Promise.all([
    prisma.category.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    }),
    prisma.subCategory.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    }),
  ]);

  // 2. Будуємо умови фільтрації
  // ВАЖЛИВО: Ми НЕ додаємо filter по isHidden, щоб бачити ПРИХОВАНІ товари в адмінці!
  const where: any = {};
  const andConditions: any[] = [];

  if (query) {
    andConditions.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ]
    });
  }

  if (subCategoryId) {
    // Фільтр за твоєю "красивою" підкатегорією
    andConditions.push({ subCategoryId: subCategoryId });
  } else if (categoryId) {
    // Якщо вибрана головна категорія - показуємо її товари + товари її "дітей" з CRM
    const childIds = categories
      .filter(c => c.parentId === categoryId)
      .map(c => c.id);

    andConditions.push({
      OR: [
        { categoryId: categoryId },
        { categoryId: { in: childIds } }
      ]
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // 3. Завантажуємо товари з повною інформацією
  const products = await prisma.product.findMany({
    where,
    include: { 
      category: true,
      subCategory: true, // Додаємо, щоб бачити назву підкатегорії в таблиці
    },
    // Пріоритет 1 (найвищий) буде зверху, потім найновіші
    orderBy: [
      { priority: 'desc' }, 
      { createdAt: "desc" }
    ],
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

  // Формуємо дерево категорій для Sidebar
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
      subCategories={subCategories}
      categories={categories}
      allVideos={allVideos}
      categoryId={categoryId}
      subCategoryId={subCategoryId}
      query={query}
    />
  );
}