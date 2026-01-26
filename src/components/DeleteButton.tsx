'use client';

import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/lib/product-actions";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    // Останавливаем всплытие, чтобы при нажатии на корзину 
    // нас не перекидывало на страницу товара
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await deleteProduct(id);
      } catch (error) {
        alert("Could not delete");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className={`
        flex items-center justify-center
        w-10 h-10 
        bg-white/90 backdrop-blur-md 
        text-rose-500 
        rounded-2xl 
        shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
        border border-white/50
        transition-all duration-300
        hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        group/delete
      `}
      title="Delete Product"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Trash2 className="w-5 h-5 transition-transform group-hover/delete:rotate-12" />
      )}
    </button>
  );
}