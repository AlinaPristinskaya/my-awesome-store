import { NextResponse, NextRequest } from 'next/server';

// Обробка GET (те, що ти перевіряєш в браузері)
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/checkout/success`, 303);
}

// Обробка POST (те, що присилає WayForPay)
export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/checkout/success`, 303);
}

// Про всяк випадок додаємо OPTIONS (буває потрібно для CORS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}