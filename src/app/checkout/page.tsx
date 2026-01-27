"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createOrder } from "@/lib/order"; // Наш оновлений екшн
import { getNPCities, getNPWarehouses } from "@/lib/shipping-actions";
import { MapPin, Building2, Package, Loader2, ChevronDown, X, CheckCircle2, CreditCard, Banknote } from "lucide-react";

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<'WAYFORPAY' | 'CASH_ON_DELIVERY'>('CASH_ON_DELIVERY');

  // Стани доставки
  const [deliveryService, setDeliveryService] = useState<'NP' | 'UP'>('NP');
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [selectedCity, setSelectedCity] = useState<{label: string, value: string} | null>(null);
  const [warehouses, setWarehouses] = useState<{label: string, value: string}[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showWarehouseList, setShowWarehouseList] = useState(false);
  
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  const totalWeight = useMemo(() => {
    return items.reduce((acc, item: any) => acc + (item.weight || 0.5) * item.quantity, 0);
  }, [items]);

  // Пошук міст
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
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [citySearch, selectedCity]);

  // Завантаження відділень
  useEffect(() => {
    if (selectedCity && deliveryService === 'NP') {
      setIsLoadingWarehouses(true);
      getNPWarehouses(selectedCity.value, totalWeight)
        .then(setWarehouses)
        .finally(() => setIsLoadingWarehouses(false));
    }
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
        paymentMethod: paymentType,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      });

      if (result.success) {
        if (paymentType === 'CASH_ON_DELIVERY') {
          clearCart();
          setIsOrdered(true);
        } else if (result.paymentData) {
          // Якщо онлайн оплата — створюємо форму і відправляємо на WayForPay
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "https://secure.wayforpay.com/pay";
          form.acceptCharset = "utf-8";

          Object.entries(result.paymentData).forEach(([key, value]: [string, any]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = Array.isArray(value) ? value.join(";") : value.toString();
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        }
      } else {
        alert(`Помилка: ${result.error}`);
      }
    } catch (error) {
      alert("Відбулася помилка при з'єднанні з сервером");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
        <h1 className="text-4xl font-black mb-2 tracking-tighter">ДЯКУЄМО!</h1>
        <p className="text-gray-500 mb-8 font-bold">Ваше замовлення успішно оформлено.</p>
        <Link href="/" className="bg-black text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-widest text-xs">
          На головну
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-10 tracking-tighter italic">Оформлення</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* 1. Контакти */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-6 h-6 bg-black text-white text-[10px] rounded-full flex items-center justify-center italic">1</span>
                  Контактні дані
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="fullName" required placeholder="ПІБ" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none font-bold text-sm" />
                  <input name="email" required type="email" placeholder="Email" className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none font-bold text-sm" />
                </div>
              </div>

              {/* 2. Доставка */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-6 h-6 bg-black text-white text-[10px] rounded-full flex items-center justify-center italic">2</span>
                  Доставка
                </h2>

                <div className="flex gap-4 mb-8">
                  <button type="button" onClick={() => setDeliveryService('NP')} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all text-xs uppercase ${deliveryService === 'NP' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>Нова Пошта</button>
                  <button type="button" onClick={() => setDeliveryService('UP')} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all text-xs uppercase ${deliveryService === 'UP' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>Укрпошта</button>
                </div>

                {deliveryService === 'NP' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input 
                        value={selectedCity ? selectedCity.label : citySearch}
                        onChange={(e) => {setCitySearch(e.target.value); setSelectedCity(null); setSelectedWarehouse('');}}
                        placeholder="Введіть місто..." 
                        className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none font-bold text-sm"
                      />
                      {isLoadingCities && <Loader2 className="absolute right-4 top-4 w-5 h-5 animate-spin text-gray-400" />}
                      {cities.length > 0 && !selectedCity && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border p-2 max-h-48 overflow-y-auto">
                          {cities.map(c => (
                            <button key={c.value} type="button" onClick={() => setSelectedCity(c)} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl font-bold text-[11px]">{c.label}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Building2 className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowWarehouseList(!showWarehouseList)}
                        className="w-full p-4 pl-12 text-left bg-gray-50 rounded-2xl font-bold text-[11px] min-h-[56px]"
                      >
                        {isLoadingWarehouses ? "Завантаження..." : selectedWarehouse || "Оберіть відділення"}
                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </button>
                      {showWarehouseList && warehouses.length > 0 && (
                        <div className="absolute z-40 w-full mt-2 bg-white rounded-2xl shadow-xl border p-2 max-h-48 overflow-y-auto">
                          {warehouses.map(w => (
                            <button key={w.value} type="button" onClick={() => {setSelectedWarehouse(w.label); setShowWarehouseList(false);}} className="w-full text-left p-3 hover:bg-red-50 rounded-xl font-bold text-[10px]">{w.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <input name="address" required placeholder="Область, Місто, Відділення..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" />
                )}
              </div>

              {/* 3. Оплата */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <span className="w-6 h-6 bg-black text-white text-[10px] rounded-full flex items-center justify-center italic">3</span>
                  Оплата
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentType('CASH_ON_DELIVERY')}
                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'CASH_ON_DELIVERY' ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  >
                    <Banknote />
                    <div className="text-left">
                      <p className="font-black text-xs uppercase">Післяплата</p>
                      <p className="text-[9px] opacity-60">Оплата при отриманні</p>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentType('WAYFORPAY')}
                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'WAYFORPAY' ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                  >
                    <CreditCard />
                    <div className="text-left">
                      <p className="font-black text-xs uppercase">Карткою онлайн</p>
                      <p className="text-[9px] opacity-60">WayForPay (Visa/Mastercard)</p>
                    </div>
                  </button>
                </div>
              </div>

              <button disabled={isSubmitting || items.length === 0} className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:bg-gray-200 uppercase tracking-tighter">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : `Замовити — $${totalPrice()}`}
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
                    <span className="text-gray-400">{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-black text-2xl uppercase tracking-tighter">Разом</span>
                  <span className="font-black text-3xl text-black">${totalPrice()}</span>
                </div>
                <p className="text-[9px] font-black text-gray-300 mt-2 uppercase tracking-widest">
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