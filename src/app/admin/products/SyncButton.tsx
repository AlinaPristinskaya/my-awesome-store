'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { syncProductsFromXML } from '@/lib/sync-salesdrive';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (!confirm('Запустити повну синхронізацію з SalesDrive? Це може зайняти до хвилини.')) return;

    setLoading(true);
    try {
      const result = await syncProductsFromXML();

      if (result.success) {
        // Виводимо наш розумний звіт з сервера
        alert(result.message);
        router.refresh();
      } else {
        alert(`Помилка: ${result.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Сталася непередбачувана помилка під час синхронізації.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={`
        relative overflow-hidden px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3
        ${loading 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-indigo-200'
        }
      `}
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Синхронізація...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Оновити склад
        </>
      )}
      
      {loading && (
        <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 animate-progress-fast" style={{ width: '100%' }} />
      )}
    </button>
  );
}