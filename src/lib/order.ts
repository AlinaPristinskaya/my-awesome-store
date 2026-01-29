"use server";

import { prisma } from "@/lib/prisma";

// Чітко визначаємо, що повертає функція
export type OrderResponse = {
  success: boolean;
  orderId?: string;
  error?: string;
  paymentData?: any;
};

export async function createOrder(data: any): Promise<OrderResponse> {
  console.log("--- СЕРВЕР: Початок створення замовлення ---");

  try {
    // 1. Перевірка даних
    if (!data.phone) {
      throw new Error("Телефон є обов'язковим полем");
    }

    // 2. Зберігаємо в базу Prisma/Neon
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName || "Гість",
        customerEmail: data.customerEmail || "",
        customerAddress: data.customerAddress || "Не вказано",
        paymentMethod: data.paymentMethod,
        totalAmount: data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
        items: {
          create: data.items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    console.log("✅ База даних: Замовлення збережено під ID:", order.id);

    // 3. TELEGRAM сповіщення
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Логування для діагностики (тільки в терміналі сервера)
    console.log("🤖 Перевірка Telegram ключів:");
    console.log("- Token:", botToken ? "Знайдено (OK)" : "ВІДСУТНІЙ (Помилка)");
    console.log("- Chat ID:", chatId ? "Знайдено (OK)" : "ВІДСУТНІЙ (Помилка)");

    if (botToken && chatId) {
      const message = `
🚀 *НОВЕ ЗАМОВЛЕННЯ #${order.id.toString().slice(-5)}*
---------------------------
👤 *Клієнт:* ${data.customerName}
📞 *Тел:* ${data.phone}
📍 *Доставка:* ${data.customerAddress}
💳 *Оплата:* ${data.paymentMethod === 'WAYFORPAY' ? '💳 Картка' : '💵 Післяплата'}
💰 *Сума:* ${order.totalAmount} грн

📦 *Товари:*
${data.items.map((i: any) => `• ${i.name} — ${i.quantity} шт.`).join('\n')}
---------------------------
🕒 ${new Date().toLocaleString('uk-UA')}
      `;

      const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const tgResult = await tgResponse.json();
      if (tgResult.ok) {
        console.log("📱 Telegram: Повідомлення успішно надіслано!");
      } else {
        console.error("❌ Telegram API Error:", tgResult.description);
      }
    }

    return { 
      success: true, 
      orderId: order.id, 
      paymentData: null 
    };

  } catch (error: any) {
    console.error("❌ КРИТИЧНА ПОМИЛКА НА СЕРВЕРІ:", error.message);
    return { 
      success: false, 
      error: error.message || "Сталася помилка на сервері" 
    };
  }
}