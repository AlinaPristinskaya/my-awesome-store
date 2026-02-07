'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function CategorySidebar({ 
  categoryTree, 
  currentCategoryId, 
  query 
}: { 
  categoryTree: Record<string, { id: string, children: any[] }>, 
  currentCategoryId?: string,
  query?: string 
}) {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Скидання при оновленні F5
  useEffect(() => {
    const isReloaded = window.performance
      .getEntriesByType('navigation')
      .map((nav) => (nav as PerformanceNavigationTiming).type)
      .includes('reload');

    if (isReloaded && window.location.search.includes('categoryId')) {
      router.replace('/');
    }
  }, [router]);

  // Розкриття активної гілки
  useEffect(() => {
    if (!currentCategoryId) {
      setOpenMenus({});
      return;
    }
    const newOpenState: Record<string, boolean> = {};
    Object.keys(categoryTree).forEach(parentName => {
      const parentData = categoryTree[parentName];
      if (parentData.id === currentCategoryId || parentData.children?.some(c => c.id === currentCategoryId)) {
        newOpenState[parentName] = true;
      }
    });
    setOpenMenus(newOpenState);
  }, [currentCategoryId, categoryTree]);

  const toggleMenu = (parentName: string) => {
    setOpenMenus(prev => ({ ...prev, [parentName]: !prev[parentName] }));
  };

  // Знаходимо назву поточної категорії для кнопки
  const currentCategoryName = Object.keys(categoryTree).find(
    name => categoryTree[name].id === currentCategoryId || 
    categoryTree[name].children.some(c => c.id === currentCategoryId)
  ) || "Всі товари";

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      
      {/* МОБІЛЬНА ВЕРСІЯ: Одна кнопка-дропдаун */}
      <div className="lg:hidden mb-6">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-black rounded-2xl shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-[12px] font-black uppercase tracking-widest text-black">
              {currentCategoryId ? currentCategoryName : "Каталог товарів"}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Випадаюче меню на мобілці */}
        {isMobileMenuOpen && (
          <div className="mt-2 p-4 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 text-[11px] font-black uppercase tracking-widest text-indigo-600 border-b border-gray-200 mb-2"
            >
              <LayoutGrid className="w-4 h-4" /> Всі товари (ТОП)
            </Link>
            <div className="space-y-1">
              {Object.keys(categoryTree).map((parentName) => (
                <div key={parentName} className="flex flex-col">
                  <Link
                    href={`/?categoryId=${categoryTree[parentName].id}${query ? `&query=${query}` : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-3 text-[12px] font-black uppercase tracking-tight ${currentCategoryId === categoryTree[parentName].id ? 'text-indigo-600' : 'text-gray-900'}`}
                  >
                    {parentName}
                  </Link>
                  {/* Підкатегорії у мобільному дропдауні */}
                  {categoryTree[parentName].children.map(child => (
                    <Link
                      key={child.id}
                      href={`/?categoryId=${child.id}${query ? `&query=${query}` : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="ml-4 p-2 text-[13px] font-bold text-gray-400 flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-gray-300 rounded-full" /> {child.displayName}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ДЕСКТОПНА ВЕРСІЯ: Залишається без змін (збоку) */}
      <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
        <Link href="/" className="group flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity">
          <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
            <LayoutGrid className="w-4 h-4 text-indigo-600 group-hover:text-white transition-all duration-300" /> 
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Каталог товарів</h3>
        </Link>
        
        <div className="space-y-1">
          {Object.keys(categoryTree).map((parentName) => {
            const parentData = categoryTree[parentName];
            const isOpen = !!openMenus[parentName];
            const isParentActive = currentCategoryId === parentData.id;
            const hasChildren = parentData.children && parentData.children.length > 0;

            return (
              <div key={parentName} className="mb-1">
                <div className={`flex items-center group rounded-xl transition-all ${isParentActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <Link
                    href={`/?categoryId=${parentData.id}${query ? `&query=${query}` : ''}`}
                    className={`flex-1 px-4 py-3 text-[12px] font-black uppercase tracking-tight transition-all ${isParentActive ? 'text-indigo-600' : 'text-gray-900'}`}
                  >
                    {parentName}
                  </Link>
                  {hasChildren && (
                    <button onClick={() => toggleMenu(parentName)} className="p-3">
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                  )}
                </div>
                {isOpen && hasChildren && (
                  <div className="ml-4 border-l-2 border-indigo-100 pl-2 animate-in fade-in slide-in-from-top-1">
                    {parentData.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/?categoryId=${child.id}${query ? `&query=${query}` : ''}`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-between ${currentCategoryId === child.id ? "text-indigo-600 bg-indigo-50/50" : "text-gray-400"}`}
                      >
                        {child.displayName}
                        <ChevronRight className={`w-3 h-3 ${currentCategoryId === child.id ? 'opacity-100' : 'opacity-0'}`} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}