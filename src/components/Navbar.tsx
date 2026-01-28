'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, LogOut, Package, Shield, LogIn, LayoutGrid } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import { getDbCart, syncCartWithDb } from '@/lib/cart-actions';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { items, setItems } = useCartStore();
  const hasHydrated = useHasHydrated();
  
  // Рахуємо загальну кількість товарів
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = session?.user?.email?.toLowerCase() === "pristinskayaalina9@gmail.com".toLowerCase();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const syncAndLoad = async () => {
        try {
          if (items.length > 0) await syncCartWithDb(items);
          const dbItems = await getDbCart();
          if (dbItems) setItems(dbItems as any);
        } catch (error) {
          console.error("Cart sync error:", error);
        }
      };
      syncAndLoad();
    }
  }, [status, session]);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 text-black">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity whitespace-nowrap">
            Гарна<span className="text-indigo-600">Господиня</span>
          </Link>

          {/* Кнопка КАТАЛОГ */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors group"
          >
            <LayoutGrid className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            <span className="hidden sm:inline">Каталог</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 border-l pl-4 sm:pl-6 border-gray-100">
            {status !== "loading" && session?.user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {isAdmin && (
                  <Link href="/admin/products" className="hidden lg:flex items-center gap-2 text-[10px] font-black bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all uppercase">
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link href="/orders" className="flex items-center gap-2 text-[10px] font-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest hover:bg-white transition-all">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span className="hidden md:inline">Мої замовлення</span>
                </Link>

                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-200 shadow-sm flex-shrink-0">
                  <Image 
                    src={session.user.image || '/placeholder-user.png'} 
                    alt="User" 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                </div>

                <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : status !== "loading" && (
              <button onClick={() => signIn("google")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition">
                <LogIn className="w-5 h-5" />
                <span>Увійти</span>
              </button>
            )}
          </div>

          {/* ІКОНКА КОШИКА З ЛІЧИЛЬНИКОМ */}
          <Link 
            href="/cart" 
            className="relative p-2.5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-indigo-50 transition-colors group"
          >
            <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
            <AnimatePresence>
              {hasHydrated && totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </nav>
  );
}