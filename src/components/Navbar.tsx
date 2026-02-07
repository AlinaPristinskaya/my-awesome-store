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
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

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
  }, [status, session, setItems]);

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 text-black overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* ЛІВА ЧАСТИНА: ГІГАНТСЬКЕ ЛОГО ТА КАТАЛОГ */}
        <div className="flex items-center gap-2 sm:gap-16">
          <Link href="/" className="relative flex items-center transition-transform active:scale-95">
            {/* Контейнер для лого з overflow-visible, щоб scale[4] не обрізався */}
            <div className="relative w-32 sm:w-44 h-12 flex items-center justify-center overflow-visible">
              <Image 
                src="/logo.png" 
                alt="OSELIA" 
                fill
                className="object-contain object-left scale-[2.5] sm:scale-[4] transform-gpu origin-left" 
                priority
              />
            </div>
          </Link>

          {/* КАТАЛОГ */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors group ml-2"
          >
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="hidden md:inline">Каталог</span>
          </Link>
        </div>

        {/* ПРАВА ЧАСТИНА: USER & CART */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {status !== "loading" && session?.user ? (
            <div className="flex items-center gap-2 sm:gap-3 border-r pr-2 sm:pr-4 border-gray-100">
              {isAdmin && (
                <Link href="/admin/products" title="Адмін-панель" className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all">
                  <Shield className="w-4 h-4" />
                </Link>
              )}

              <Link href="/orders" className="flex items-center gap-2 p-2 sm:px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all group">
                <Package className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest text-gray-600">Замовлення</span>
              </Link>

              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 hidden sm:block shadow-sm">
                <Image 
                  src={session.user.image || '/placeholder-user.png'} 
                  alt="User" 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
              </div>

              <button 
                onClick={() => signOut()} 
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                title="Вийти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : status !== "loading" && (
            <button 
              onClick={() => signIn("google")} 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 px-3 py-2 bg-gray-50 rounded-xl transition shadow-sm active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Увійти</span>
            </button>
          )}

          {/* КОШИК */}
          <Link 
            href="/cart" 
            className="relative p-2.5 bg-indigo-600 rounded-xl sm:rounded-2xl hover:bg-indigo-700 transition-all group shadow-lg shadow-indigo-100 active:scale-90"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <AnimatePresence>
              {hasHydrated && totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-white text-indigo-600 text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full border-2 border-indigo-600 shadow-sm"
                >
                  {totalItems > 99 ? '99' : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </nav>
  );
}