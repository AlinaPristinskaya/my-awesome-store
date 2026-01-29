"use server";

import { prisma } from "@/lib/prisma";

// Визначаємо типи для відповіді, щоб уникнути помилок в компонентах
export type OrderResponse = {
  success: boolean;
  orderId?: string;
  error?: string;
  paymentData?: any;
};

/**
 * Функція створення нового замовлення
 */
export async function createOrder(data: any): Promise<OrderResponse> {
  console.log("--- СЕРВЕР: Початок створення замовлення ---");

  try {
    // 1. Зберігаємо замовлення в базу даних Neon через Prisma
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName || "Гість",
        customerEmail: data.customerEmail || "",
        customerAddress: data.customerAddress || "Не вказано",
        paymentMethod: data.paymentMethod,
        // Розрахунок суми на сервері для безпеки
        totalAmount: data.items.reduce(
          (acc: number, item: any) => acc + item.price * item.quantity,
          0
        ),
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

    // 2. Відправка сповіщення в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

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

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      console.log("📱 Telegram: Сповіщення надіслано!");
    }

    return { 
      success: true, 
      orderId: order.id 
    };

  } catch (error: any) {
    console.error("❌ ПОМИЛКА СТВОРЕННЯ ЗАМОВЛЕННЯ:", error.message);
    return { 
      success: false, 
      error: error.message || "Сталася помилка на сервері" 
    };
  }
}

/**
 * Функція оновлення статусу замовлення (використовується в адмінці)
 */
export async function updateOrderStatus(orderId: string, status: any) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status 
      },
    });
    
    return { success: true, order: updatedOrder };
  } catch (error: any) {
    console.error("❌ ПОМИЛКА ОНОВЛЕННЯ СТАТУСУ:", error.message);
    return { success: false, error: error.message };
  }
}