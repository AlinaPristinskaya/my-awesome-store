import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// Отримуємо список відео з Cloudinary для випадаючого списку
export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      asset_folder: 'shorts', // Твоя папка в Cloudinary
      max_results: 100
    });
    
    return NextResponse.json(result.resources);
  } catch (error) {
    console.error("Cloudinary list error:", error);
    return NextResponse.json({ error: "Не вдалося отримати список відео" }, { status: 500 });
  }
}

// Прив'язуємо вибране відео до товару
export async function POST(request: Request) {
  try {
    const { productId, videoUrl } = await request.json();

    if (!productId || !videoUrl) {
      return NextResponse.json({ error: "Дані відсутні" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { videoUrl: videoUrl }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Database update error:", error);
    return NextResponse.json({ error: "Помилка збереження у базу" }, { status: 500 });
  }
}