'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/product-actions";
import ImageUpload from "@/components/ImageUpload";
import { Category } from "@prisma/client";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

export default function ProductForm({ categories }: { categories: Category[] }) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("imageUrl", imageUrl);
    
    try {
      // Вызываем экшен
      await createProduct(formData);
      
      // Если мы дошли сюда и экшен не выкинул настоящую ошибку, 
      // значит все Ок. Но редирект сработает сам на стороне сервера.
      
    } catch (error: any) {
      // Игнорируем ошибку, если это на самом деле редирект от Next.js
      if (error.message === 'NEXT_REDIRECT') {
        return;
      }
      
      console.error(error);
      alert("Ошибка при создании товара. Проверьте терминал.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-6xl font-black tracking-tighter mb-12">New Item.</h1>

      <form action={handleSubmit} className="grid gap-10">
        {/* Media Assets Section */}
        <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
            <Package className="w-4 h-4" /> Media Assets
          </h2>
          <ImageUpload 
            value={imageUrl} 
            onChange={(url) => setImageUrl(url)} 
            onRemove={() => setImageUrl("")} 
          />
        </section>

        {/* Product Details Section */}
        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 grid gap-6">
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">Product Details</h2>
           
           <div className="space-y-2">
              <input 
                name="name" 
                placeholder="Product Name" 
                className="text-3xl font-bold w-full outline-none placeholder:text-gray-200 bg-transparent" 
                required 
              />
              <div className="h-px bg-gray-100 w-full" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Price ($)</label>
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
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Stock</label>
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
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
              <select 
                name="categoryId" 
                className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all"
                required
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</label>
              <textarea 
                name="description" 
                rows={4} 
                placeholder="Tell us about this product..."
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
          {loading ? "Publishing..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}