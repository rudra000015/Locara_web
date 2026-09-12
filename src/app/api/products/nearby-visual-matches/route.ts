import { NextRequest, NextResponse } from 'next/server';
import { visualSearchService } from '@/services/visualSearchService';
import { shopMatchingService } from '@/services/shopMatchingService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius');
    const category = searchParams.get('category') || undefined;
    const textQuery = searchParams.get('q') || searchParams.get('query') || undefined;

    const userLat = latStr ? parseFloat(latStr) : undefined;
    const userLng = lngStr ? parseFloat(lngStr) : undefined;
    const radiusMeters = radiusStr ? parseInt(radiusStr, 10) : 15000;

    const { results, queryType, totalMatched } =
      await visualSearchService.executeVisualSearch({
        textQuery: textQuery || 'heritage handcrafted specialty',
        userLat,
        userLng,
        radiusMeters,
        category,
        limit: 25,
      });

    const shopClusters = shopMatchingService.clusterMatchesByShop(results);

    return NextResponse.json({
      success: true,
      queryType,
      totalMatched,
      results,
      shopClusters,
    });
  } catch (err: any) {
    console.error('[GET /api/products/nearby-visual-matches]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch nearby visual matches' },
      { status: 500 }
    );
  }
}
