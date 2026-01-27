"use server";

import { PrismaClient, OrderStatus, PaymentMethod } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: any[];
  paymentMethod: string;
}) {
  try {
    const totalAmount = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const orderReference = `ORDER_${Date.now()}`;

    // Створюємо замовлення в базі
    const order = await prisma.order.create({
      data: {
        id: orderReference,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        totalAmount: totalAmount,
        status: OrderStatus.NEW,
        paymentMethod: data.paymentMethod as PaymentMethod,
        items: {
          create: data.items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
    });

    // Якщо післяплата - просто повертаємо успіх
    if (data.paymentMethod === "CASH_ON_DELIVERY") {
      return { success: true, orderId: order.id };
    }

    // Якщо WayForPay - готуємо дані для фронтенда (форму)
    const WAYFORPAY_LOGIN = process.env.WAYFORPAY_MERCHANT_LOGIN || "";
    const WAYFORPAY_KEY = process.env.WAYFORPAY_SECRET_KEY || "";
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const domain = SITE_URL.replace(/^https?:\/\//, "");
    const orderDate = Math.floor(Date.now() / 1000);

    const productNames = data.items.map(i => i.name);
    const productCounts = data.items.map(i => i.quantity);
    const productPrices = data.items.map(i => i.price);

    const signatureString = [
      WAYFORPAY_LOGIN, domain, orderReference, orderDate, totalAmount, "UAH",
      productNames.join(";"), productCounts.join(";"), productPrices.join(";")
    ].join(";");

    const signature = crypto.createHmac("md5", WAYFORPAY_KEY).update(signatureString, "utf8").digest("hex");

    return {
      success: true,
      paymentData: {
        merchantAccount: WAYFORPAY_LOGIN,
        merchantDomainName: domain,
        merchantSignature: signature,
        orderReference,
        orderDate,
        amount: totalAmount,
        currency: "UAH",
        productName: productNames,
        productCount: productCounts,
        productPrice: productPrices,
        serviceUrl: `${SITE_URL}/api/callback/wayforpay`,
      }
    };

  } catch (error: any) {
    console.error("Order error:", error);
    return { success: false, error: error.message };
  }
}