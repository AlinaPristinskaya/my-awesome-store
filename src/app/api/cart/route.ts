import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ГЕТТЕР: Отримуємо товари з бази при завантаженні
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true } // Тягнемо дані про товар (ціна, назва, фото)
        }
      }
    });

    if (!cart) return NextResponse.json([]);

    // Перетворюємо дані під формат нашого Zustand Store
    const formattedItems = cart.items.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      quantity: item.quantity
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// ПОСТЕР: Синхронізуємо локальні товари з базою
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { items } = await req.json();

  try {
    // 1. Шукаємо або створюємо кошик для юзера
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id }
    });

    // 2. Видаляємо старі товари (найпростіший спосіб повної синхронізації)
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // 3. Записуємо нові товари масивом
    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((item: any) => ({
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}