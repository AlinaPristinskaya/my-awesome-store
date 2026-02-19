'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PriorityToggleProps {
  productId: string;
  currentPriority: number;
  updateAction: (id: string, priority: number) => Promise<void>;
}

export default function PriorityToggle({ 
  productId, 
  currentPriority, 
  updateAction 
}: PriorityToggleProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (val: number) => {
    if (val === currentPriority) return;
    setLoading(true);
    await updateAction(productId, val);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className={`flex gap-1 items-center ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      {[1, 2, 3].map((val) => (
        <button
          key={val}
          onClick={() => handleUpdate(val)}
          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border-2 ${
            currentPriority === val 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-110' 
              : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'
          }`}
        >
          {val}
        </button>
      ))}
    </div>
  );
}