import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus, PaymentMethod } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerData } = body;

    // 1. Валідація вхідних даних
    if (!items || !customerData) {
      return NextResponse.json({ error: "Дані відсутні" }, { status: 400 });
    }

    const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const orderReference = `ORDER_${Date.now()}`;

    // 2. Визначаємо метод оплати (Enum)
    let finalPaymentMethod: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY;
    if (customerData.paymentMethod === "WAYFORPAY") finalPaymentMethod = PaymentMethod.WAYFORPAY;

    // 3. Запис у базу
    const order = await prisma.order.create({
      data: {
        id: orderReference,
        customerName: String(customerData.name),
        customerEmail: String(customerData.email),
        customerAddress: String(customerData.address),
        totalAmount: totalAmount,
        status: OrderStatus.NEW,
        paymentMethod: finalPaymentMethod,
        isPaid: false,
        // userId залишаємо пустим (null), як у успішному деплої
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
    });

    // 4. Логіка відповіді
    if (finalPaymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Для WayForPay (якщо обрано)
    const orderDate = Math.floor(Date.now() / 1000);
    const WAYFORPAY_LOGIN = process.env.WAYFORPAY_MERCHANT_LOGIN || "";
    const WAYFORPAY_KEY = process.env.WAYFORPAY_SECRET_KEY || "";
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const domain = SITE_URL.replace(/^https?:\/\//, "");

    const signatureString = [
      WAYFORPAY_LOGIN, domain, orderReference, orderDate, totalAmount, "UAH",
      items.map((i: any) => i.name).join(";"),
      items.map((i: any) => i.quantity).join(";"),
      items.map((i: any) => i.price).join(";")
    ].join(";");

    const signature = crypto.createHmac("md5", WAYFORPAY_KEY).update(signatureString, "utf8").digest("hex");

    return NextResponse.json({
      merchantAccount: WAYFORPAY_LOGIN,
      merchantDomainName: domain,
      merchantSignature: signature,
      orderReference,
      orderDate,
      amount: totalAmount,
      productName: items.map((i: any) => i.name),
      productCount: items.map((i: any) => i.quantity),
      productPrice: items.map((i: any) => i.price),
      serviceUrl: `${SITE_URL}/api/callback/wayforpay`,
    });

  } catch (error: any) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}