'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function syncCartWithDb(items: any[]) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    // 1. Знаходимо або створюємо кошик користувача
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // 2. Видаляємо всі існуючі товари в цьому кошику
    await prisma.cartItem.deleteMany({ 
      where: { cartId: cart.id } 
    });

    // 3. Якщо в кошику є товари, додаємо їх
    if (items && items.length > 0) {
      // Прибираємо дублікати за ID товару, щоб уникнути помилки P2002
      const uniqueItemsMap = new Map();
      items.forEach(item => {
        if (item.id) {
          uniqueItemsMap.set(item.id, item);
        }
      });

      const uniqueItems = Array.from(uniqueItemsMap.values());

      await prisma.cartItem.createMany({
        data: uniqueItems.map(item => ({
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity || 1,
        })),
        skipDuplicates: true, // Додатковий захист Prisma
      });
    }
  } catch (error) {
    console.error("❌ Failed to sync cart:", error);
  }
}

export async function getDbCart() {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || !cart.items) return null;

    // Повертаємо масив товарів у форматі, який очікує ваш Zustand store
    return cart.items
      .filter(item => item.product) // Захист на випадок, якщо товар було видалено з бази
      .map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0] || '', 
        quantity: item.quantity
      }));
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    return null;
  }
}