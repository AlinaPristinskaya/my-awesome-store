import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductList from "@/components/ProductList";
import { auth } from "@/auth";
import { Search, Star } from "lucide-react"; // Додав Star
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

  // --- ЛОГІКА ВІТРИНИ ---
  // Якщо немає активного пошуку і не обрана категорія — показуємо тільки "Популярні"
  const isBrowsing = categoryId || query;
  if (!isBrowsing) {
    where.isFeatured = true;
  }

  // ЛОГІКА ФІЛЬТРАЦІЇ КАТЕГОРІЇ
  if (categoryId) {
    const selectedCategory = allCategories.find(c => c.id === categoryId);
    if (selectedCategory) {
      const relatedCategoryIds = allCategories
        .filter(c => c.name.startsWith(selectedCategory.name))
        .map(c => c.id);
      where.categoryId = { in: relatedCategoryIds };
    }
  }

  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }

  // 2. Завантажуємо товари
  const products = await prisma.product.findMany({
    where, 
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. ГРУПУВАННЯ КАТЕГОРІЙ ДЛЯ САЙДБАРУ
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
console.log("ПЕРЕВІРКА ТОВАРУ:", JSON.stringify(products[0], null, 2));
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto pt-12 pb-8 px-6 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-2 text-indigo-600 mb-2">
          {!isBrowsing && <Star className="w-4 h-4 fill-indigo-600" />}
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            {isBrowsing ? "Результати пошуку" : "Ексклюзивна добірка"}
          </span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter italic mb-4">
          Гарна <span className="text-indigo-600">Господиня.</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <p className="text-gray-400 font-medium text-lg max-w-md">
            {isBrowsing 
              ? "Знайдено найкращі пропозиції за вашим запитом." 
              : "Популярні товари, обрані спеціально для вашого затишку."}
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
          {/* Заголовок над списком товарів */}
          <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {isBrowsing ? "Усі товари" : "ТОП позиції"}
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {products.length} од.
            </span>
          </div>

          {products.length > 0 ? (
            <ProductList products={products} isAdmin={isAdmin} />
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <h3 className="text-2xl font-bold text-gray-400">Нічого не знайдено</h3>
              <Link href="/" className="text-indigo-600 font-bold mt-4 block hover:underline">
                Скинути фільтри та повернутись на головну
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}