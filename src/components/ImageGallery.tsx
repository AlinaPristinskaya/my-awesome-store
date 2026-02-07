'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images, videoUrl }: { images: string[], videoUrl?: string | null }) {
  const media = [
    ...images.map(url => ({ type: 'image', url })),
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : [])
  ];

  const [index, setIndex] = useState(0);
  const activeMedia = media[index];

  // Функція для перемикання (для свайпів)
  const paginate = useCallback((newDirection: number) => {
    const nextIndex = index + newDirection;
    if (nextIndex >= 0 && nextIndex < media.length) {
      setIndex(nextIndex);
    }
  }, [index, media.length]);

  useEffect(() => {
    setIndex(0);
  }, [images, videoUrl]);

  return (
    <div className="flex flex-col gap-4">
      {/* Головне вікно зі СВАЙПАМИ */}
      <div className="relative aspect-[4/5] w-full bg-gray-50 md:rounded-[40px] rounded-3xl overflow-hidden group border border-gray-100 touch-pan-y">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -50) paginate(1);
              else if (swipe > 50) paginate(0 - 1);
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            {activeMedia.type === 'image' ? (
              <Image
                src={activeMedia.url || '/placeholder-product.png'}
                alt="product"
                fill
                className="object-cover pointer-events-none"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full bg-black">
                <video
                  key={activeMedia.url} // Важливо для перезавантаження при зміні
                  src={activeMedia.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Стрілочки (тільки десктоп) */}
        <button 
          onClick={() => paginate(-1)}
          disabled={index === 0}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => paginate(1)}
          disabled={index === media.length - 1}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Мобільний індикатор (крапки) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
          {media.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-300 rounded-full ${i === index ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Мініатюри (Ховаємо на маленьких екранах або робимо в ряд) */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
        {media.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center ${
              index === idx 
                ? 'border-indigo-600 shadow-md scale-105' 
                : 'border-transparent bg-gray-100'
            }`}
          >
            {item.type === 'image' ? (
              <Image 
                src={item.url || '/placeholder-product.png'} 
                alt={`thumb-${idx}`} 
                fill 
                className="object-cover" 
                unoptimized 
              />
            ) : (
              <div className="w-full h-full bg-indigo-50 flex flex-col items-center justify-center text-indigo-600">
                <Play className="w-4 h-4 fill-current" />
                <span className="text-[7px] font-black uppercase mt-0.5">Відео</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}