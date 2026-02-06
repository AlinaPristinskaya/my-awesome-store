"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateWayForPaySignature, WAYFORPAY_CONFIG } from "./wayforpay";

export type OrderResponse = {
  success: boolean;
  orderId?: string;
  error?: string;
  paymentData?: any;
};

export async function createOrder(data: any): Promise<OrderResponse> {
  const session = await auth();
  console.log("--- СЕРВЕР: Початок створення замовлення ---");

  try {
    const totalAmount = data.items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );

    // 1. СТВОРЕННЯ ЗАМОВЛЕННЯ В БАЗІ ДАНИХ
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        customerName: String(data.customerName),
        customerEmail: String(data.customerEmail),
        customerAddress: String(data.customerAddress),
        totalAmount: Number(totalAmount),
        status: "NEW", 
        paymentMethod: data.paymentMethod,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
    });

    // 2. Очищення кошика в БД (якщо користувач залогінений)
    if (session?.user?.id) {
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: session.user.id } }
      }).catch((e) => console.error("Помилка очищення кошика:", e));
    }

    // 3. ВІДПРАВКА В TELEGRAM
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const itemsList = data.items
        .map((item: any) => `• ${item.name} (x${item.quantity}) — ${item.price} грн`)
        .join("\n");

      const tgMessage = 
        `🛍 <b>НОВЕ ЗАМОВЛЕННЯ #${order.id.slice(-6).toUpperCase()}</b>\n\n` +
        `👤 <b>Клієнт:</b> ${data.customerName}\n` +
        `📞 <b>Телефон:</b> <code>${data.phone}</code>\n` +
        `📍 <b>Адреса:</b> ${data.customerAddress}\n` +
        `💳 <b>Оплата:</b> ${data.paymentMethod}\n\n` +
        `🛒 <b>Товари:</b>\n${itemsList}\n\n` +
        `💰 <b>ЗАГАЛЬНА СУМА: ${totalAmount} грн</b>`;

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgMessage,
            parse_mode: "HTML",
          }),
        });
        console.log("✅ Сповіщення в Telegram надіслано");
      } catch (tgErr) {
        console.error("❌ Помилка Telegram API:", tgErr);
      }
    } else {
      console.warn("⚠️ Telegram змінні оточення не налаштовані!");
    }

    // 4. ЛОГІКА WAYFORPAY
    if (data.paymentMethod === 'WAYFORPAY') {
      const orderDate = Math.floor(Date.now() / 1000);
      const orderReference = order.id; 

      const productNames = data.items.map((i: any) => i.name);
      const productPrices = data.items.map((i: any) => i.price);
      const productCounts = data.items.map((i: any) => i.quantity);

      const signatureData = [
        WAYFORPAY_CONFIG.merchantAccount,
        WAYFORPAY_CONFIG.merchantDomainName,
        orderReference,
        orderDate,
        totalAmount,
        'UAH',
        ...productNames,
        ...productCounts,
        ...productPrices
      ];

      const signature = generateWayForPaySignature(signatureData, WAYFORPAY_CONFIG.merchantSecretKey);

      const paymentData = {
        merchantAccount: WAYFORPAY_CONFIG.merchantAccount,
        merchantDomainName: WAYFORPAY_CONFIG.merchantDomainName,
        merchantSignature: signature,
        orderReference: orderReference,
        orderDate: orderDate,
        amount: totalAmount,
        currency: 'UAH',
        productName: productNames,
        productPrice: productPrices,
        productCount: productCounts,
        clientFirstName: data.customerName.split(' ')[1] || "Клієнт",
        clientLastName: data.customerName.split(' ')[0] || "",
        clientPhone: data.phone,
        returnUrl: `${WAYFORPAY_CONFIG.merchantDomainName}/api/payment-callback`,
        serviceUrl: WAYFORPAY_CONFIG.serviceUrl,
      };

      return { success: true, orderId: order.id, paymentData };
    }

    // Для післяплати або інших методів
    return { success: true, orderId: order.id };

  } catch (error: any) {
    console.error("❌ ПОМИЛКА СЕРВЕРА:", error);
    return { success: false, error: error.message };
  }
}
// Функція-заглушка для успішного білду (використовується в адмінці замовлень)

export async function updateOrderStatus(orderId: string, newStatus: any) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any }, // Додаємо as any тут
    });
    return { success: true, order: updatedOrder };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}