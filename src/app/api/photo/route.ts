// Photo proxy route — forwards requests to Google Places photo API
// This keeps the GOOGLE_PLACES_API_KEY secret (never sent to the browser)

import { NextRequest, NextResponse } from 'next/server';

const PLACES_BASE = 'https://places.googleapis.com/v1';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  const maxW = req.nextUrl.searchParams.get('w') ?? '800';

  if (!name) {
    return NextResponse.json({ error: 'name param required' }, { status: 400 });
  }

  try {
    const url = `${PLACES_BASE}/${name}/media?maxWidthPx=${maxW}&skipHttpRedirect=true&key=${API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: 'Photo fetch failed' }, { status: res.status });
    }

    const data = await res.json();
    const photoUri = data.photoUri;

    if (!photoUri) {
      return NextResponse.json({ error: 'No photoUri in response' }, { status: 404 });
    }

    // Redirect to the actual Google-signed photo URL
    return NextResponse.redirect(photoUri, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[GET /api/photo]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
