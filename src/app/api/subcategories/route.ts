import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: "Назва та ID категорії обов'язкові" }, { status: 400 });
    }

    const timestamp = Date.now();
    // Створюємо унікальний ID та Slug
    const manualId = `manual-${timestamp}`;
    const slug = `${name.toLowerCase()
      .replace(/[^\w\u0400-\u04FF]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${timestamp}`;

    const newSub = await prisma.subCategory.create({
      data: {
        id: manualId,
        name: name.trim(),
        categoryId: String(categoryId),
        slug: slug,
        priority: 0,
      }
    });

    return NextResponse.json(newSub);
  } catch (error: any) {
    console.error("API POST ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}