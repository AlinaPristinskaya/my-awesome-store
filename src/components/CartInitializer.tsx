'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/useCartStore';

export default function CartInitializer() {
  const { data: session, status } = useSession();
  const { items, setItems, clearCart } = useCartStore();

  useEffect(() => {
    // 1. Если юзер разлогинился — чистим локальную корзину
    if (status === "unauthenticated") {
      clearCart();
    }

    // 2. Если юзер залогинился — тянем данные из БД
    if (status === "authenticated" && session) {
      const fetchDbCart = async () => {
        try {
          const res = await fetch('/api/cart'); // Создадим этот роут ниже
          if (res.ok) {
            const dbItems = await res.json();
            // Объединяем или просто заменяем (лучше заменить данными из БД)
            setItems(dbItems);
          }
        } catch (e) {
          console.error("Failed to sync cart with DB", e);
        }
      };
      fetchDbCart();
    }
  }, [status, session, setItems, clearCart]);

  // 3. Синхронизация изменений В БАЗУ (debounce)
  useEffect(() => {
    if (status !== "authenticated") return;

    const timeout = setTimeout(async () => {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [items, status]);

  return null;
}