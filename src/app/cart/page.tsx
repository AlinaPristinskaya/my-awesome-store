"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";

function CartContent() {
  const { items, addItem, reduceItem, removeItem, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Ваша корзина порожня</h1>
        <p className="text-gray-500">Немає товарів в корзині.</p>
        <Link 
          href="/" 
          className="mt-2 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition shadow-lg"
        >
          Розпочати покупки
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b last:border-0 pb-6 last:pb-0 gap-4">
            {/* Product Info */}
            <div className="flex items-center gap-4 w-full">
              <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                    No image available
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <p className="text-gray-500 font-medium">${item.price.toLocaleString()}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-8">
              <div className="flex items-center border-2 border-gray-100 rounded-full p-1 bg-gray-50">
                <button 
                  onClick={() => reduceItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition font-bold text-gray-600"
                >
                  −
                </button>
                <span className="px-4 font-bold min-w-40px text-center">{item.quantity}</span>
                <button 
                  onClick={() => addItem(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition font-bold text-gray-600"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600 p-2 transition"
                title="Remove item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-8 bg-gray-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Всього</p>
          <div className="text-4xl font-black">
            грн {totalPrice().toLocaleString()}
          </div>
        </div>
        
        {/* КНОПКА ПЕРЕХОДА В ЧЕКАУТ */}
        <Link 
          href="/checkout" 
          className="bg-white text-black px-12 py-4 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 w-full md:w-auto text-center"
        >
          Купити
        </Link>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CartContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse text-xl font-medium text-gray-400">Чекаємо вашу корзину...</div>
    </div>
  )
});