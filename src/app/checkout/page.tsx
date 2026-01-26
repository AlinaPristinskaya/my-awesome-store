"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createOrder } from "@/lib/order";
import { getNPCities, getNPWarehouses } from "@/lib/shipping-actions";
import { MapPin, Building2, Package, Loader2, ChevronDown, X } from "lucide-react";

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Состояния доставки
  const [deliveryService, setDeliveryService] = useState<'NP' | 'UP'>('NP');
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [selectedCity, setSelectedCity] = useState<{label: string, value: string} | null>(null);
  const [warehouses, setWarehouses] = useState<{label: string, value: string}[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showWarehouseList, setShowWarehouseList] = useState(false);
  
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  // Расчет веса
  const totalWeight = useMemo(() => {
    return items.reduce((acc, item: any) => acc + (item.weight || 0.5) * item.quantity, 0);
  }, [items]);

  // Поиск городов
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (citySearch.length >= 2 && !selectedCity) {
        setIsLoadingCities(true);
        try {
          const results = await getNPCities(citySearch);
          setCities(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingCities(false);
        }
      } else if (citySearch.length < 2) {
        setCities([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [citySearch, selectedCity]);

  // Загрузка отделений
  useEffect(() => {
    async function loadWarehouses() {
      if (selectedCity && deliveryService === 'NP') {
        setIsLoadingWarehouses(true);
        try {
          const results = await getNPWarehouses(selectedCity.value, totalWeight);
          setWarehouses(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingWarehouses(false);
        }
      }
    }
    loadWarehouses();
  }, [selectedCity, deliveryService, totalWeight]);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (deliveryService === 'NP' && (!selectedCity || !selectedWarehouse)) {
      alert("Будь ласка, оберіть місто та відділення");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const fullAddress = deliveryService === 'NP' 
      ? `НП: ${selectedCity?.label}, ${selectedWarehouse}`
      : `УП: ${formData.get("address")}`;

    try {
      const result = await createOrder({
        customerName: formData.get("fullName") as string,
        customerEmail: formData.get("email") as string,
        customerAddress: fullAddress,
      });

      if (result.success) {
        setIsOrdered(true);
        clearCart();
      }
    } catch (error) {
      alert("Помилка при створенні замовлення");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6">✓</div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">ДЯКУЄМО!</h1>
        <p className="text-gray-500 mb-8 font-bold">Ваше замовлення успішно оформлено.</p>
        <Link href="/" className="bg-black text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-widest text-xs">
          На головну
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-10 tracking-tighter">Оформлення</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* Блок 1: Контакты */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-6 h-6 bg-black text-white text-[10px] rounded-full flex items-center justify-center">1</span>
                  Контактні дані
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="fullName" required placeholder="ПІБ" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none font-bold text-sm" />
                  <input name="email" required type="email" placeholder="Email" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none font-bold text-sm" />
                </div>
              </div>

              {/* Блок 2: Доставка */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-visible">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-6 h-6 bg-black text-white text-[10px] rounded-full flex items-center justify-center">2</span>
                  Доставка
                </h2>

                <div className="flex gap-4 mb-8">
                  <button type="button" onClick={() => setDeliveryService('NP')} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all text-xs uppercase ${deliveryService === 'NP' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>Нова Пошта</button>
                  <button type="button" onClick={() => setDeliveryService('UP')} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all text-xs uppercase ${deliveryService === 'UP' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>Укрпошта</button>
                </div>

                {deliveryService === 'NP' ? (
                  <div className="space-y-4 relative">
                    {/* Выбор Города */}
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input 
                        value={selectedCity ? selectedCity.label : citySearch}
                        onChange={(e) => {setCitySearch(e.target.value); setSelectedCity(null); setSelectedWarehouse('');}}
                        placeholder="Введіть місто (напр. Вінниця)..." 
                        className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none font-bold text-sm"
                      />
                      {selectedCity && (
                        <button onClick={() => {setSelectedCity(null); setCitySearch('');}} className="absolute right-4 top-4 text-gray-400 hover:text-black">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      {isLoadingCities && <Loader2 className="absolute right-12 top-4 w-5 h-5 animate-spin text-gray-400" />}
                      
                      {cities.length > 0 && !selectedCity && (
                        <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto p-2">
                          {cities.map((c) => (
                            <button key={c.value} type="button" onClick={() => {setSelectedCity(c); setCities([]);}} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl font-bold text-[11px] transition-colors border-b border-gray-50 last:border-0">{c.label}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Выбор Отделения */}
                    <div className="relative">
                      <Building2 className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        disabled={!selectedCity || isLoadingWarehouses}
                        onClick={() => setShowWarehouseList(!showWarehouseList)}
                        className="w-full p-4 pl-12 pr-10 bg-gray-50 rounded-2xl text-left font-bold text-[11px] min-h-[56px] disabled:opacity-50 relative"
                      >
                        <span className="block truncate">
                          {isLoadingWarehouses ? "Завантаження..." : selectedWarehouse || "Оберіть відділення"}
                        </span>
                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </button>

                      {!selectedWarehouse && selectedCity && warehouses.length > 0 && showWarehouseList && (
                        <div className="absolute z-[50] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto p-2 shadow-indigo-100/50">
                           <div className="p-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Доступні варіанти</div>
                          {warehouses.map((w) => (
                            <button 
                              key={w.value} 
                              type="button" 
                              onClick={() => {setSelectedWarehouse(w.label); setShowWarehouseList(false);}} 
                              className="w-full text-left p-3 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-[10px] leading-tight transition-colors border-b border-gray-50 last:border-0"
                            >
                              {w.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <input name="address" required placeholder="Область, Місто, Відділення..." className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-sm" />
                )}
              </div>

              {/* Кнопка заказа */}
              <button disabled={isSubmitting} className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:bg-gray-300 shadow-xl shadow-gray-200 uppercase tracking-tighter">
                {isSubmitting ? "Хвилинку..." : `Замовити — $${totalPrice().toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Сайдбар */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" /> Кошик
              </h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-[11px] font-bold">
                    <span className="text-gray-500">{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-black text-2xl uppercase tracking-tighter">Разом</span>
                  <span className="font-black text-3xl text-indigo-600">${totalPrice().toLocaleString()}</span>
                </div>
                <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest">
                  Вага замовлення: {totalWeight.toFixed(2)} кг
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CheckoutContent), { ssr: false });