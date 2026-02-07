import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 mb-12">
          
          {/* Блок 1: Лого - на весь рядок на мобілці */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h2 className="text-2xl font-black tracking-widest text-black uppercase">
              OSELIA<span className="text-indigo-600">.</span>
            </h2>
            <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[200px]">
              Мистецтво бути вдома. Твій простір затишку та натхнення.
            </p>
          </div>

          {/* Блок 2: Графік */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Ми на зв'язку</h3>
            <div className="text-gray-600 text-[11px] font-bold space-y-1 uppercase">
              <p>Пн – Пт: 9:00 – 18:00</p>
              <p className="text-gray-400 italic">Сб – Нд: Online</p>
            </div>
          </div>

          {/* Блок 3: Інформація */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Клієнтам</h3>
            <ul className="space-y-3">
              <li><Link href="/info/payment" className="text-xs font-bold hover:text-indigo-600 transition-colors">Оплата</Link></li>
              <li><Link href="/info/shipping" className="text-xs font-bold hover:text-indigo-600 transition-colors">Доставка</Link></li>
              <li><Link href="/info/refund" className="text-xs font-bold hover:text-indigo-600 transition-colors">Повернення</Link></li>
            </ul>
          </div>

          {/* Блок 4: Документи */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Юридично</h3>
            <ul className="space-y-3">
              <li><Link href="/info/oferta" className="text-xs font-bold hover:text-indigo-600 transition-colors">Оферта</Link></li>
              <li><Link href="/info/privacy" className="text-xs font-bold hover:text-indigo-600 transition-colors">Приватність</Link></li>
              <li><Link href="/info/contacts" className="text-xs font-bold hover:text-indigo-600 transition-colors">Контакти</Link></li>
            </ul>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center md:text-left">
            <span>© {currentYear} OSELIA.UA</span>
            <span className="mx-3 hidden md:inline opacity-30">|</span>
            <span className="block md:inline mt-2 md:mt-0 italic opacity-60">ФОП Птишник</span>
          </div>
          
          <div className="flex gap-4 grayscale opacity-50">
            {/* Тут можна додати іконки Visa/Mastercard */}
            <span className="text-[8px] font-black border border-gray-200 px-2 py-1 rounded">VISA</span>
            <span className="text-[8px] font-black border border-gray-200 px-2 py-1 rounded">MASTERCARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}