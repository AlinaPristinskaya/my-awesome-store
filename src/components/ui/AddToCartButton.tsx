'use client';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@prisma/client';
import toast from 'react-hot-toast'; // Импорт

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      style: {
        borderRadius: '16px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
    >
      Add to Cart
    </button>
  );
}