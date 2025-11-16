import { NextResponse } from 'next/server';

// Simple API skeleton for GET and POST at /api

export async function GET(request) {
  const baseUrl = request.nextUrl?.origin || '';
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Financy API root',
      routes: {
        health: `${baseUrl}/api/health`,
        echo: `${baseUrl}/api`,
      },
    },
    { status: 200 }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ status: 'ok', echo: body }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: 'error', message: 'invalid JSON' }, { status: 400 });
  }
}
