import { NextResponse } from 'next/server';
import { syncProductsFromXML } from '@/lib/sync-salesdrive';

export async function GET(request: Request) {
  // Захист за допомогою секретного ключа з .env, 
  // щоб ніхто чужий не міг навантажувати твій сервер запитами
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncProductsFromXML();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}