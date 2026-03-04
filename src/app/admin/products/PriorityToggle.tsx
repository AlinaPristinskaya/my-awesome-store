'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PriorityToggleProps {
  productId: string;
  currentPriority: number;
}

export default function PriorityToggle({ 
  productId, 
  currentPriority 
}: PriorityToggleProps) {
  const [loading, setLoading] = useState(false);
  const [localPriority, setLocalPriority] = useState(currentPriority);
  const router = useRouter();

  const handleUpdate = async (val: number) => {
    if (val === localPriority || loading) return;
    
    setLoading(true);
    setLocalPriority(val); // Оптимістичне оновлення

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: val }),
      });

      if (!res.ok) throw new Error("Failed to update");
      
      router.refresh();
    } catch (error) {
      setLocalPriority(currentPriority); // Відкат при помилці
      console.error("Priority update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex gap-1 items-center justify-center ${loading ? 'opacity-70' : ''}`}>
      {[1, 2, 3].map((val) => (
        <button
          key={val}
          onClick={() => handleUpdate(val)}
          disabled={loading}
          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border-2 ${
            localPriority === val 
              ? 'bg-black border-black text-white shadow-md scale-110' 
              : 'bg-white border-gray-100 text-gray-400 hover:border-black/20'
          }`}
        >
          {val}
        </button>
      ))}
    </div>
  );
}