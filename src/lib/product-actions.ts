'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function createProduct(formData: FormData) {
  const session = await auth();
  
  // Проверка прав (твой подтвержденный email)
  if (session?.user?.email?.toLowerCase() !== "pristinskayaalina9@gmail.com") {
    throw new Error("Unauthorized");
  }

  // Извлекаем данные и ПРИВОДИМ ИХ К НУЖНЫМ ТИПАМ
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string); // Строка -> Число с плавающей точкой
  const stock = parseInt(formData.get("stock") as string);   // Строка -> Целое число
  const categoryId = formData.get("categoryId") as string;
  const imageUrl = formData.get("imageUrl") as string;

  // Проверка на заполненность (чтобы не отправить пустые данные)
  if (!name || !description || isNaN(price) || !categoryId || !imageUrl) {
    throw new Error("Missing required fields");
  }

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        images: [imageUrl], // Prisma ждет массив строк
      },
    });
  } catch (error) {
    console.error("Prisma Error:", error);
    throw new Error("Failed to create product in database");
  }

  revalidatePath("/");
  redirect("/"); 
}
export async function deleteProduct(productId: string) {
  const session = await auth();
  
  if (session?.user?.email?.toLowerCase() !== "pristinskayaalina9@gmail.com") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });
    
    revalidatePath("/"); // Обновляем главную, чтобы товар исчез
  } catch (error) {
    console.error("Delete Error:", error);
    throw new Error("Failed to delete product");
  }
}