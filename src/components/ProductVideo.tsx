'use client';

import { useEffect, useRef, useState } from "react";

export default function ProductVideo({ videoUrl, className }: { videoUrl: string, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.1, rootMargin: '150px' } 
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!videoUrl) return null;

  // du_5: беремо лише перші 5 секунд
  // so_0: починаємо з 0-ї секунди
  // c_scale,w_400: зменшуємо розмір до 400px (для мобілки/сітки)
  const previewUrl = videoUrl.includes('cloudinary.com') 
    ? videoUrl.replace('/upload/', '/upload/so_0,du_5,c_scale,w_400,q_auto:eco,f_auto,vc_auto/') 
    : videoUrl;

  return (
    <div ref={containerRef} className={className}>
      {isIntersecting ? (
        <video
          key={previewUrl}
          src={previewUrl}
          autoPlay
          loop
          muted
          playsInline
          // Постер теж робимо легким (so_0 — перший кадр)
          poster={previewUrl.replace('/video/upload/', '/video/upload/so_0/').replace('.mp4', '.jpg')}
          className="w-full h-full object-cover"
          preload="auto"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-50" />
      )}
    </div>
  );
}