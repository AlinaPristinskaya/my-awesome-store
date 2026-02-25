'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ChevronDown, ChevronRight, Filter, Sparkles } from "lucide-react";

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export default function CategorySidebar({ 
  categoryTree, 
  subCategories = [], 
  currentCategoryId, 
  query 
}: { 
  categoryTree: Record<string, { id: string, children: any[] }>, 
  subCategories?: SubCategory[],
  currentCategoryId?: string,
  query?: string 
}) {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const nav = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav?.type === 'reload' && window.location.search.includes('categoryId')) {
      router.replace('/');
    }
  }, [router]);

 useEffect(() => {
  if (!currentCategoryId) {
    setOpenMenus({});
    return;
  }
  const newOpenState: Record<string, boolean> = {};
  Object.keys(categoryTree).forEach(name => {
    const cat = categoryTree[name];
    // Перевіряємо, чи є категорія активною або чи є в ній активна підкатегорія
    const hasActiveSub = subCategories?.some(s => s.id === currentCategoryId && s.categoryId === cat.id);
    
    if (cat.id === currentCategoryId || hasActiveSub) {
      newOpenState[name] = true;
    }
  });
  setOpenMenus(newOpenState);
  
  // ВИПРАВЛЕННЯ: використовуємо JSON.stringify для стабілізації масиву підкатегорій
  // або просто довжину масиву, якщо ID стабільні
}, [currentCategoryId, categoryTree, JSON.stringify(subCategories)]);

  const navigate = (id: string | null) => {
    if (!id) {
      router.push('/');
    } else {
      // Важливо: тепер ми завжди переходимо по categoryId, 
      // бо ID підкатегорії і є ID категорії з CRM
      router.push(`/?categoryId=${id}${query ? `&query=${query}` : ''}`);
    }
    setIsMobileMenuOpen(false);
  };

  const currentCategoryName = Object.keys(categoryTree).find(
    name => categoryTree[name].id === currentCategoryId || 
    subCategories.some(s => s.id === currentCategoryId && s.categoryId === categoryTree[name].id)
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
          <div className="mt-2 p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-xl">
            <button onClick={() => navigate(null)} className="w-full text-left p-3 text-[11px] font-black uppercase text-indigo-600 border-b mb-2 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Всі товари
            </button>
            {Object.keys(categoryTree).map(name => {
              const parent = categoryTree[name];
              const manualSubs = subCategories.filter(s => s.categoryId === parent.id);
              
              return (
                <div key={name} className="flex flex-col mb-4">
                  <button onClick={() => navigate(parent.id)} className={`text-left p-3 text-[12px] font-black uppercase ${currentCategoryId === parent.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {name}
                  </button>
                  
                  {manualSubs.map(sub => (
                    <button key={sub.id} onClick={() => navigate(sub.id)} className={`text-left ml-4 p-2 text-[13px] font-bold ${currentCategoryId === sub.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                      • {sub.name}
                    </button>
                  ))}
                </div>
              );
            })}
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
            const manualSubs = subCategories.filter(s => s.categoryId === parent.id);

            return (
              <div key={parentName} className="mb-1">
                <div className={`flex items-center group rounded-xl transition-all ${isParentActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <button
                    onClick={() => navigate(parent.id)}
                    className={`flex-1 text-left px-4 py-3 text-[12px] font-black uppercase tracking-tight ${isParentActive ? 'text-indigo-600' : 'text-gray-900'}`}
                  >
                    {parentName}
                  </button>

                  {manualSubs.length > 0 && (
                    <button 
                      onClick={() => setOpenMenus(prev => ({ ...prev, [parentName]: !prev[parentName] }))}
                      className="p-3 rounded-xl hover:bg-gray-200/50 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                  )}
                </div>

                {isOpen && manualSubs.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-indigo-100 pl-2 mb-2 animate-in fade-in slide-in-from-top-1">
                    {manualSubs.map((sub) => {
                      const isChildActive = currentCategoryId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => navigate(sub.id)}
                          className={`text-left px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${
                            isChildActive ? "text-indigo-600 bg-indigo-50/50" : "text-gray-400 hover:text-black hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                             {/* Ви можете прибрати іконку Sparkles, якщо хочете ідентичний вигляд */}
                            <Sparkles className={`w-3 h-3 ${isChildActive ? 'text-indigo-600' : 'text-indigo-200'}`} />
                            {sub.name}
                          </div>
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