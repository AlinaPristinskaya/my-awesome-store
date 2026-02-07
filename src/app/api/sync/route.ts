import { NextResponse } from 'next/server';
import { syncProductsFromXML } from '@/lib/sync-salesdrive';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Отримуємо ключ із URL запиту
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // 2. Перевіряємо, чи збігається ключ із тим, що вказаний у .env
  // Переконайся, що в Vercel або .env додано CRON_SECRET
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or missing key' }, 
      { status: 401 }
    );
  }

  try {
    // 3. Запускаємо нашу оновлену синхронізацію, яка тепер враховує parentId
    const result = await syncProductsFromXML();

    // 4. Повертаємо результат (кількість оновлених товарів тощо)
    if (result.success) {
      return NextResponse.json({
        message: 'Синхронізація пройшла успішно',
        count: result.count,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Critical Sync API Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) }, 
      { status: 500 }
    );
  }
}