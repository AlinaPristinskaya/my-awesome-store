'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { motion } from 'framer-motion';
import { ShoppingBag, LogIn, LogOut, Package, Shield, Plus } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import { getDbCart, syncCartWithDb } from '@/lib/cart-actions';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { items, setItems } = useCartStore();
  const hasHydrated = useHasHydrated();
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = session?.user?.email?.toLowerCase() === "pristinskayaalina9@gmail.com".toLowerCase();

  useEffect(() => {
    let isFetched = false;

    if (status === "authenticated" && session?.user && !isFetched) {
      const syncAndLoad = async () => {
        try {
          // Если гость что-то положил в корзину ПЕРЕД логином — отправляем это в базу
          if (items.length > 0) {
            await syncCartWithDb(items);
          }
          
          // Получаем итоговую корзину (уже слитую в базе)
          const dbItems = await getDbCart();
          if (dbItems) {
            setItems(dbItems as any);
          }
          isFetched = true;
        } catch (error) {
          console.error("Cart sync error:", error);
        }
      };
      syncAndLoad();
    }
  }, [status, session]); // Зависимость от статуса входа

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 text-black">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link href="/" className="text-2xl font-black tracking-tighter">
          NEXT<span className="text-indigo-600">STORE</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="hidden sm:block text-sm font-bold tracking-widest">
            CATALOG
          </Link>
          
          <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
            {status !== "loading" && session?.user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <>
                    <Link 
                      href="/admin/orders" 
                      className="flex items-center gap-2 text-[10px] font-black bg-black text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all uppercase"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Admin</span>
                    </Link>
                    <Link 
                      href="/admin/add-product" 
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </Link>
                  </>
                )}

                <Link 
                  href="/orders" 
                  className="flex items-center gap-2 text-xs font-bold bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden md:inline uppercase">My Orders</span>
                </Link>

                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-200">
                  <Image 
                    src={session.user.image || '/placeholder-user.png'} 
                    alt="User" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : status !== "loading" && (
              <button onClick={() => signIn("google")} className="flex items-center gap-2 text-sm font-bold hover:text-indigo-600 transition">
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline uppercase">Sign In</span>
              </button>
            )}
          </div>

          <Link href="/cart" className="relative p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
            {hasHydrated && totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}