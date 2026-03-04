'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ПРИБРАЛИ: import { syncProductsFromXML } from '@/lib/sync-salesdrive'; 
// Це не можна імпортувати в 'use client'!

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (!confirm('Запустити повну синхронізацію з SalesDrive? Це може зайняти деякий час.')) return;

    setLoading(true);
    try {
      // КЛЮЧОВИЙ МОМЕНТ: Звертаємося до нашого API
      // Якщо в твоєму .env прописаний CRON_SECRET, додай його в URL: ?key=твій_секрет
      const response = await fetch('/api/sync?key=MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN', {
        method: 'GET', // Твій роут в api/sync/route.ts працює через GET
      });

      const result = await response.json();

      if (result.success || response.ok) {
        // Виводимо дані з об'єкта stats, який повертає API
        const stats = result.stats || {};
        alert(`Успішно! \nНових товарів: ${stats.new || 0}\nОновлено: ${stats.updated || 0}\nКатегорій: ${stats.categories || 0}`);
        router.refresh();
      } else {
        alert(`Помилка: ${result.error || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Сталася помилка при зверненні до сервера синхронізації.');
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
        <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 w-full animate-pulse" />
      )}
    </button>
  );
}