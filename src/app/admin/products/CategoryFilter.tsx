'use client';

import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

export default function CategoryFilter({ 
  categories, 
  currentCategoryId 
}: { 
  categories: { id: string, name: string }[], 
  currentCategoryId: string 
}) {
  const router = useRouter();

  const handleChange = (id: string) => {
    // Формуємо URL: якщо категорія вибрана — додаємо id, якщо "Усі" — прибираємо
    const url = id 
      ? `/admin/products?categoryId=${id}` 
      : `/admin/products`;
    
    router.push(url);
  };

  return (
    <div className="relative w-full md:w-64">
      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <select 
        value={currentCategoryId}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 outline-none appearance-none font-bold text-xs uppercase tracking-widest cursor-pointer focus:ring-2 focus:ring-indigo-500/10"
      >
        <option value="">Усі категорії</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>
  );
}