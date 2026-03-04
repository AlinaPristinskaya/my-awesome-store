import { NextResponse } from 'next/server';
import * as syncLib from '@/lib/sync-salesdrive'; 

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // ПЕРЕВІРКА КЛЮЧА
  if (key !== "MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN") {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncLib.syncProductsFromXML();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}