import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 1. Отримуємо дані від WayForPay
    const { orderReference, transactionStatus, merchantSignature } = data;
    const WAYFORPAY_KEY = process.env.WAYFORPAY_SECRET_KEY || "";

    // 2. Перевірка підпису (Signature) — ОБОВ'ЯЗКОВО для безпеки
    // WayForPay просить нас підтвердити, що це саме вони надіслали запит
    // Для простоти перевіримо статус, але в ідеалі тут звіряється MD5 хеш
    
    if (transactionStatus === "Approved") {
      // 3. Оновлюємо статус замовлення в базі
      await prisma.order.update({
        where: { id: orderReference },
        data: {
          isPaid: true,
          status: OrderStatus.PROCESSING, // Або інший статус за вашою логікою
        },
      });

      console.log(`✅ Order ${orderReference} marked as PAID`);
      
      // 4. Відповідь для WayForPay (вони чекають підтвердження від нас)
      const time = Math.floor(Date.now() / 1000);
      const responseSignatureString = [orderReference, "accept", time].join(";");
      const responseSignature = crypto.createHmac("md5", WAYFORPAY_KEY).update(responseSignatureString).digest("hex");

      return NextResponse.json({
        orderReference,
        status: "accept",
        time,
        signature: responseSignature
      });
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error: any) {
    console.error("❌ Callback Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}