'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageGallery({ images, videoUrl }: { images: string[], videoUrl?: string | null }) {
  // Встановлюємо початкове фото
  const [activeImage, setActiveImage] = useState(images[0]);

  // Якщо список картинок змінився (перейшли на інший товар), оновлюємо активну
  useEffect(() => {
    setActiveImage(images[0]);
  }, [images]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      {/* Мініатюри */}
      <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-4 md:pb-0 no-scrollbar max-h-[600px]">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
              activeImage === img 
                ? 'border-indigo-600 shadow-lg scale-105' 
                : 'border-gray-50 hover:border-gray-200'
            }`}
          >
            <Image 
              src={img || '/placeholder-product.png'} 
              alt={`thumb-${idx}`} 
              fill 
              className="object-cover" 
              unoptimized 
            />
          </button>
        ))}
        
        {/* Заглушка для відео (з'явиться автоматично, коли передамо videoUrl) */}
        {videoUrl && (
          <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter text-center px-1">
            Відео скоро
          </div>
        )}
      </div>

      {/* Головне фото */}
      <div className="flex-1 aspect-[4/5] relative bg-gray-50 rounded-[40px] overflow-hidden group border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Image
              src={activeImage || '/placeholder-product.png'}
              alt="product"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}