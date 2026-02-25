'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import AddToCartButton from '@/components/ui/AddToCartButton';
import DeleteButton from '@/components/DeleteButton';
import { Product } from '@prisma/client';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import ProductVideo from '@/components/ProductVideo';

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
  const [videoLoaded, setVideoLoaded] = useState(false); // Новий стан
  const hasHydrated = useHasHydrated();
  
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.png';

  const isMobile = hasHydrated && window.innerWidth < 768;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] w-full mb-3 md:mb-6 overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
        
        {isAdmin && (
          <div className="absolute top-2 right-2 md:top-6 md:right-6 z-30 scale-75 md:scale-100">
            <DeleteButton id={product.id} />
          </div>
        )}

        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
          <div className="relative w-full h-full overflow-hidden">
            
            {/* 1. ФОТО: Показується завжди спочатку, плавно зникає коли ВІДЕО готове */}
            <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${
              (videoLoaded && (isHovered || isMobile)) ? 'opacity-0' : 'opacity-100'
            }`}>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority={index < 4}
                unoptimized 
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>

            {/* 2. ВІДЕО: Лежить під картинкою і проявляється після завантаження */}
            {product.videoUrl && (
              <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                (videoLoaded && (isHovered || isMobile)) ? 'opacity-100' : 'opacity-0'
              }`}>
                <ProductVideo 
                  videoUrl={product.videoUrl} 
                  className="w-full h-full object-cover"
                  // Важливо: додаємо подію, щоб знати коли відео завантажилось
                  onPlay={() => setVideoLoaded(true)} 
                />
              </div>
            )}
            
          </div>
        </Link>
      </div>

      {/* Інфо про товар */}
      <div className="px-1 grow flex flex-col">
        <Link href={`/product/${product.id}`} className="block group-hover:text-indigo-600 transition-colors text-black">
          <h2 className="text-[13px] md:text-lg font-black tracking-tighter mb-1 uppercase leading-tight line-clamp-2">
            {product.name}
          </h2>
        </Link>
        
        <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="flex flex-col">
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