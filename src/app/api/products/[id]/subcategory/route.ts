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
    // Перевірка на адміна (твій email)
    if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { subCategoryId } = await req.json();

    // Оновлюємо товар у базі
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: { 
        subCategoryId: subCategoryId ? subCategoryId : null 
      }
    });

    // 2. ЦІ РЯДКИ ПЕРЕЗАВАНТАЖУЮТЬ КЕШ МИТТЄВО
    revalidatePath("/"); // Оновлює головну сторінку
    revalidatePath("/admin/products"); // Оновлює список в адмінці

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("API Error:", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}