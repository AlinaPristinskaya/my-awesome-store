export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-8 border-b-4 border-indigo-600 pb-4 inline-block">
          Політика конфіденційності
        </h1>

        <div className="space-y-10 text-gray-800 font-medium leading-relaxed">
          <p>
            Ми піклуємося про ваші персональні дані. Ця Політика конфіденційності розроблена відповідно до Закону України 
            <a 
              href="https://zakon.rada.gov.ua/laws/show/2297-17#Text" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 underline font-bold ml-1 hover:text-indigo-800 transition-colors"
            >
              «Про захист персональних даних»
            </a>.
          </p>

          {/* Збір даних */}
          <section>
            <h2 className="bg-[#40E0D0] text-black px-4 py-1 inline-block font-black uppercase mb-4 text-sm">
              1. Яку інформацію ми збираємо
            </h2>
            <p className="mb-4">Для виконання замовлення та якісного обслуговування ми збираємо наступні дані:</p>
            <ul className="space-y-2 list-none">
              <li>— Прізвище, ім'я та по батькові покупця;</li>
              <li>— Контактний номер телефону;</li>
              <li>— Адреса доставки (місто, номер відділення пошти або адреса);</li>
              <li>— Електронна адреса (за бажанням) для відстеження статусу замовлення.</li>
            </ul>
          </section>

          {/* Мета використання */}
          <section>
            <h2 className="bg-[#40E0D0] text-black px-4 py-1 inline-block font-black uppercase mb-4 text-sm">
              2. Мета обробки даних
            </h2>
            <p>Ваші персональні дані використовуються виключно для:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Обробки та відправлення вашого замовлення;</li>
              <li>Надання консультацій та підтримки клієнтів;</li>
              <li>Інформування про статус замовлення через SMS або месенджери.</li>
            </ul>
          </section>

          {/* Передача третім особам */}
          <section>
            <h2 className="bg-[#40E0D0] text-black px-4 py-1 inline-block font-black uppercase mb-4 text-sm">
              3. Передача даних третім особам
            </h2>
            <p>
              Ми не передаємо ваші дані стороннім організаціям, за винятком випадків, необхідних для виконання замовлення. 
              Це включає служби доставки (Нова Пошта, Укрпошта) та платіжні системи (LiqPay, WayForPay).
            </p>
          </section>

          {/* Захист даних */}
          <section>
            <h2 className="bg-[#40E0D0] text-black px-4 py-1 inline-block font-black uppercase mb-4 text-sm">
              4. Захист персональних даних
            </h2>
            <p>
              Ми вживаємо всіх необхідних технічних заходів для захисту вашої інформації від несанкціонованого доступу. 
              Ваш доступ до персональних даних та введення платіжних реквізитів на сайті захищені сучасними протоколами шифрування.
            </p>
          </section>

          {/* Права користувача */}
          <section>
            <h2 className="bg-[#40E0D0] text-black px-4 py-1 inline-block font-black uppercase mb-4 text-sm">
              5. Права користувача
            </h2>
            <p>Ви маєте право отримати доступ до своїх персональних даних, змінити їх або вимагати їх видалення з нашої бази. Для цього ви можете звернутися до нас за контактами, вказаними на сайті.</p>
          </section>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-sm text-gray-500">
            Здійснюючи покупку на сайті https://garnagospodynya.com.ua, ви автоматично погоджуєтеся з умовами цієї Політики конфіденційності.
          </div>
        </div>
      </div>
    </div>
  );
}