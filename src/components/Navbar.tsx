'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useHasHydrated();
  
  // Считаем общее количество товаров
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Логотип */}
        <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-70 transition">
          NEXT<span className="text-indigo-600">STORE</span>
        </Link>

        {/* Навигация */}
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="text-sm font-bold hover:text-indigo-600 transition tracking-widest text-black"
          >
            CATALOG
          </Link>
          
          {/* Иконка корзины */}
          <Link href="/cart" className="relative group p-2.5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition shadow-sm">
            <span className="text-xl">🛒</span>
            
            {/* Анимированный бейдж с защитой от Hydration Error */}
            <AnimatePresence mode="wait">
              {hasHydrated && totalItems > 0 && (
                <motion.span
                  key={totalItems} // Анимация срабатывает при изменении числа
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </nav>
  );
}