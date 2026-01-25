import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncCartWithDb } from '@/lib/cart-actions';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  reduceItem: (id: string) => void;
  removeItem: (id: string) => void;
  setItems: (items: CartItem[]) => void; // ДОБАВИЛИ ЭТО
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }),

      reduceItem: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      // ДОБАВИЛИ ЭТУ ФУНКЦИЮ
      setItems: (newItems) => set({ items: newItems }),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Синхронизация (оставляем как было)
if (typeof window !== 'undefined') {
  let timeout: NodeJS.Timeout;
  useCartStore.subscribe((state) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      syncCartWithDb(state.items);
    }, 1000);
  });
}