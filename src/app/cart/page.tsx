'use client';

import { useCartStore } from '@/store/useCartStore';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, addItem, decreaseItem, removeItem, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-10 tracking-tight">Shopping Cart</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex items-center p-6 border-b border-gray-50 last:border-0">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
              </div>

              <div className="ml-6 grow">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-indigo-600 font-black">${item.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-100 rounded-xl bg-gray-50 p-1">
                  <button onClick={() => decreaseItem(item.id)} className="w-8 h-8 hover:bg-white rounded-lg transition-all shadow-sm">-</button>
                  <span className="px-4 font-bold min-w-10 text-center">{item.quantity}</span>
                  <button onClick={() => addItem(item)} className="w-8 h-8 hover:bg-white rounded-lg transition-all shadow-sm">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-gray-400 font-medium uppercase text-xs tracking-widest">Grand Total</p>
            <p className="text-4xl font-black">${totalPrice().toLocaleString()}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={clearCart} className="px-6 py-4 text-gray-400 hover:text-black font-bold">Clear</button>
           <Link href="/checkout" className="grow md:grow-0 bg-black text-white px-12 py-4 rounded-2xl font-bold hover:bg-gray-800 shadow-xl transition-all text-center">
  Proceed to Checkout
</Link>
          </div>
        </div>
      </div>
    </div>
  );
}