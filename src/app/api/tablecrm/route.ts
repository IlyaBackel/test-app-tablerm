// src/app/api/tablecrm/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const endpoint = searchParams.get('endpoint'); // например, 'payboxes'
  
  if (!token || !endpoint) {
    return NextResponse.json(
      { error: 'Token and endpoint required' }, 
      { status: 400 }
    );
  }

  try {
    // Собираем остальные параметры
    const params = new URLSearchParams();
    params.set('token', token);
    searchParams.forEach((value, key) => {
      if (!['token', 'endpoint'].includes(key)) {
        params.set(key, value);
      }
    });

    // Запрос к tablecrm С СЕРВЕРА (не из браузера!)
    const response = await fetch(
      `https://app.tablecrm.com/api/v1/${endpoint}?${params.toString()}`,
      {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Не передаём куки, чтобы избежать CORS
        credentials: 'omit',
      }
    );

    // Получаем данные
    const data = await response.json();
    
    // Возвращаем с CORS-заголовками
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Proxy failed';
    console.error('Proxy error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}