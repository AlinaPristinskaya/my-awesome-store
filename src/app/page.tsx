import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductList from "@/components/ProductList";
import { auth } from "@/auth";
import { Search } from "lucide-react"; 
import CategorySidebar from "@/components/CategorySidebar";

export const dynamic = 'force-dynamic';

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

  const allCategories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' } 
  });

  const where: any = {};
  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  } 
  
  if (categoryId) {
    const selectedCategory = allCategories.find(c => c.id === categoryId);
    if (selectedCategory) {
      const childIds = allCategories
        .filter(c => c.parentId === selectedCategory.id)
        .map(c => c.id);
      where.categoryId = { in: [selectedCategory.id, ...childIds] };
    }
  }

  if (!query && !categoryId) {
    where.isFeatured = true;
  }

  const products = await prisma.product.findMany({
    where, 
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  const isBrowsing = !!(categoryId || query);

  const categoryTree: Record<string, { id: string, children: any[] }> = {};
  const rootCategories = allCategories.filter(cat => !cat.parentId);

  rootCategories.forEach(parent => {
    categoryTree[parent.name] = {
      id: parent.id,
      children: allCategories
        .filter(child => child.parentId === parent.id)
        .map(child => ({ ...child, displayName: child.name }))
    };
  });

  return (
    <div className="min-h-screen bg-white text-black">
      
      {/* 1. БАНЕР НА ВСЮ ШИРИНУ (БЕЗ ОБМЕЖЕНЬ) */}
      {/* HEADER З БАНЕРОМ ТА ЗАТЕМНЕННЯМ */}
      <header className="w-full relative">
        <div className="relative w-full min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
          
          {/* АДАПТИВНІ КАРТИНКИ */}
          <picture className="absolute inset-0 w-full h-full">
            <source media="(min-width: 1024px)" srcSet="/desktop.jpg" />
            <source media="(min-width: 640px)" srcSet="/tablet.jpg" />
            <img 
              src="/mobile.jpg" 
              alt="OSELIA Banner" 
              className="w-full h-full object-cover"
            />
          </picture>

          {/* ШАР ЗАТЕМНЕННЯ */}
          <div className="absolute inset-0 bg-black/25" /> 

          {/* КОНТЕНТ ПОВЕРХ */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-7xl mx-auto">
            
            {/* ЛОГОТИП */}
            <div className="flex flex-col items-center space-y-2 mb-6 drop-shadow-xl">
              <h1 className="text-6xl sm:text-8xl font-black tracking-[0.2em] text-white uppercase">
                OSELIA<span className="text-indigo-600">.</span>
              </h1>
              <p className="text-xs sm:text-sm font-black text-indigo-600 uppercase tracking-[0.6em]">
                Мистецтво бути вдома
              </p>
            </div>

            {/* СЛОГАН */}
            <p className="text-white/90 font-medium text-lg max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              {isBrowsing 
                ? "Результати пошуку за вашим запитом" 
                : "Естетичний посуд, текстиль та декор. Створюємо атмосферу, в яку хочеться повертатися."}
            </p>

            {/* ПОШУК */}
            <form action="/" className="relative w-full max-w-xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Що ви шукаєте для своєї оселі?"
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/95 backdrop-blur-sm border border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all shadow-2xl text-lg text-black"
              />
            </form>
          </div>
        </div>
      </header>

      {/* КОНТЕНТНИЙ БЛОК (З обмеженням ширини max-w-7xl) */}
      <main className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 py-16">
        <CategorySidebar 
          categoryTree={categoryTree} 
          currentCategoryId={categoryId} 
          query={query} 
        />

        <section className="flex-1">
          <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {isBrowsing ? "Результати" : "ТОП позиції"}
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {products.length} товарів
            </span>
          </div>

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