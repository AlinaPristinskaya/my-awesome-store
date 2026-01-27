import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-emerald-50 p-6 rounded-full mb-6">
        <CheckCircle2 className="w-20 h-20 text-emerald-500" />
      </div>
      <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">Оплата успішна!</h1>
      <p className="text-gray-500 mb-8 max-w-md font-medium">
        Дякуємо за замовлення. Ми вже почали його готувати. Ви отримаєте сповіщення, коли посилка буде відправлена.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="bg-black text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Продовжити покупки
        </Link>
      </div>
    </div>
  );
}