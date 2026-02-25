'use client';

import { useState } from "react";
import { Plus, Package, Layers, ChevronRight, Settings, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CategoryFilter from "./CategoryFilter";
import SyncButton from "./SyncButton";
import FeaturedToggle from "./FeaturedToggle";
import PriorityToggle from "./PriorityToggle";
import VideoSelect from "@/app/admin/VideoSelect";
import SubCategoryManager from "./SubCategoryManager";
import SubCategorySelect from "./SubCategorySelect";

export default function AdminProductsClient({ 
  initialProducts, 
  categoryTree, 
  subCategories, 
  allVideos, 
  query, 
  categoryId 
}: any) {
  const [activeTab, setActiveTab] = useState<'products' | 'subcategories'>('products');
  const router = useRouter();

  const mainCategories = Object.keys(categoryTree).map(name => ({
    id: categoryTree[name].id,
    name: name
  }));

  const updatePriority = async (id: string, priority: number) => {
    await fetch(`/api/products/${id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    });
    router.refresh();
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/products/${id}/featured`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !currentStatus }),
    });
    router.refresh();
  };

  // НОВА ФУНКЦІЯ: Приховування товару
  const toggleVisibility = async (id: string, currentIsHidden: boolean) => {
    await fetch(`/api/products/${id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !currentIsHidden }),
    });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase mb-6">Склад</h1>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-black text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                Товари
              </button>
              <button onClick={() => setActiveTab('subcategories')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'subcategories' ? 'bg-black text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                Підкатегорії
              </button>
            </div>
          </div>

          {activeTab === 'products' && (
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
              <CategoryFilter categories={mainCategories} currentCategoryId={categoryId} />
              <SyncButton />
              <Link href="/admin/products/new" className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Додати
              </Link>
            </div>
          )}
        </header>

        {activeTab === 'products' ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="p-8 text-black">Товар</th>
                  <th className="p-8 text-black">Підкатегорія</th>
                  <th className="p-8 text-center text-black">Рейтинг</th>
                  <th className="p-8 text-center text-black">Вітрина</th>
                  <th className="p-8 text-right text-black">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialProducts.map((product: any) => {
                  const parentName = Object.keys(categoryTree).find(name => 
                    categoryTree[name].id === product.categoryId || 
                    categoryTree[name].children.some((c: any) => c.id === product.categoryId)
                  );
                  const parentData = parentName ? categoryTree[parentName] : null;

                  // Тепер ми використовуємо ТІЛЬКИ список subCategories з бази (Neon)
                  // Оскільки синхронізація вже записала туди CRM-категорії, дублів не буде
                  const filteredSubs = subCategories
                    .filter((s: any) => s.categoryId === parentData?.id)
                    .map((s: any) => ({ id: s.id, name: s.name }));

                  // Визначаємо, чи товар потребує сортування (якщо категорія з CRM, але не вибрана підкатегорія)
                  const needsSorting = !product.subCategoryId;

                  return (
                    <tr key={product.id} className={`hover:bg-gray-50/30 transition-colors ${product.isHidden ? 'opacity-40 bg-gray-50/50' : ''}`}>
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            <Image src={product.images[0] || "/placeholder.png"} alt="" fill className="object-cover" unoptimized />
                            {product.isHidden && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <EyeOff className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-sm text-black">{product.name}</p>
                              {needsSorting && (
                                <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black flex items-center gap-1 border border-amber-100">
                                  <AlertCircle className="w-2 h-2" /> Потребує уточнення
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase text-gray-300 flex items-center gap-1">
                            <Settings className="w-2 h-2" /> {parentName || "Каталог"}
                          </span>
                          <SubCategorySelect 
                            productId={product.id} 
                            currentSubCategoryId={product.subCategoryId} 
                            manualSubCategories={filteredSubs}
                            crmSubCategories={[]} // Ми залишаємо порожнім, бо всі категорії тепер у manualSubs
                          />
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <PriorityToggle productId={product.id} currentPriority={product.priority || 1} updateAction={updatePriority} />
                      </td>
                      <td className="p-8 text-center">
                        <FeaturedToggle productId={product.id} initialIsFeatured={product.isFeatured} toggleAction={toggleFeatured} />
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                             {/* Кнопка Ігнорування (isHidden) */}
                            <button 
                              onClick={() => toggleVisibility(product.id, product.isHidden)}
                              className={`p-2 rounded-xl border transition-all ${product.isHidden ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-gray-100 text-gray-400 hover:text-black'}`}
                              title={product.isHidden ? "Показати товар" : "Приховати товар"}
                            >
                              {product.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <VideoSelect productId={product.id} currentVideo={product.videoUrl} allVideos={allVideos} />
                          </div>
                          <Link href={`/admin/products/${product.id}`} className="text-[10px] font-black uppercase text-indigo-600 hover:underline mt-1">Редагувати</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <SubCategoryManager categoryTree={categoryTree} subCategories={subCategories} />
        )}
      </div>
    </div>
  );
}