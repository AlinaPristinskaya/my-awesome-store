'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

export default function ImageGallery({ images, videoUrl }: { images: string[], videoUrl?: string | null }) {
  // Створюємо спільний список медіа
  const media = [
    ...images.map(url => ({ type: 'image', url })),
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : [])
  ];

  const [activeMedia, setActiveMedia] = useState(media[0]);

  useEffect(() => {
    setActiveMedia(media[0]);
  }, [images, videoUrl]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      {/* Мініатюри */}
      <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-4 md:pb-0 no-scrollbar max-h-[600px]">
        {media.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveMedia(item)}
            className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center ${
              activeMedia.url === item.url 
                ? 'border-indigo-600 shadow-lg scale-105' 
                : 'border-gray-50 hover:border-gray-200'
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
                <Play className="w-6 h-6 fill-current" />
                <span className="text-[8px] font-black uppercase mt-1">Відео</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Головне вікно (Фото або Відео) */}
      <div className="flex-1 aspect-[4/5] relative bg-gray-50 rounded-[40px] overflow-hidden group border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMedia.url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {activeMedia.type === 'image' ? (
              <Image
                src={activeMedia.url || '/placeholder-product.png'}
                alt="product"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
            ) : (
              <video
                src={activeMedia.url}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}