import { NextResponse } from 'next/server';
import { syncProductsFromXML } from '@/lib/sync-salesdrive';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or missing key' }, 
      { status: 401 }
    );
  }

  try {
    const result = await syncProductsFromXML();

    if (result.success) {
      // Використовуємо дані з details, які реально повертає функція
      return NextResponse.json({
        message: 'Синхронізація пройшла успішно',
        stats: {
          new: result.details?.newProducts || 0,
          updated: result.details?.updated || 0,
          categories: result.details?.newCats?.length || 0
        },
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