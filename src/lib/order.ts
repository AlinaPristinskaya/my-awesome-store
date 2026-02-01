"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // Добавлено для работы с сессией

// Определяем типы для ответа
export type OrderResponse = {
  success: boolean;
  orderId?: string;
  error?: string;
  paymentData?: any;
};

/**
 * Функция создания нового заказа
 */
export async function createOrder(data: any): Promise<OrderResponse> {
  const session = await auth(); // Получаем текущего пользователя
  console.log("--- СЕРВЕР: Начало создания заказа ---");

  try {
    // 1. Сохраняем заказ в базу данных Neon через Prisma
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName || "Гость",
        customerEmail: data.customerEmail || "",
        customerAddress: data.customerAddress || "Не указано",
        paymentMethod: data.paymentMethod,
        // Расчет суммы на сервере для безопасности
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

    console.log("✅ База данных: Заказ сохранен под ID:", order.id);

    // --- ОЧИСТКА КОРЗИНЫ В БД (PRISMA) ---
    // Если пользователь авторизован, удаляем товары из его таблицы CartItem
    if (session?.user?.id) {
      try {
        const userCart = await prisma.cart.findUnique({
          where: { userId: session.user.id }
        });

        if (userCart) {
          await prisma.cartItem.deleteMany({
            where: { cartId: userCart.id }
          });
          console.log("🧹 База данных: Корзина пользователя в БД очищена");
        }
      } catch (cartError) {
        console.error("⚠️ Ошибка при очистке корзины в БД:", cartError);
        // Не прерываем выполнение, так как заказ уже создан
      }
    }

    // 2. Отправка уведомления в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `
🚀 *НОВОЕ ЗАКАЗ #${order.id.toString().slice(-5)}*
---------------------------
👤 *Клиент:* ${data.customerName}
📞 *Тел:* ${data.phone}
📍 *Доставка:* ${data.customerAddress}
💳 *Оплата:* ${data.paymentMethod === 'WAYFORPAY' ? '💳 Карта' : '💵 Наложенный платеж'}
💰 *Сумма:* ${order.totalAmount} грн

📦 *Товары:*
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
      console.log("📱 Telegram: Уведомление отправлено!");
    }

    return { 
      success: true, 
      orderId: order.id 
    };

  } catch (error: any) {
    console.error("❌ ОШИБКА СОЗДАНИЯ ЗАКАЗА:", error.message);
    return { 
      success: false, 
      error: error.message || "Произошла ошибка на сервере" 
    };
  }
}

/**
 * Функция обновления статуса заказа
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
    console.error("❌ ОШИБКА ОБНОВЛЕНИЯ СТАТУСА:", error.message);
    return { success: false, error: error.message };
  }
}