"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { syncProductsFromXML } from "@/lib/sync-salesdrive"; // Перевір шлях до файлу синхронізації
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (!confirm("Запустити повну синхронізацію з SalesDrive?")) return;
    
    setLoading(true);
    try {
      const result = await syncProductsFromXML();
      if (result.success) {
        alert(`Успішно синхронізовано ${result.count} товарів!`);
        router.refresh(); // Оновлюємо дані на сторінці
      } else {
        alert("Помилка: " + result.error);
      }
    } catch (error) {
      alert("Відбулася помилка під час запиту");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl ${
        loading 
          ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
          : "bg-indigo-600 text-white hover:bg-black"
      }`}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Синхронізація..." : "Оновити базу"}
    </button>
  );
}