import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// РЕДАГУВАННЯ
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Тепер це Promise
) {
  try {
    // ВАЖЛИВО: У Next.js 15 params треба розпаковувати через await
    const { id } = await params; 
    const { name } = await req.json();

    console.log(`LOG: Спроба оновити підкатегорію ${id} на назву ${name}`);

    const updated = await prisma.subCategory.update({
      where: { id: id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("🔥 PATCH ERROR:", error.message);
    return NextResponse.json({ error: "Не вдалося оновити назву" }, { status: 500 });
  }
}

// ВИДАЛЕННЯ
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Тепер це Promise
) {
  try {
    const { id } = await params; // Розпаковуємо тут теж
    console.log(`LOG: Спроба видалення ID: ${id}`);

    // Перевіряємо наявність товарів
    const productsWithThisSub = await prisma.product.findFirst({
      where: { subCategoryId: id }
    });

    if (productsWithThisSub) {
      return NextResponse.json(
        { error: "У цій категорії є товари! Видалення заборонено." }, 
        { status: 400 }
      );
    }

    await prisma.subCategory.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Успішно видалено" });
  } catch (error: any) {
    console.error("🔥 DELETE ERROR:", error.message);
    return NextResponse.json({ error: "Помилка при видаленні з бази" }, { status: 500 });
  }
}