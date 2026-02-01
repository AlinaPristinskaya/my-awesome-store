import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoaded: boolean; // Флаг готовности корзины
  addItem: (item: CartItem) => void;
  reduceItem: (id: string) => void;
  removeItem: (id: string) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoaded: false, // Изначально false

      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        const updatedItems = existingItem
          ? state.items.map((item) => item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item)
          : [...state.items, { ...newItem, quantity: 1 }];
        return { items: updatedItems };
      }),

      reduceItem: (id) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
          .filter((item) => item.quantity > 0),
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      setItems: (newItems) => set({ items: newItems, isLoaded: true }),

      clearCart: () => {
        set({ items: [] });
        if (typeof window !== 'undefined') localStorage.removeItem('cart-storage');
      },

      totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);