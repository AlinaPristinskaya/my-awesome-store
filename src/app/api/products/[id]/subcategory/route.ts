import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache"; // 1. Імпортуємо інструмент очищення кешу

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params; // Обов'язково await для Next.js 15

    // Гнучка перевірка: або роль ADMIN, або твій особистий email
    const isAdmin = 
      (session?.user as any)?.role === "ADMIN" || 
      session?.user?.email === "pristinskayaalina9@gmail.com";
    
    if (!isAdmin) {
      console.log("Відмова у доступі для:", session?.user?.email); // Для відладки в логах Vercel
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subCategoryId } = await req.json();

    const product = await prisma.product.update({
      where: { id: id },
      data: { 
        subCategoryId: subCategoryId || null 
      }
    });

    // Оновлюємо кеш
    revalidatePath("/admin/products");
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Subcategory Update Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}