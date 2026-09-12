import { NextRequest, NextResponse } from 'next/server';
import { businessDiscoveryService } from '@/services/businessDiscoveryService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat') || '28.6515';
    const lngStr = searchParams.get('lng') || '77.1906';
    const radiusStr = searchParams.get('radius') || '4000';

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = parseInt(radiusStr, 10);

    const businesses = await businessDiscoveryService.discoverNearby(lat, lng, radius);

    return NextResponse.json({
      success: true,
      total: businesses.length,
      lat,
      lng,
      radiusMeters: radius,
      businesses,
    });
  } catch (err: any) {
    console.error('[GET /api/discover/businesses]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Failed to discover nearby businesses' },
      { status: 500 }
    );
  }
}
