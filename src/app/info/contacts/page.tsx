import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black tracking-tighter uppercase  mb-12 border-b-4 border-indigo-600 pb-4 inline-block">
          Контактна інформація
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Лева колонка: Зв'язок */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Телефон / Viber</p>
                <a href="tel:+380673681022" className="text-xl font-black hover:text-indigo-600 transition-colors">
                  +38 (067) 368-10-22
                </a>
                <p className="text-sm text-gray-500 mt-2  font-medium">Замовити дзвінок</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <a href="mailto:garnagospodynya@ukr.net" className="text-xl font-black hover:text-indigo-600 transition-colors">
                  garnagospodynya@ukr.net
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Графік роботи</p>
                <p className="font-bold text-gray-700">Пн – Пт: 9:00 – 18:00</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Ми раді прийняти замовлення <span className="font-bold">on-line</span> у робочий час. <br />
                  В інший час — звертайтесь <span className="bg-[#40E0D0] px-2 font-bold ">off-line</span>, ми відповімо найближчим робочим часом.
                </p>
              </div>
            </div>
          </div>

          {/* Права колонка: Адреси */}
          <div className="space-y-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="text-indigo-600 mt-1">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase mb-4">Адреси</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-black text-indigo-400 uppercase mb-1">Офіс та склад у Вінниці:</p>
                    <p className="font-bold text-gray-800 leading-tight">
                      21015 Вінниця, <br />
                      вул. Батозька, буд. 6а
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200/50">
                    <p className="text-xs font-black text-indigo-400 uppercase mb-1">Склад у Харкові:</p>
                    <p className="font-bold text-gray-800 leading-tight">
                      61202 Харків, <br />
                      пров. Весняний, 9
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}