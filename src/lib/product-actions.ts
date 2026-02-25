'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const ADMIN_EMAIL = "pristinskayaalina9@gmail.com";

async function checkAuth() {
  const session = await auth();
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
}

export async function createProduct(formData: FormData) {
  await checkAuth();

  // Витягуємо дані
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);
  const categoryId = formData.get("categoryId") as string;
  const subCategoryId = formData.get("subCategoryId") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const isFeatured = formData.get("isFeatured") === "true";
  const isHidden = formData.get("isHidden") === "true";
  const priority = parseInt(formData.get("priority") as string) || 1;

  // Перевірка на заповненість
  if (!name || isNaN(price) || !categoryId) {
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
        subCategoryId: subCategoryId === "none" || !subCategoryId ? null : subCategoryId,
        isFeatured,
        isHidden,
        priority,
        images: imageUrl ? [imageUrl] : [],
      },
    });
  } catch (error) {
    console.error("Prisma Error:", error);
    throw new Error("Failed to create product");
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products"); 
}

export async function updateProduct(productId: string, formData: FormData) {
  await checkAuth();

  try {
    const subId = formData.get("subCategoryId") as string;
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
        categoryId: formData.get("categoryId") as string,
        subCategoryId: subId === "none" || !subId ? null : subId,
        isFeatured: formData.get("isFeatured") === "true",
        isHidden: formData.get("isHidden") === "true",
        priority: parseInt(formData.get("priority") as string) || 1,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Update Error:", error);
    throw new Error("Failed to update product");
  }
}

export async function deleteProduct(productId: string) {
  await checkAuth();
  try {
    await prisma.product.delete({
      where: { id: productId },
    });
    revalidatePath("/");
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Delete Error:", error);
    throw new Error("Failed to delete product");
  }
}