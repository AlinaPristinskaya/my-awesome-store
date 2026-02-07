'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ChevronDown, ChevronRight, Filter } from "lucide-react";

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

  // 1. Скидання при оновленні (F5)
  useEffect(() => {
    const nav = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav?.type === 'reload' && window.location.search.includes('categoryId')) {
      router.replace('/');
    }
  }, [router]);

  // 2. Авто-розкриття при завантаженні сторінки з параметром
  useEffect(() => {
    if (!currentCategoryId) {
      setOpenMenus({});
      return;
    }
    const newOpenState: Record<string, boolean> = {};
    Object.keys(categoryTree).forEach(name => {
      const cat = categoryTree[name];
      if (cat.id === currentCategoryId || cat.children?.some(c => c.id === currentCategoryId)) {
        newOpenState[name] = true;
      }
    });
    setOpenMenus(newOpenState);
  }, [currentCategoryId, categoryTree]);

  // Єдина функція для зміни категорії
  const navigate = (id: string | null) => {
    if (!id || id === currentCategoryId) {
      setOpenMenus({});
      router.push('/');
    } else {
      router.push(`/?categoryId=${id}${query ? `&query=${query}` : ''}`);
    }
    setIsMobileMenuOpen(false);
  };

  // Функція для стрілочки: вона теж тепер скидає фільтр, якщо закриває активну папку
  const handleArrowClick = (parentName: string, parentId: string) => {
    const isClosing = !!openMenus[parentName];
    setOpenMenus(prev => ({ ...prev, [parentName]: !isClosing }));

    // Якщо ми закриваємо папку, яка зараз активна — йдемо на ТОП
    if (isClosing && (currentCategoryId === parentId || categoryTree[parentName].children.some(c => c.id === currentCategoryId))) {
      router.push('/');
    }
  };

  const currentCategoryName = Object.keys(categoryTree).find(
    name => categoryTree[name].id === currentCategoryId || 
    categoryTree[name].children.some(c => c.id === currentCategoryId)
  ) || "Каталог товарів";

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      
      {/* МОБІЛЬНЕ МЕНЮ */}
      <div className="lg:hidden mb-6">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-black rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-[12px] font-black uppercase tracking-widest text-black">
              {currentCategoryId ? currentCategoryName : "Каталог"}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMobileMenuOpen && (
          <div className="mt-2 p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-xl animate-in fade-in zoom-in-95">
            <button onClick={() => navigate(null)} className="w-full text-left p-3 text-[11px] font-black uppercase text-indigo-600 border-b mb-2 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Всі ТОП товари
            </button>
            {Object.keys(categoryTree).map(name => (
              <div key={name} className="flex flex-col">
                <button onClick={() => navigate(categoryTree[name].id)} className={`text-left p-3 text-[12px] font-black uppercase ${currentCategoryId === categoryTree[name].id ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {name}
                </button>
                {categoryTree[name].children.map(child => (
                  <button key={child.id} onClick={() => navigate(child.id)} className={`text-left ml-4 p-2 text-[13px] font-bold ${currentCategoryId === child.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                    • {child.displayName}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ДЕСКТОПНЕ МЕНЮ */}
      <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
        <button onClick={() => navigate(null)} className="w-full group flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity">
          <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
            <LayoutGrid className="w-4 h-4 text-indigo-600 group-hover:text-white" /> 
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Каталог товарів</h3>
        </button>
        
        <div className="space-y-1">
          {Object.keys(categoryTree).map((parentName) => {
            const parent = categoryTree[parentName];
            const isOpen = !!openMenus[parentName];
            const isParentActive = currentCategoryId === parent.id;
            const hasChildren = parent.children?.length > 0;

            return (
              <div key={parentName} className="mb-1">
                <div className={`flex items-center group rounded-xl transition-all ${isParentActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <button
                    onClick={() => navigate(parent.id)}
                    className={`flex-1 text-left px-4 py-3 text-[12px] font-black uppercase tracking-tight ${isParentActive ? 'text-indigo-600' : 'text-gray-900'}`}
                  >
                    {parentName}
                  </button>

                  {hasChildren && (
                    <button 
                      onClick={() => handleArrowClick(parentName, parent.id)}
                      className="p-3 rounded-xl hover:bg-gray-200/50 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                  )}
                </div>

                {isOpen && hasChildren && (
                  <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-indigo-100 pl-2 mb-2 animate-in fade-in slide-in-from-top-1">
                    {parent.children.map((child) => {
                      const isChildActive = currentCategoryId === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => navigate(child.id)}
                          className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${
                            isChildActive ? "text-indigo-600 bg-indigo-50/50" : "text-gray-400 hover:text-black hover:bg-gray-50"
                          }`}
                        >
                          {child.displayName}
                          <ChevronRight className={`w-3 h-3 transition-transform ${isChildActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        </button>
                      );
                    })}
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