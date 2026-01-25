'use client';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@prisma/client';
import toast from 'react-hot-toast';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    // Преобразуем Product из базы в формат CartItem для корзины
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0], // Берем первую картинку из массива
      quantity: 1,              // Начальное количество
    });

    toast.success(`${product.name} added!`, {
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
      className="w-full h-12 bg-black text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center"
    >
      Add to Cart
    </button>
  );
}