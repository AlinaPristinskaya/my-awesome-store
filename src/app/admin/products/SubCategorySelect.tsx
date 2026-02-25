'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Settings, Sparkles } from 'lucide-react';

export default function SubCategorySelect({ 
  productId, 
  currentSubCategoryId, 
  manualSubCategories, 
  crmSubCategories 
}: any) {
  const [loading, setLoading] = useState(false);
  
  // 1. Примусово робимо рядок з ID, щоб селект його "впізнав"
  const [selectedId, setSelectedId] = useState(
    currentSubCategoryId ? String(currentSubCategoryId) : ""
  );
  
  const router = useRouter();

  // 2. Слідкуємо за змінами і знову перетворюємо на рядок
  useEffect(() => {
    setSelectedId(currentSubCategoryId ? String(currentSubCategoryId) : "");
  }, [currentSubCategoryId]);

  const isManualSelected = manualSubCategories?.some(
    (s: any) => String(s.id) === String(selectedId)
  );
  return (
    <div className="relative flex items-center">
      {loading && (
        <div className="absolute -left-6">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
        </div>
      )}
      
      <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl transition-all ${
        isManualSelected 
          ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' 
          : 'border-gray-100 bg-white'
      }`}>
        {isManualSelected ? (
          <Sparkles className="w-3 h-3 text-indigo-500" />
        ) : (
          <Settings className="w-3 h-3 text-gray-400" />
        )}

        <select
          // 3. Тут має бути String
          value={String(selectedId)}
          disabled={loading}
          onChange={async (e) => {
            const val = e.target.value;
            setSelectedId(val);
            setLoading(true);

            try {
              const response = await fetch(`/api/products/${encodeURIComponent(productId)}/subcategory`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subCategoryId: val === "" ? null : val }),
              });

              if (!response.ok) throw new Error('Update failed');
              router.refresh();
              setLoading(false);
            } catch (error) {
              console.error("Update failed:", error);
              setSelectedId(currentSubCategoryId ? String(currentSubCategoryId) : "");
              setLoading(false);
            }
          }}
          className="text-[10px] font-black uppercase bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none min-w-[140px] text-black"
        >
          <option value="">Без підкатегорії</option>
          
          {manualSubCategories?.length > 0 && (
            <optgroup label="✨ ВАШІ РУЧНІ">
              {manualSubCategories.map((s: any) => (
                <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
              ))}
            </optgroup>
          )}

          {crmSubCategories?.length > 0 && (
            <optgroup label="⚙️ CRM СИСТЕМНІ">
              {crmSubCategories.map((s: any) => (
                <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    </div>
  );
}