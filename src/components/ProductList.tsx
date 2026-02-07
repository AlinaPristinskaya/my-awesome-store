'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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

function ProductCard({ product, index, isAdmin }: { product: ProductWithCategory, index: number, isAdmin: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasHydrated = useHasHydrated();
  
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Контейнер зображення/відео: адаптивне закруглення та тіні */}
      <div className="relative aspect-[4/5] w-full mb-3 md:mb-6 overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
        
        {isAdmin && (
          <div className="absolute top-2 right-2 md:top-6 md:right-6 z-30 scale-75 md:scale-100">
            <DeleteButton id={product.id} />
          </div>
        )}

        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
          <div className="relative w-full h-full overflow-hidden">
            {/* Анімована картинка */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={false}
              animate={{ x: isHovered && product.videoUrl ? '-100%' : '0%' }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority={index < 4}
                unoptimized 
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </motion.div>

            {/* Анімоване відео */}
            {product.videoUrl && (
              <motion.div
                className="absolute inset-0 w-full h-full"
                initial={{ x: '100%' }}
                animate={{ x: isHovered ? '0%' : '100%' }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <video
                  src={product.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </div>
        </Link>
      </div>

      {/* Інфо про товар: зменшені відступи та шрифти для мобільних */}
      <div className="px-1 grow flex flex-col">
        <Link href={`/product/${product.id}`} className="block group-hover:text-indigo-600 transition-colors text-black">
          <h2 className="text-[13px] md:text-lg font-black tracking-tighter mb-1 uppercase leading-tight line-clamp-2">
            {product.name}
          </h2>
        </Link>
        
        {/* Опис ховаємо на маленьких екранах, щоб не забивати місце */}
        <p className="hidden md:line-clamp-2 text-gray-400 text-[12px] mb-4 font-medium">
          {product.description?.replace(/<[^>]*>?/gm, '') || "Опис відсутній"}
        </p>
        
        <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="flex flex-col">
            <span className="hidden md:block text-[10px] font-bold uppercase text-gray-300 tracking-wider">Ціна</span>
            <span className="text-[15px] md:text-xl font-black text-black whitespace-nowrap">
              {hasHydrated ? `${product.price.toLocaleString('uk-UA')} грн` : '...'}
            </span>
          </div>
          
          <div className="w-full md:w-[140px]">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductList({ products, isAdmin }: ProductListProps) {
  return (
    /* grid-cols-2: 2 колонки на мобільних 
      md:grid-cols-2: залишаємо 2 на планшетах 
      lg:grid-cols-3: 3 колонки на великих екранах
      gap: зменшені відступи на мобільних
    */
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-12">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          index={index} 
          isAdmin={isAdmin} 
        />
      ))}
    </div>
  );
}