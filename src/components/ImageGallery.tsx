'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, VolumeX } from 'lucide-react';

export default function ImageGallery({ images, videoUrl }: { images: string[], videoUrl?: string | null }) {
  const media = [
    ...images.map(url => ({ type: 'image', url })),
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : [])
  ];

  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeMedia = media[index];

  // Функція для перемикання
  const paginate = useCallback((newDirection: number) => {
    const nextIndex = index + newDirection;
    if (nextIndex >= 0 && nextIndex < media.length) {
      setIndex(nextIndex);
    }
  }, [index, media.length]);

  // Скидання індексу при зміні товару
  useEffect(() => {
    setIndex(0);
  }, [images, videoUrl]);

  // ГАРАНТОВАНИЙ ЗАПУСК ВІДЕО
  useEffect(() => {
    if (activeMedia.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      video.muted = true; // Примусово вимикаємо звук через JS
      video.defaultMuted = true;
      
      const playVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          console.log("Автозапуск заблоковано, очікуємо взаємодії користувача");
        }
      };
      
      playVideo();
    }
  }, [index, activeMedia]);

  return (
    <div className="flex flex-col gap-4">
      {/* ГЛАВНОЕ ОКНО */}
      <div className="relative aspect-[4/5] w-full bg-gray-50 md:rounded-[40px] rounded-3xl overflow-hidden group border border-gray-100 touch-pan-y">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -50) paginate(1);
              if (offset.x > 50) paginate(-1);
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            {activeMedia.type === 'image' ? (
              <Image
                src={activeMedia.url || '/placeholder-product.png'}
                alt="product"
                fill
                className="object-cover pointer-events-none select-none"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={activeMedia.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls={false} // На телефонах краще без контролерів, щоб не заважали свайпам
                  className="w-full h-full object-cover"
                  onLoadedData={(e) => {
                    const v = e.currentTarget;
                    v.muted = true;
                    v.play();
                  }}
                />
                {/* Іконка "Без звуку" для візуального підтвердження */}
                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full">
                  <VolumeX className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* СТРІЛКИ (Desktop) */}
        {index > 0 && (
          <button onClick={() => paginate(-1)} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-xl z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {index < media.length - 1 && (
          <button onClick={() => paginate(1)} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-xl z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* МОБІЛЬНІ ТОЧКИ */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-10">
          {media.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'}`} />
          ))}
        </div>
      </div>

      {/* МІНІАТЮРИ */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
        {media.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
              index === idx ? 'border-indigo-600 scale-105' : 'border-transparent bg-gray-100 opacity-60'
            }`}
          >
            {item.type === 'image' ? (
              <Image src={item.url} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 text-indigo-600">
                <Play className="w-5 h-5 fill-current" />
                <span className="text-[7px] font-black uppercase mt-1">Video</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}