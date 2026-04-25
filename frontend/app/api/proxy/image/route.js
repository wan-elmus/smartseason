import { NextResponse } from 'next/server';

const ALLOWED_HOST = process.env.BACKEND_URL;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const parsed = new URL(imageUrl);
    const backend = new URL(ALLOWED_HOST);

    if (parsed.hostname !== backend.hostname) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const response = await fetch(imageUrl, {
      headers: {
        Authorization: request.headers.get('authorization') || '',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse('Internal error', { status: 500 });
  }
}