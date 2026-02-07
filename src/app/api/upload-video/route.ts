import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// Отримуємо список відео з Cloudinary
export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      asset_folder: 'shorts', 
      max_results: 100
    });
    
    return NextResponse.json(result.resources);
  } catch (error) {
    console.error("Cloudinary list error:", error);
    return NextResponse.json({ error: "Не вдалося отримати список відео" }, { status: 500 });
  }
}

// Прив'язуємо або видаляємо відео
export async function POST(request: Request) {
  try {
    const { productId, videoUrl } = await request.json();

    // Тепер перевіряємо ТІЛЬКИ productId. 
    // videoUrl може бути порожнім, якщо ми хочемо його видалити.
    if (!productId) {
      return NextResponse.json({ error: "ID товару відсутній" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        // Якщо videoUrl порожній або undefined, записуємо null (очищуємо поле)
        videoUrl: videoUrl || null 
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Database update error:", error);
    return NextResponse.json({ error: "Помилка збереження у базу" }, { status: 500 });
  }
}