'use client';

export default function ProductVideo({ videoUrl, className }: { videoUrl: string, className?: string }) {
  if (!videoUrl) return null;

  // 1. Очищуємо URL від можливих зайвих параметрів
  // 2. Додаємо форсоване стиснення та правильні кодеки
  // vc_auto: автоматично вибере mp4 (h264) або webm залежно від браузера
  const optimizedUrl = videoUrl.includes('cloudinary.com') 
    ? videoUrl.replace('/upload/', '/upload/f_auto,q_auto:best,vc_auto,br_1m/') 
    : videoUrl;

  return (
    <video
      key={optimizedUrl} // Важливо для оновлення відео при зміні посилання
      src={optimizedUrl}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={className}
      onError={(e) => console.error("Video play error:", e)}
    >
      {/* Резервний варіант, якщо основний формат не підтримується */}
      Тег video не підтримується вашим браузером.
    </video>
  );
}