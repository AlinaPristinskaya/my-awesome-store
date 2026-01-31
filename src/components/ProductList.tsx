'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react'; // Додано для ховеру
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

// Окремий компонент для кожної картки, щоб керувати станом відео
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
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Зображення або Відео */}
      <div className="relative aspect-[4/5] w-full mb-6 overflow-hidden rounded-[3rem] bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500">
        
        {/* КНОПКА ВИДАЛЕННЯ (адмін) */}
        {isAdmin && (
          <div className="absolute top-6 right-6 z-30">
            <DeleteButton id={product.id} />
          </div>
        )}

        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
  <div className="relative w-full h-full overflow-hidden">
    {/* Анімована картинка */}
    <motion.div
      className="absolute inset-0 w-full h-full"
      initial={false}
      animate={{ 
        x: isHovered && product.videoUrl ? '-100%' : '0%' 
      }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <Image
        src={mainImage}
        alt={product.name}
        fill
        priority={index < 3}
        unoptimized 
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </motion.div>

    {/* Анімоване відео */}
    {product.videoUrl && (
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ x: '100%' }}
        animate={{ 
          x: isHovered ? '0%' : '100%' 
        }}
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
}

export default function ProductList({ products, isAdmin }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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