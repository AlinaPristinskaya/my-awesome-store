'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/AddToCartButton';
import DeleteButton from '@/components/DeleteButton';
import { Product } from '@prisma/client';
import { useHasHydrated } from '@/hooks/useHasHydrated';

interface ProductWithCategory extends Product {
  category: {
    name: string;
  };
}

interface ProductListProps {
  products: ProductWithCategory[];
  isAdmin: boolean;
}

export default function ProductList({ products, isAdmin }: ProductListProps) {
  const hasHydrated = useHasHydrated();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {products.map((product, index) => {
        const mainImage = product.images && product.images.length > 0 
          ? product.images[0] 
          : '/placeholder-product.png';

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group flex flex-col relative"
          >
            {/* Зображення товару */}
            <div className="relative aspect-[4/5] w-full mb-6 overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
              
              {/* КНОПКА ВИДАЛЕННЯ (адмін) */}
              {isAdmin && (
                <div className="absolute top-4 right-4 z-30">
                  <DeleteButton id={product.id} />
                </div>
              )}

              <Link href={`/product/${product.id}`} className="block w-full h-full">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  priority={index < 3}
                  unoptimized 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* БЕЙДЖ КАТЕГОРІЇ ВИДАЛЕНО ЗВІДСИ ДЛЯ ЧИСТОТИ ДИЗАЙНУ */}
              </Link>
            </div>

            {/* Інфо про товар */}
            <div className="px-2 grow flex flex-col">
              <Link href={`/product/${product.id}`} className="block group-hover:text-indigo-600 transition-colors text-black">
                <h2 className="text-lg font-black tracking-tighter mb-1 uppercase leading-tight line-clamp-2">
                  {product.name}
                </h2>
              </Link>
              
              <p className="text-gray-400 text-[12px] mb-4 line-clamp-2 font-medium italic">
                {product.description?.replace(/<[^>]*>?/gm, '') || "Опис відсутній"}
              </p>
              
              <div className="mt-auto flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">Ціна</span>
                  <span className="text-xl font-black text-black">
                    {hasHydrated ? `${product.price.toLocaleString('uk-UA')} грн` : '...'}
                  </span>
                </div>
                
                <div className="w-[140px]">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}