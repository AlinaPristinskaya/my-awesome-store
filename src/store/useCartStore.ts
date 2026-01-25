import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@prisma/client';

// 1. Описываем тип товара в корзине
// Мы берем все свойства из модели Product и добавляем поле quantity
export interface CartItem extends Product {
  quantity: number;
}

// 2. Описываем структуру нашего хранилища
interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  decreaseItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

// 3. Создаем сам Store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // Приводим Product к CartItem, добавляя quantity: 1
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      decreaseItem: (productId) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === productId);

        if (existingItem && existingItem.quantity > 1) {
          set({
            items: currentItems.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            ),
          });
        } else {
          set({ items: currentItems.filter((item) => item.id !== productId) });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // данные сохранятся в localStorage браузера
    }
  )
);