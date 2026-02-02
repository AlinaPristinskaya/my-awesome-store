import Image from "next/image";

export default function ShippingAndPaymentPage() {
  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-20 font-sans">
      <div className="max-w-4xl mx-auto">
       

        <div className="space-y-16">
          {/* СЕКЦІЯ ОПЛАТИ */}
          <section className="space-y-10">
            <h1 className="text-lg font-bold">Оплата замовлення можлива наступними способами</h1>

            {/* LiqPay */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Онлайн-оплата банківською картою</h2>
              <div className="flex items-center gap-4">
                 {/* Місце для твоєї іконки LiqPay */}
                <img src="/icons/liqpay.png" alt="LiqPay" className="h-10 object-contain" />
              </div>
              <div className="text-gray-700 space-y-2 leading-relaxed">
                <p>Оплата через платіжну систему LiqPay.</p>
                <p>LiqPay - це web-інтерфейс ПриватБанку, за допомогою якого Ви можете оплатити замовлення на нашому сайті з карт Mastercard/VISA.</p>
                <p className="font-semibold text-black">Обираючи цей спосіб оплати Ви отримаєте своє замовлення максимально швидко, адже ми не будемо гаяти час на дзвінки і погодження, упакуємо і відправимо у найкоротші терміни.</p>
              </div>
            </div>

            {/* WayForPay */}
            <div className="space-y-4 pt-6">
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Онлайн-оплата банківською картою</h2>
              <div className="flex items-center gap-4">
                {/* Місце для твоєї іконки WayForPay */}
                <img src="/icons/wayforpay.png" alt="WayForPay" className="h-10 object-contain" />
              </div>
              <div className="text-gray-700 space-y-2 leading-relaxed">
                <p>Оплата через платіжну систему Way for Pay.</p>
                <p>Way for Pay - дає змогу оплатити замовлення на нашому сайті платіжним способом VISA, Google Pay, Apple Pay.</p>
                <p className="font-semibold text-black">Обираючи цей спосіб оплати Ви отримаєте своє замовлення максимально швидко, адже ми не будемо гаяти час на дзвінки і погодження, упакуємо і відправимо у найкоротші терміни.</p>
              </div>
            </div>

            {/* IBAN */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <img src="/icons/doc.jpeg" alt="IBAN" className="w-8 h-8" />
                <h2 className="text-xl font-extrabold uppercase tracking-tight">Безготівковий розрахунок ( IBAN)</h2>
              </div>
              <div className="text-gray-700 space-y-2 leading-relaxed">
                <p>Ви зможете оплатити замовлення зі свого розрахункового, карткового рахунку або у відділенні банку за реквізитами:</p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 font-mono text-sm space-y-1">
                  <p><strong>IBAN:</strong> UA863052990000026005025916401</p>
                  <p><strong>КОД / ЄДРПОУ:</strong> 3029712617</p>
                  <p><strong>Отримувач:</strong> ФОП Птишник О.В.</p>
                </div>
              </div>
            </div>

            {/* Післяплата */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <img src="/icons/wallet.png" alt="Післяплата" className="w-8 h-8" />
                <h2 className="text-xl font-extrabold uppercase tracking-tight">Післяплата</h2>
              </div>
              <div className="text-gray-700 space-y-2 leading-relaxed">
                <p>Цей спосіб оплати можливий тільки для замовлень загальною сумою більше 300 грн.</p>
                <p>Для підтвердження замовлення менеджер зателефонує Вам. Без підтвердження замовлення не відправляються.</p>
                <p className="text-rose-600 font-bold">
                  Повинні звернути Вашу увагу на те, що Нова пошта стягує з клієнта комісію за цю послугу в розмірі 20 грн + 2% від суми післяплати.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}