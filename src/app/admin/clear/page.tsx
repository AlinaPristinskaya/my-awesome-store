"use server";
import { prisma } from "@/lib/prisma";

export default async function ClearPage() {
  const clearData = async (formData: FormData) => {
    "use server";
    try {
      console.log("🚀 Починаю ГЛОБАЛЬНЕ очищення...");
      
      // 1. Видаляємо кошики (те, що зупинило нас зараз)
      await prisma.cartItem.deleteMany({});
      
      // 2. Видаляємо пункти замовлень
      await prisma.orderItem.deleteMany({});
      
      // 3. Видаляємо замовлення
      await prisma.order.deleteMany({});
      
      // 4. Тепер товари точно вільні
      const deletedProducts = await prisma.product.deleteMany({});
      
      // 5. Видаляємо категорії
      const deletedCategories = await prisma.category.deleteMany({});
      
      console.log(`✅ БАЗА ПОВНІСТЮ ОЧИЩЕНА!`);
      console.log(`Видалено товарів: ${deletedProducts.count}, категорій: ${deletedCategories.count}`);
    } catch (e) {
      console.error("❌ Помилка при очищенні:", e);
    }
  };

  return (
    <div className="p-20 text-center bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl border border-red-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-3xl font-black mb-4 text-gray-900 tracking-tighter">ПОВНЕ ОБНУЛЕННЯ</h1>
        <p className="text-gray-500 mb-10 text-sm leading-relaxed">
          Ми видаляємо <b>кошики</b>, <b>замовлення</b> та <b>товари</b>. <br/> 
          Це останній крок перед чистим імпортом.
        </p>
        <form action={clearData}>
          <button 
            type="submit"
            className="w-full bg-red-600 text-white px-8 py-5 rounded-2xl font-black hover:bg-black transition-all uppercase tracking-[0.2em] text-[10px]"
          >
            Знищити і почати спочатку
          </button>
        </form>
      </div>
    </div>
  );
}