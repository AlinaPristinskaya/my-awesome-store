import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-10 pb-6 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Блок 1: Лого та Графік */}
          <div className="space-y-4">
            <h2 className="text-xl font-black italic tracking-tighter text-black">
              Гарна <span className="text-indigo-600">Господиня.</span>
            </h2>
            <div className="text-gray-500 text-xs font-medium space-y-1">
              <p>Ваш затишок — наша турбота.</p>
              <div className="pt-2">
                <p className="text-black font-bold uppercase text-[9px] tracking-widest">Графік роботи:</p>
                <p>Пн – Пт: 9:00 – 18:00</p>
                <p className="opacity-70 italic text-[10px]">Сб – Нд: прийом on-line</p>
              </div>
            </div>
          </div>

          {/* Блок 2: Інформація */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Інформація</h3>
            <ul className="space-y-2">
              <li><Link href="/info/payment" className="text-xs font-bold hover:text-indigo-600 transition-colors">Оплата</Link></li>
              <li><Link href="/info/shipping" className="text-xs font-bold hover:text-indigo-600 transition-colors">Доставка</Link></li>
              <li><Link href="/info/refund" className="text-xs font-bold hover:text-indigo-600 transition-colors">Обмін та повернення</Link></li>
              <li><Link href="/info/oferta" className="text-xs font-bold hover:text-indigo-600 transition-colors">Публічна оферта</Link></li>
            </ul>
          </div>

          {/* Блок 3: Підтримка */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Підтримка</h3>
            <ul className="space-y-2">
              <li><Link href="/info/privacy" className="text-xs font-bold hover:text-indigo-600 transition-colors">Політика конфіденційності</Link></li>
              <li><Link href="/info/contacts" className="text-xs font-bold hover:text-indigo-600 transition-colors">Контакти</Link></li>
            </ul>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="border-t border-gray-200/50 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
            <span>© {currentYear} Гарна Господиня. Всі права захищені.</span>
            <span className="mx-2 hidden md:inline">|</span>
            <span className="block md:inline mt-1 md:mt-0 italic">ФОП Птишник</span>
          </div>
        </div>
      </div>
    </footer>
  );
}