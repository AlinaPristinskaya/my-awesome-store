import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductList from "@/components/ProductList";
import { auth } from "@/auth";
import { Search } from "lucide-react";
import CategorySidebar from "@/components/CategorySidebar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; query?: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.email?.toLowerCase() === "pristinskayaalina9@gmail.com";

  const params = await searchParams;
  const categoryId = params.categoryId;
  const query = params.query;

  // 1. Отримуємо всі категорії для побудови дерева та фільтрації
  const allCategories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' } 
  });

  const where: any = {};

  // ЛОГІКА ФІЛЬТРАЦІЇ БАТЬКІВСЬКОЇ КАТЕГОРІЇ
  if (categoryId) {
    const selectedCategory = allCategories.find(c => c.id === categoryId);
    
    if (selectedCategory) {
      // Знаходимо всі ID категорій, які є цією категорією або її нащадками
      // Наприклад, для "Для кухні" знайде і "Для кухні / Посуд", і "Для кухні / Текстиль"
      const relatedCategoryIds = allCategories
        .filter(c => c.name.startsWith(selectedCategory.name))
        .map(c => c.id);

      where.categoryId = { in: relatedCategoryIds };
    }
  }

  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }

  // 2. Завантажуємо товари за сформованим фільтром
  const products = await prisma.product.findMany({
    where, 
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. ГРУПУВАННЯ КАТЕГОРІЙ ДЛЯ САЙДБАРУ (Твоя логіка)
  const categoryTree: Record<string, { id: string, children: any[] }> = {};

  allCategories.forEach(cat => {
    const parts = cat.name.split('/');
    const parentName = parts[0].trim();
    
    if (!categoryTree[parentName]) {
      categoryTree[parentName] = { id: '', children: [] };
    }

    if (parts.length === 1) {
      categoryTree[parentName].id = cat.id;
    } else {
      const childName = parts.slice(1).join('/').trim();
      categoryTree[parentName].children.push({ ...cat, displayName: childName });
    }
  });

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto pt-12 pb-8 px-6 text-center lg:text-left">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter italic mb-4">
          Гарна <span className="text-indigo-600">Господиня.</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <p className="text-gray-400 font-medium text-lg max-w-md">
            Затишок та якість для вашого дому.
          </p>
          
          <form className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Шукати товари..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all shadow-sm"
            />
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 pb-20">
        <CategorySidebar 
          categoryTree={categoryTree} 
          currentCategoryId={categoryId} 
          query={query} 
        />

        <section className="flex-1">
          {products.length > 0 ? (
            <ProductList products={products} isAdmin={isAdmin} />
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <h3 className="text-2xl font-bold text-gray-400">Нічого не знайдено</h3>
              <Link href="/" className="text-indigo-600 font-bold mt-4 block hover:underline">
                Скинути фільтри
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}