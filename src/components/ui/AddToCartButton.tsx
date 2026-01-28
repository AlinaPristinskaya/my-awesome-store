'use client';

import { useCartStore } from '@/store/useCartStore';
import { Product } from '@prisma/client';
import toast from 'react-hot-toast';
import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      // Беремо першу картинку з масиву або заглушку
      image: product.images?.[0] || '/placeholder-product.png',
      quantity: 1,
    });

    toast.success(`Додано у кошик!`, {
      icon: '🛒',
      style: {
        borderRadius: '20px',
        background: '#000',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      },
    });

    // Повертаємо початковий стан кнопки через секунду
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isAdding}
      className={`
        relative w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px]
        transition-all duration-500 flex items-center justify-center overflow-hidden
        ${isAdding 
          ? 'bg-indigo-600 text-white' 
          : 'bg-black text-white hover:bg-indigo-600 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] active:scale-95'
        }
      `}
    >
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="adding"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>В кошику</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Додати</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}