"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { createOrder, OrderResponse } from "@/lib/order";
import { getNPCities, getNPWarehouses } from "@/lib/shipping-actions";
import { 
  MapPin, Building2, Package, Loader2, ChevronDown, 
  CheckCircle2, CreditCard, Banknote, Landmark, FileText, Copy
} from "lucide-react";

// Типи способів оплати
type PaymentMethod = 'WAYFORPAY' | 'MONOPAY' | 'CASH_ON_DELIVERY' | 'INVOICE' | 'IBAN';

// Реквізити для IBAN
const IBAN_DETAILS = {
  account: "UA000000000000000000000000000", 
  recipient: "ФОП ПРИСТИНСЬКА",
  purpose: "Оплата за замовлення"
};

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethod | null>(null);
  
  const [paymentType, setPaymentType] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [deliveryService, setDeliveryService] = useState<'NP' | 'UP'>('NP');
  
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [selectedCity, setSelectedCity] = useState<{label: string, value: string} | null>(null);
  const [warehouses, setWarehouses] = useState<{label: string, value: string}[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showWarehouseList, setShowWarehouseList] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  const totalWeight = useMemo(() => items.reduce((acc, i) => acc + ((i as any).weight || 0.5) * i.quantity, 0), [items]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(IBAN_DETAILS.account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const currentMethod = paymentType; // Фіксуємо метод перед відправкою

    const fullAddress = deliveryService === 'NP' && selectedCity 
      ? `НП: ${selectedCity.label}, ${selectedWarehouse || 'Не вказано'}`
      : `УП: ${formData.get("address") || 'Не вказано'}`;

    const orderData = {
      customerName: `${formData.get("lastName")} ${formData.get("firstName")}`.trim(),
      phone: formData.get("phone") as string,
      customerEmail: formData.get("email") as string || "",
      customerAddress: fullAddress,
      paymentMethod: currentMethod,
      companyName: formData.get("companyName") as string || "",
      edrpou: formData.get("edrpou") as string || "",
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
    };

    try {
      const result = await (createOrder(orderData) as Promise<OrderResponse>);

      if (result.success) {
        if (result.paymentData && currentMethod === 'WAYFORPAY') {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://secure.wayforpay.com/pay';
          form.acceptCharset = 'utf-8';

          const pData = result.paymentData as Record<string, any>;
          Object.entries(pData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((val) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = `${key}[]`;
                input.value = String(val);
                form.appendChild(input);
              });
            } else {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value !== null && value !== undefined ? String(value) : '';
              form.appendChild(input);
            }
          });
          document.body.appendChild(form);
          form.submit();
          return; 
        }

        // Для інших методів (IBAN, COD):
        setLastPaymentMethod(currentMethod);
        clearCart();
        setIsOrdered(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(`Помилка: ${result.error}`);
      }
    } catch (err) {
      console.error("Критична помилка замовлення:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Екран успіху
  if (isOrdered) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white text-black">
      <CheckCircle2 className="w-20 h-20 text-indigo-600 mb-6" />
      <h1 className="text-4xl font-black uppercase">Дякуємо!</h1>
      <p className="text-gray-500 mb-6 font-bold uppercase text-[10px]">Ваше замовлення успішно прийнято.</p>
      
      {lastPaymentMethod === 'IBAN' && (
        <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-100 mb-8 max-w-md w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2 text-indigo-600">
            <Landmark className="w-4 h-4" /> Реквізити для оплати (IBAN)
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase">Отримувач</p>
              <p className="font-bold text-sm uppercase">{IBAN_DETAILS.recipient}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase">Рахунок IBAN</p>
              <div 
                onClick={copyToClipboard}
                className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all group"
              >
                <p className="font-black text-[11px] break-all pr-2 tracking-tighter">{IBAN_DETAILS.account}</p>
                <div className="shrink-0 bg-gray-50 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />}
                </div>
              </div>
              {copied && <p className="text-[10px] text-green-500 font-bold mt-1 text-center">Скопійовано!</p>}
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 font-bold leading-tight uppercase">
                * Будь ласка, вкажіть ваше Прізвище в призначенні платежу.
              </p>
            </div>
          </div>
        </div>
      )}

      <Link href="/" className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
        На головну
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-10">Оформлення</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black mb-6 uppercase">1. Контакти</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input name="lastName" required placeholder="Прізвище" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                  <input name="firstName" required placeholder="Ім'я" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                </div>
                <input name="phone" required type="tel" placeholder="Телефон * (Обов'язково)" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-indigo-100 outline-none font-black" />
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black mb-6 uppercase">2. Доставка</h2>
                <div className="flex gap-4 mb-6">
                  {(['NP', 'UP'] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setDeliveryService(type)} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${deliveryService === type ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
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
                      <button type="button" onClick={() => setShowWarehouseList(!showWarehouseList)} className="w-full p-4 pl-12 text-left bg-gray-50 rounded-2xl font-bold min-h-[56px] pr-10">
                        <span className="block truncate">{selectedWarehouse || "Оберіть відділення"}</span>
                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </button>
                      {showWarehouseList && (
                        <div className="absolute z-40 w-full mt-2 bg-white rounded-2xl shadow-xl border p-2 max-h-48 overflow-y-auto">
                          {warehouses.map(w => <button key={w.value} type="button" onClick={() => {setSelectedWarehouse(w.label); setShowWarehouseList(false);}} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl font-bold text-[10px]">{w.label}</button>)}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <input name="address" required placeholder="Адреса (Індекс, область, місто, вулиця)..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                )}
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black mb-6 uppercase">3. Оплата</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button type="button" onClick={() => setPaymentType('CASH_ON_DELIVERY')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'CASH_ON_DELIVERY' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <Banknote /> <div className="text-left"><p className="font-black text-[10px] uppercase">Післяплата</p></div>
                  </button>
                  <button type="button" onClick={() => setPaymentType('MONOPAY')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'MONOPAY' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <CreditCard /> <div className="text-left"><p className="font-black text-[10px] uppercase">MonoPay</p></div>
                  </button>
                  <button type="button" onClick={() => setPaymentType('WAYFORPAY')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'WAYFORPAY' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <CreditCard /> <div className="text-left"><p className="font-black text-[10px] uppercase">WayForPay</p></div>
                  </button>
                  <button type="button" onClick={() => setPaymentType('INVOICE')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'INVOICE' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <FileText /> <div className="text-left"><p className="font-black text-[10px] uppercase">Для юр. осіб</p></div>
                  </button>
                  <button type="button" onClick={() => setPaymentType('IBAN')} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentType === 'IBAN' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    <Landmark /> <div className="text-left"><p className="font-black text-[10px] uppercase">IBAN</p></div>
                  </button>
                </div>

                {paymentType === 'INVOICE' && (
                  <div className="bg-gray-50 p-6 rounded-3xl mb-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input name="companyName" required placeholder="Назва компанії *" className="w-full p-4 bg-white rounded-2xl outline-none font-bold" />
                    <input name="edrpou" required placeholder="ЄДРПОУ *" className="w-full p-4 bg-white rounded-2xl outline-none font-bold" />
                    <input name="email" required type="email" placeholder="E-mail для рахунку *" className="w-full p-4 bg-white rounded-2xl outline-none font-bold border-2 border-indigo-100" />
                  </div>
                )}

                <button type="submit" disabled={isSubmitting || items.length === 0} className="w-full bg-indigo-600 text-white h-20 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : `ПІДТВЕРДИТИ — ${totalPrice()} ГРН`}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 sticky top-24 shadow-sm">
              <h2 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
                <Package className="text-indigo-600" /> Кошик
              </h2>
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                      <p className="text-xs font-bold text-gray-400">{item.quantity} шт. × {item.price} грн</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-400">Всього:</span>
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