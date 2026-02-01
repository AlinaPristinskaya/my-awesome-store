"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturedToggleProps {
  productId: string;
  initialIsFeatured: boolean;
  // Ми передамо серверне дію як пропс або зробимо fetch
  toggleAction: (id: string, currentStatus: boolean) => Promise<void>;
}

export default function FeaturedToggle({ productId, initialIsFeatured, toggleAction }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (isLoading) return;

    // 1. Оптимістично змінюємо стан (миттєво)
    setIsFeatured(!isFeatured);
    setIsLoading(true);

    try {
      // 2. Відправляємо запит на сервер
      await toggleAction(productId, isFeatured);
      // 3. Оновлюємо дані сторінки у фоні
      router.refresh();
    } catch (error) {
      // Якщо помилка — повертаємо як було
      setIsFeatured(initialIsFeatured);
      console.error("Помилка оновлення:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all active:scale-90 ${
        isFeatured ? 'text-indigo-600' : 'text-gray-200 hover:text-gray-400'
      }`}
    >
      <Star className={`w-6 h-6 ${isFeatured ? 'fill-current' : ''}`} />
    </button>
  );
}