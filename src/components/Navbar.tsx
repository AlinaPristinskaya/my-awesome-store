'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, LogIn, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import { getDbCart } from '@/lib/cart-actions'; // Мы создадим этот экшен следующим шагом

export default function Navbar() {
  const { data: session } = useSession();
  const { items, setItems } = useCartStore(); // setItems нужен для загрузки из БД
  const hasHydrated = useHasHydrated();
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // СИНХРОНИЗАЦИЯ ПРИ ВХОДЕ:
  // Как только сессия становится активной, запрашиваем корзину из Neon DB
  useEffect(() => {
    if (session?.user) {
      const loadCart = async () => {
        const dbItems = await getDbCart();
        if (dbItems && dbItems.length > 0) {
          setItems(dbItems);
        }
      };
      loadCart();
    }
  }, [session, setItems]);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 text-black">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-70 transition">
          NEXT<span className="text-indigo-600">STORE</span>
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="hidden sm:block text-sm font-bold hover:text-indigo-600 transition tracking-widest"
          >
            CATALOG
          </Link>
          
          <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-200">
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
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => signIn("google")}
                className="flex items-center gap-2 text-sm font-bold hover:text-indigo-600 transition"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">SIGN IN</span>
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <Link 
            href="/cart" 
            className="relative group p-2.5 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all duration-300 shadow-sm border border-gray-100"
          >
            <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
            
            <AnimatePresence mode="wait">
              {hasHydrated && totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
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