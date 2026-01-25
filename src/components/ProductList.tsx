'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { Product } from '@prisma/client';
import { useHasHydrated } from '@/hooks/useHasHydrated';

// Расширяем тип, так как Prisma возвращает товар вместе с объектом категории
interface ProductWithCategory extends Product {
  category: {
    name: string;
  };
}

interface ProductListProps {
  products: ProductWithCategory[];
}

export default function ProductList({ products }: ProductListProps) {
  const hasHydrated = useHasHydrated();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group flex flex-col"
        >
          {/* Изображение товара */}
          <Link 
            href={`/product/${product.id}`}
            className="relative aspect-4/5 w-full mb-6 overflow-hidden rounded-2rem bg-gray-50 border border-gray-100 block shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Бейдж категории */}
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-black">
                {product.category.name}
              </span>
            </div>
          </Link>

          {/* Инфо о товаре */}
          <div className="px-2 grow flex flex-col">
            <Link href={`/product/${product.id}`} className="block group-hover:text-indigo-600 transition-colors text-black">
              <h2 className="text-xl font-bold tracking-tight mb-1">{product.name}</h2>
            </Link>
            <p className="text-gray-400 text-sm mb-4 line-clamp-1 italic">
              {product.description}
            </p>
            
            <div className="mt-auto flex items-center justify-between">
              {/* Исправленная цена для предотвращения Hydration Error */}
              <span className="text-2xl font-black text-black">
                {hasHydrated ? `$${product.price.toLocaleString('en-US')}` : '...'}
              </span>
              
              <div className="w-140px">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}