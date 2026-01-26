import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductList from "@/components/ProductList";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; query?: string }>;
}) {
  // 1. Получаем сессию и проверяем админа
  const session = await auth();
  const isAdmin = session?.user?.email?.toLowerCase() === "pristinskayaalina9@gmail.com";

  // 2. Раскрываем параметры поиска
  const params = await searchParams;
  const categoryId = params.categoryId;
  const query = params.query;

  // 3. Формируем фильтр
  const where: any = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (query) {
    where.name = {
      contains: query,
      mode: 'insensitive',
    };
  }

  // 4. Загружаем категории и товары (products - с буквой 's')
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.product.findMany({
      where, 
      include: { 
        category: true 
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })
  ]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto mb-16 text-center">
        <h1 className="text-6xl font-black tracking-tighter mb-6 italic">
          Curated <span className="text-indigo-600">Essentials.</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-10 font-medium text-lg">
          High-quality products designed for your daily life.
        </p>
        
        {/* Search Bar */}
        <form className="max-w-xl mx-auto relative group">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Search items..."
            className="w-full px-8 py-4 rounded-3xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm text-black"
          />
        </form>

        {/* Categories Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link
            href="/"
            className={`px-8 py-2.5 rounded-full text-sm font-bold border transition-all ${
              !categoryId ? "bg-black text-white border-black shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black"
            }`}
          >
            All Items
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?categoryId=${cat.id}${query ? `&query=${query}` : ''}`}
              className={`px-8 py-2.5 rounded-full text-sm font-bold border transition-all ${
                categoryId === cat.id ? "bg-black text-white border-black shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Products List Section */}
      <div className="max-w-6xl mx-auto">
        {products.length > 0 ? (
          /* Передаем и список товаров, и статус админа */
          <ProductList products={products} isAdmin={isAdmin} />
        ) : (
          <div className="text-center py-32">
            <h3 className="text-2xl font-bold text-gray-300">Nothing found.</h3>
            <Link href="/" className="text-indigo-600 font-bold mt-4 block hover:underline">
              Clear all filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}