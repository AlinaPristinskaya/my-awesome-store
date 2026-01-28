'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, LayoutGrid, ChevronDown } from "lucide-react";

export default function CategorySidebar({ 
  categoryTree, 
  currentCategoryId, 
  query 
}: { 
  categoryTree: Record<string, { id: string, children: any[] }>, 
  currentCategoryId?: string,
  query?: string 
}) {
  // Стан для розгорнутих меню
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Ефект для автоматичного відкриття активної категорії при першому завантаженні
  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    Object.keys(categoryTree).forEach(parentName => {
      const parentData = categoryTree[parentName];
      const hasActiveChild = parentData.children?.some(child => child.id === currentCategoryId);
      const isParentActive = currentCategoryId === parentData.id;
      
      if (hasActiveChild || isParentActive) {
        initialOpenState[parentName] = true;
      }
    });
    setOpenMenus(prev => ({ ...initialOpenState, ...prev }));
  }, [currentCategoryId, categoryTree]);

  const toggleMenu = (e: React.MouseEvent, parent: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus(prev => ({
      ...prev,
      [parent]: !prev[parent] // Тепер це дійсно перемикач (on/off)
    }));
  };
  const resetAll = () => {
  setOpenMenus({}); // Закриваємо всі розгорнуті меню
};

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
     <Link 
  href="/" 
  onClick={resetAll} // Додаємо цей клік
  className="group flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity"
>
  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
    <LayoutGrid className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" /> 
    Каталог товарів
  </h3>
</Link>
        
        <div className="space-y-1">
          {Object.keys(categoryTree).map((parentName) => {
            const parentData = categoryTree[parentName];
            const isOpen = !!openMenus[parentName]; // Використовуємо наш стан
            const isParentActive = currentCategoryId === parentData.id;
            const hasChildren = parentData.children && parentData.children.length > 0;

            return (
              <div key={parentName} className="border-b border-gray-50 pb-1">
                <div className="flex items-center group">
                  <Link
                    href={`/?categoryId=${parentData.id}${query ? `&query=${query}` : ''}`}
                    className={`flex-1 px-4 py-3 text-[12px] font-black uppercase tracking-tight transition-all rounded-xl ${
                      isParentActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {parentName}
                  </Link>

                  {hasChildren && (
                    <button 
                      onClick={(e) => toggleMenu(e, parentName)}
                      className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Рендеримо дітей тільки якщо isOpen === true */}
                {isOpen && hasChildren && (
                  <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-gray-100 pl-2 mb-2">
                    {parentData.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/?categoryId=${child.id}${query ? `&query=${query}` : ''}`}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                          currentCategoryId === child.id 
                            ? "text-indigo-600 bg-indigo-50/50" 
                            : "text-gray-400 hover:text-black hover:bg-gray-50"
                        }`}
                      >
                        <span className="leading-tight">{child.displayName}</span>
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