'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Layers, ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
  categories: { id: string; name: string; parentId?: string | null }[];
  subCategories: { id: string; name: string; categoryId: string; _count?: { products: number } }[];
}

export default function CategoryFilter({ 
  categories = [], 
  subCategories = [] 
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get('categoryId') || "";
  const currentSubCategoryId = searchParams.get('subCategoryId') || "";

  // 1. ГОЛОВНІ КАТЕГОРІЇ (тільки корінь, як і домовлялися)
  const rootCategories = categories.filter(cat => !cat.parentId);

  // 2. ПІДКАТЕГОРІЇ — ТІЛЬКИ ТВОЇ РУЧНІ (SubCategoryManager)
  // Ми більше не беремо "дітей" з CRM у цей список, щоб не було дублів!
  const availableManualSubCategories = subCategories.filter(
    (s) => s.categoryId === currentCategoryId
  );

  const handleCategoryChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('categoryId', id);
    } else {
      params.delete('categoryId');
    }
    params.delete('subCategoryId');
    params.delete('query'); // Очищуємо пошук при зміні категорії
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleSubCategoryChange = (subId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subId) {
      params.set('subCategoryId', subId);
    } else {
      params.delete('subCategoryId');
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
      {/* ПЕРШИЙ СЕЛЕКТ (CRM Головні) */}
      <div className="relative w-full md:w-72 group">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <select 
          value={currentCategoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-gray-100 outline-none appearance-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-sm text-black"
        >
          <option value="">Усі категорії</option>
          {rootCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>

      {/* ДРУГИЙ СЕЛЕКТ (Твої РУЧНІ підкатегорії) */}
      {currentCategoryId && availableManualSubCategories.length > 0 && (
        <div className="relative w-full md:w-72 group animate-in fade-in slide-in-from-left-2">
          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 z-10" />
          <select 
            value={currentSubCategoryId}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-indigo-50 outline-none appearance-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-sm text-black"
          >
            <option value="">Усі підкатегорії</option>
            {availableManualSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} {sub._count && sub._count.products > 0 ? `(${sub._count.products})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-400 pointer-events-none" />
        </div>
      )}
    </div>
  );
}