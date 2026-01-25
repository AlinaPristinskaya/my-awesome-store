"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createOrder } from "@/lib/order"; // ИМПОРТИРУЕМ НАШ ЭКШЕН

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // СОСТОЯНИЕ ЗАГРУЗКИ
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0 && !isOrdered) {
      router.push("/");
    }
  }, [items, isOrdered, router]);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Подготавливаем данные для базы
    const orderData = {
      customerName: formData.get("fullName") as string,
      customerEmail: formData.get("email") as string,
      customerAddress: formData.get("address") as string,
    };

    try {
      const result = await createOrder(orderData);

      if (result.success) {
        setIsOrdered(true);
        clearCart();
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error) {
      alert("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
          ✓
        </div>
        <h1 className="text-4xl font-black mb-2">Thank you!</h1>
        <p className="text-gray-500 mb-8">Your order has been placed successfully.</p>
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-10 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Side: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-400">Full Name</label>
                  <input 
                    name="fullName" // ДОБАВИЛИ NAME
                    required 
                    type="text" 
                    placeholder="John Doe" 
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-400">Email Address</label>
                  <input 
                    name="email" // ДОБАВИЛИ NAME
                    required 
                    type="email" 
                    placeholder="john@example.com" 
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors" 
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-400">Shipping Address</label>
                  <input 
                    name="address" // ДОБАВИЛИ NAME
                    required 
                    type="text" 
                    placeholder="123 Street Name, City" 
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-black outline-none transition-colors" 
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold mt-10 mb-6">Payment Method</h2>
              <div className="p-4 border-2 border-black rounded-2xl flex items-center justify-between bg-gray-50">
                <span className="font-bold">Cash on Delivery</span>
                <span className="text-xl font-black">💵</span>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} // ДИЗЕЙБЛИМ КНОПКУ
                className="w-full mt-10 bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 disabled:bg-gray-400"
              >
                {isSubmitting ? "Processing..." : `Place Order — $${totalPrice().toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Right Side: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="flex flex-col gap-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold">{item.name}</span>
                        <span className="text-gray-500">{item.quantity} x ${item.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-600">Total</span>
                <span className="font-black text-2xl text-black">
                  ${totalPrice().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CheckoutContent), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50" />
});