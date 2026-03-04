"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturedToggleProps {
  productId: string;
  initialIsFeatured: boolean;
}

export default function FeaturedToggle({ productId, initialIsFeatured }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (isLoading) return;

    const newStatus = !isFeatured;
    setIsFeatured(newStatus); // Оптимістичне оновлення
    setIsLoading(true);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newStatus }),
      });

      if (!res.ok) throw new Error("Помилка сервера");
      
      router.refresh(); // Оновлюємо дані на сторінці
    } catch (error) {
      setIsFeatured(initialIsFeatured); // Відкат при помилці
      console.error("Помилка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all active:scale-90 ${
        isFeatured ? 'text-amber-500' : 'text-gray-200 hover:text-gray-400'
      }`}
    >
      <Star className={`w-6 h-6 ${isFeatured ? 'fill-current' : ''}`} />
    </button>
  );
}