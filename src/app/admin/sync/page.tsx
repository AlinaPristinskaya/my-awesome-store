'use client';
import { syncProductsFromXML } from "@/lib/sync-salesdrive";
import { useState } from "react";

export default function SyncPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    const result = await syncProductsFromXML();
    setStatus(result);
    setLoading(false);
  };

  return (
    <div className="p-20 text-center">
      <h1 className="text-3xl font-black mb-8">СИНХРОНІЗАЦІЯ З SALESDRIVE</h1>
      <button 
        onClick={handleSync}
        disabled={loading}
        className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-black transition-all disabled:bg-gray-300"
      >
        {loading ? "ЙДЕ ОНОВЛЕННЯ..." : "ЗАПУСТИТИ ІМПОРТ ТОВАРІВ"}
      </button>

      {status && (
        <div className="mt-10 p-6 bg-gray-50 rounded-3xl inline-block border border-gray-100">
          {status.success ? (
            <p className="text-emerald-600 font-bold">
              Успішно! Оновлено категорій: {status.categories}, товарів: {status.products}
            </p>
          ) : (
            <p className="text-red-600 font-bold">Помилка: {status.error}</p>
          )}
        </div>
      )}
    </div>
  );
}