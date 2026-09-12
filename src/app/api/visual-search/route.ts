import { NextRequest, NextResponse } from 'next/server';
import { visualSearchService } from '@/services/visualSearchService';
import { shopMatchingService } from '@/services/shopMatchingService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let image: string | undefined;
    let textQuery: string | undefined;
    let userLat: number | undefined;
    let userLng: number | undefined;
    let radiusMeters: number | undefined;
    let category: string | undefined;
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      image = body.image;
      textQuery = body.textQuery;
      if (body.lat !== undefined) userLat = parseFloat(body.lat);
      if (body.lng !== undefined) userLng = parseFloat(body.lng);
      if (body.radius !== undefined) radiusMeters = parseInt(body.radius, 10);
      category = body.category;
      if (body.maxPrice !== undefined) maxPrice = parseFloat(body.maxPrice);
      if (body.minPrice !== undefined) minPrice = parseFloat(body.minPrice);
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        image = `data:${mimeType};base64,${base64}`;
      }
      textQuery = (formData.get('textQuery') as string) || undefined;
      const latVal = formData.get('lat') as string;
      const lngVal = formData.get('lng') as string;
      if (latVal) userLat = parseFloat(latVal);
      if (lngVal) userLng = parseFloat(lngVal);
      category = (formData.get('category') as string) || undefined;
    }

    if (!image && !textQuery) {
      return NextResponse.json(
        { error: 'Please upload an image or provide a search query.' },
        { status: 400 }
      );
    }

    const { results, queryType, model, version, totalMatched } =
      await visualSearchService.executeVisualSearch({
        image,
        textQuery,
        userLat,
        userLng,
        radiusMeters,
        category,
        maxPrice,
        minPrice,
        limit: 25,
      });

    const shopClusters = shopMatchingService.clusterMatchesByShop(results);

    return NextResponse.json({
      success: true,
      queryType,
      model,
      version,
      totalMatched,
      results,
      shopClusters,
    });
  } catch (err: any) {
    console.error('[POST /api/visual-search]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Visual search failed' },
      { status: 500 }
    );
  }
}
