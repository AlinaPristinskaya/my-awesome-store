"use server"

import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
}

export async function createOrder(formData: OrderData) {
  // 1. Получаем сессию
  const session = await auth();
  
  // 2. Успокаиваем TypeScript: проверяем наличие сессии, юзера и его ID
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Нужно авторизоваться, чтобы сделать заказ" };
  }

  try {
    // 3. Находим корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { 
        items: { 
          include: { product: true } 
        } 
      }
    });

    if (!cart || cart.items.length === 0) {
      return { error: "Ваша корзина пуста" };
    }

    // 4. Считаем общую сумму
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // 5. Запускаем транзакцию в базе данных
    const order = await prisma.$transaction(async (tx) => {
      // Создаем запись заказа
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerAddress: formData.customerAddress,
          totalAmount: totalAmount,
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Очищаем корзину пользователя после успешного создания заказа
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // 6. Обновляем кэш страниц, чтобы корзина сразу стала пустой в интерфейсе
    revalidatePath("/cart");
    revalidatePath("/orders");
    
    return { success: true, orderId: order.id };

  } catch (error) {
    console.error("ORDER_CREATION_ERROR:", error);
    return { error: "Произошла ошибка при создании заказа" };
  }
}
// Добавь это в src/lib/order.ts

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth();
  
  // Проверка на админа (по email для надежности)
  if (session?.user?.email !== "alinaprystynska@gmail.com") {
    throw new Error("Access denied");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/orders"); // Чтобы у пользователя тоже обновилось
}