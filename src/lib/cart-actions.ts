'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function syncCartWithDb(items: any[]) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // Используем транзакцию, чтобы данные были согласованы
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      prisma.cartItem.createMany({
        data: items.map(item => ({
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity,
        })),
      }),
    ]);
  } catch (error) {
    console.error("Failed to sync cart:", error);
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

    if (!cart) return null;

    return cart.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      quantity: item.quantity
    }));
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}