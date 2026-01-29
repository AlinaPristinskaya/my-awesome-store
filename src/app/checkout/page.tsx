"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { createOrder, OrderResponse } from "@/lib/order";
import { getNPCities, getNPWarehouses } from "@/lib/shipping-actions";
import { MapPin, Building2, Package, Loader2, ChevronDown, CheckCircle2, CreditCard, Banknote } from "lucide-react";

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<'WAYFORPAY' | 'CASH_ON_DELIVERY'>('CASH_ON_DELIVERY');
  const [deliveryService, setDeliveryService] = useState<'NP' | 'UP'>('NP');
  
  // Доставка state
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [selectedCity, setSelectedCity] = useState<{label: string, value: string} | null>(null);
  const [warehouses, setWarehouses] = useState<{label: string, value: string}[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showWarehouseList, setShowWarehouseList] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  const totalWeight = useMemo(() => items.reduce((acc, i: any) => acc + (i.weight || 0.5) * i.quantity, 0), [items]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (citySearch.length >= 2 && !selectedCity) {
        setIsLoadingCities(true);
        try { const res = await getNPCities(citySearch); setCities(res); } finally { setIsLoadingCities(false); }
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [citySearch, selectedCity]);

  useEffect(() => {
    if (selectedCity && deliveryService === 'NP') {
      setIsLoadingWarehouses(true);
      getNPWarehouses(selectedCity.value, totalWeight).then(setWarehouses).finally(() => setIsLoadingWarehouses(false));
    }
  }, [selectedCity, deliveryService, totalWeight]);

const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("Кнопка нажата, функция handlePlaceOrder пошла!"); // Это будет в консоли браузера (F12)
  alert("Начинаю отправку заказа..."); // Это выскочит на экране
  
  setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);

    const fullAddress = deliveryService === 'NP' && selectedCity 
      ? `НП: ${selectedCity.label}, ${selectedWarehouse || 'Не вказано'}`
      : `УП: ${formData.get("address") || 'Не вказано'}`;

    const result = await createOrder({
      customerName: `${formData.get("lastName")} ${formData.get("firstName")}`.trim(),
      phone: formData.get("phone") as string,
      customerEmail: formData.get("email") as string || "",
      customerAddress: fullAddress,
      paymentMethod: paymentType,
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
    }) as OrderResponse;

    if (result.success) {
      clearCart();
      setIsOrdered(true);
    } else {
      alert(`Помилка: ${result.error}`);
    }
    setIsSubmitting(false);
  
  };

  if (isOrdered) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle2 className="w-20 h-20 text-indigo-600 mb-6" />
      <h1 className="text-4xl font-black italic uppercase">Дякуємо!</h1>
      <p className="text-gray-500 mb-8 font-bold">Замовлення прийнято.</p>
      <Link href="/" className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">На головну</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-10 italic">Оформлення</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
                <h2 className="text-xl font-black mb-6 italic uppercase">1. Контакти</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input name="lastName" placeholder="Прізвище" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                  <input name="firstName" placeholder="Ім'я" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                </div>
                <input name="phone" required type="tel" placeholder="Телефон * (Обов'язково)" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-indigo-100 outline-none font-black" />
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
                <h2 className="text-xl font-black mb-6 italic uppercase">2. Доставка</h2>
                <div className="flex gap-4 mb-6">
                  {['NP', 'UP'].map((type) => (
                    <button key={type} type="button" onClick={() => setDeliveryService(type as any)} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${deliveryService === type ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                      {type === 'NP' ? 'Нова Пошта' : 'Укрпошта'}
                    </button>
                  ))}
                </div>
                {deliveryService === 'NP' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input value={selectedCity ? selectedCity.label : citySearch} onChange={(e) => {setCitySearch(e.target.value); setSelectedCity(null);}} placeholder="Місто..." className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none font-bold" />
                      {cities.length > 0 && !selectedCity && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border p-2 max-h-48 overflow-y-auto">
                          {cities.map(c => <button key={c.value} type="button" onClick={() => setSelectedCity(c)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl font-bold">{c.label}</button>)}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <button type="button" onClick={() => setShowWarehouseList(!showWarehouseList)} className="w-full p-4 pl-12 text-left bg-gray-50 rounded-2xl font-bold min-h-[56px]">
                        {selectedWarehouse || "Оберіть відділення"}
                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </button>
                      {showWarehouseList && (
                        <div className="absolute z-40 w-full mt-2 bg-white rounded-2xl shadow-xl border p-2 max-h-48 overflow-y-auto">
                          {warehouses.map(w => <button key={w.value} type="button" onClick={() => {setSelectedWarehouse(w.label); setShowWarehouseList(false);}} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl font-bold text-xs">{w.label}</button>)}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <input name="address" placeholder="Адреса доставки..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                )}
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
                <h2 className="text-xl font-black mb-6 italic uppercase">3. Оплата</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button type="button" onClick={() => setPaymentType('CASH_ON_DELIVERY')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'CASH_ON_DELIVERY' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <Banknote /> <p className="font-black text-xs uppercase">Післяплата</p>
                  </button>
                  <button type="button" onClick={() => setPaymentType('WAYFORPAY')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'WAYFORPAY' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <CreditCard /> <p className="font-black text-xs uppercase">Картою</p>
                  </button>
                </div>
                <button type="submit" disabled={isSubmitting || items.length === 0} className="w-full bg-indigo-600 text-white h-20 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : `ПІДТВЕРДИТИ — ${totalPrice()} ГРН`}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 sticky top-24">
              <h2 className="text-xl font-black mb-6 italic uppercase text-indigo-600 flex items-center gap-2">
                <Package className="text-black" /> Кошик
              </h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100">
                      <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase leading-tight">{item.name}</p>
                      <p className="text-xs font-bold text-gray-400">{item.quantity} шт. × {item.price} грн</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t-2 border-dashed border-gray-100">
                <p className="font-black text-2xl">{totalPrice()} грн</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CheckoutContent), { ssr: false });