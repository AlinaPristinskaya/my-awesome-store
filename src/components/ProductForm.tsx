'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/product-actions";
import ImageUpload from "@/components/ImageUpload";
import { Category } from "@prisma/client";
import { ArrowLeft, Package, Star } from "lucide-react";
import Link from "next/link";

export default function ProductForm({ categories }: { categories: Category[] }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false); // Нове поле для головної сторінки
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("imageUrl", imageUrl);
    // Передаємо значення чекбокса (як рядок, бо це FormData)
    formData.append("isFeatured", String(isFeatured));
    
    try {
      await createProduct(formData);
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') {
        return;
      }
      console.error(error);
      alert("Помилка при створенні товару. Перевірте термінал.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Назад до панелі
      </Link>

      <h1 className="text-6xl font-black tracking-tighter mb-12">Новий товар.</h1>

      <form action={handleSubmit} className="grid gap-10">
        {/* Media Assets Section */}
        <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
            <Package className="w-4 h-4" /> Медіа файли
          </h2>
          <ImageUpload 
            value={imageUrl} 
            onChange={(url) => setImageUrl(url)} 
            onRemove={() => setImageUrl("")} 
          />
        </section>

        {/* Display Settings Section - НОВА СЕКЦІЯ */}
        <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
            <Star className="w-4 h-4" /> Вітрина
          </h2>
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-14 h-8 rounded-full transition-colors ${isFeatured ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className="font-bold text-gray-700 group-hover:text-black transition-colors">
              Показувати у списку "Популярні товари" на головній
            </span>
          </label>
        </section>

        {/* Product Details Section */}
        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 grid gap-6">
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">Деталі продукту</h2>
           
           <div className="space-y-2">
              <input 
                name="name" 
                placeholder="Назва товару" 
                className="text-3xl font-bold w-full outline-none placeholder:text-gray-200 bg-transparent" 
                required 
              />
              <div className="h-px bg-gray-100 w-full" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ціна (₴)</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Кількість (Stock)</label>
                <input 
                  name="stock" 
                  type="number" 
                  defaultValue={10} 
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  required 
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Категорія</label>
              <select 
                name="categoryId" 
                className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all"
                required
              >
                <option value="">Оберіть категорію...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Опис товару</label>
              <textarea 
                name="description" 
                rows={4} 
                placeholder="Розкажіть про цей товар детальніше..."
                className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                required 
              />
           </div>
        </section>

        <button 
          type="submit" 
          disabled={loading || !imageUrl}
          className={`
            w-full py-8 rounded-[2.5rem] text-white font-black uppercase tracking-[0.3em] transition-all shadow-2xl
            ${loading || !imageUrl ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-black hover:bg-indigo-600 active:scale-95 shadow-indigo-100"}
          `}
        >
          {loading ? "Публікація..." : "Створити товар"}
        </button>
      </form>
    </div>
  );
}