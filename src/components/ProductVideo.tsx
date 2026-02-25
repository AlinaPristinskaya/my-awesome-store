'use client';

import { useEffect, useRef, useState } from "react";

interface ProductVideoProps {
  videoUrl: string;
  className?: string;
  onPlay?: () => void; // Додаємо цей проп для плавної появи
}

export default function ProductVideo({ videoUrl, className, onPlay }: ProductVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.1, rootMargin: '200px' } 
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!videoUrl) return null;

  // Оптимізація для Cloudinary: 
  // e_loop:5 — повторення (або du_5 для обрізки)
  // q_auto:low — максимально економимо твої ліміти/кредити
  const optimizedVideoUrl = videoUrl.includes('cloudinary.com') 
    ? videoUrl.replace('/upload/', '/upload/so_0,du_5,w_480,c_limit,q_auto:low,f_auto/') 
    : videoUrl;

  return (
    <div ref={containerRef} className={className}>
      {isIntersecting ? (
        <video
          ref={videoRef}
          key={optimizedVideoUrl}
          src={optimizedVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          // Прибираємо атрибут poster, щоб не викликати 404 
          // Замість нього працюватиме картинка з ProductCard
          onPlaying={onPlay} 
          className="w-full h-full object-cover"
          preload="metadata"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-50" />
      )}
    </div>
  );
}