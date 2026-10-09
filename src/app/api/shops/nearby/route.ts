import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import { ShopProfile } from '@/models/ShopProfile';
import { SHOPS } from '@/data/shops';
import { getAllSeedShops, mapDbShopToShop } from '@/lib/shopMapper';
import { getDistanceMeters, formatDistance } from '@/lib/geo';
import type { Shop } from '@/types/shop';

function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const rawLat = searchParams.get('lat');
  const rawLng = searchParams.get('lng');
  const rawRadius = searchParams.get('radius');
  const category = (searchParams.get('category') || searchParams.get('cat') || '').trim().toLowerCase();
  const search = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 50));

  if (!rawLat || !rawLng) {
    return NextResponse.json(
      { error: 'Latitude (lat) and longitude (lng) parameters are required.' },
      { status: 400 }
    );
  }

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return NextResponse.json(
      { error: 'Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.' },
      { status: 400 }
    );
  }

  const radiusNumber = Number(rawRadius) || 5000;
  const radius = Math.min(25000, Math.max(500, radiusNumber));

  let shops: any[] = [];
  let source: 'mongodb' | 'fallback' = 'fallback';

  // 1. Try MongoDB GeoJSON 2dsphere $near query
  try {
    await connectDb();

    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat], // GeoJSON order is [longitude, latitude]
          },
          $maxDistance: radius,
        },
      },
    };

    if (category && category !== 'all') {
      query.$or = [
        { category: new RegExp(`^${category}$`, 'i') },
        { subcategory: new RegExp(`^${category}$`, 'i') },
        { tags: new RegExp(`^${category}$`, 'i') },
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { subcategory: searchRegex },
            { address: searchRegex },
            { specialties: searchRegex },
            { tags: searchRegex },
            { 'products.name': searchRegex },
          ],
        },
      ];
    }

    const docs = await ShopProfile.find(query)
      .limit(limit)
      .lean();

    if (docs && docs.length > 0) {
      source = 'mongodb';
      shops = docs.map((doc) => {
        const mapped = mapDbShopToShop(doc);
        const shopLng = doc.location?.coordinates?.[0] ?? (mapped.loc ? mapped.loc[1] : lng);
        const shopLat = doc.location?.coordinates?.[1] ?? (mapped.loc ? mapped.loc[0] : lat);
        const distanceMeters = getDistanceMeters(lat, lng, shopLat, shopLng);

        return {
          _id: doc._id?.toString() || doc.shopId,
          id: doc.shopId || doc._id?.toString(),
          slug: doc.shopId,
          name: doc.name,
          description: doc.description || doc.aiGeneratedDescription || '',
          category: doc.category || 'general',
          subcategory: doc.subcategory || '',
          images: doc.photos && doc.photos.length > 0 ? doc.photos : mapped.images,
          rating: doc.rating || mapped.rating || 4.5,
          reviewCount: doc.totalRatings || mapped.totalRatings || 120,
          address: doc.address || mapped.addr,
          city: doc.city || 'Meerut',
          location: doc.location || { type: 'Point', coordinates: [shopLng, shopLat] },
          loc: [shopLat, shopLng] as [number, number],
          isOpen: doc.isOpen !== false,
          openTime: doc.openTime || '09:00',
          closeTime: doc.closeTime || '21:00',
          phone: doc.phone || mapped.phone,
          website: doc.website || mapped.website,
          products: doc.products || mapped.products || [],
          distanceMeters,
          distanceFormatted: formatDistance(distanceMeters),
        };
      });
    }
  } catch (dbErr: any) {
    console.warn('[GET /api/shops/nearby] MongoDB query skipped/fallback:', dbErr?.message ?? dbErr);
  }

  // 2. If MongoDB returned 0 or failed, calculate distances on curated fallback mock dataset
  if (shops.length === 0) {
    source = 'fallback';
    const allLocal: Shop[] = [...getAllSeedShops(), ...SHOPS];

    const deduplicated = new Map<string, Shop>();
    for (const s of allLocal) {
      if (!deduplicated.has(s.id)) {
        deduplicated.set(s.id, s);
      }
    }

    const matched = Array.from(deduplicated.values())
      .map((s) => {
        const shopLat = s.loc?.[0] ?? 28.9845;
        const shopLng = s.loc?.[1] ?? 77.7064;
        const dist = getDistanceMeters(lat, lng, shopLat, shopLng);

        return {
          _id: s.id,
          id: s.id,
          slug: s.id,
          name: s.name,
          description: s.story || '',
          category: s.cat || 'handicrafts',
          subcategory: s.subcategory || '',
          images: s.images || [],
          rating: s.rating || 4.6,
          reviewCount: s.totalRatings || 120,
          address: s.addr || '',
          city: 'Meerut',
          location: {
            type: 'Point',
            coordinates: [shopLng, shopLat],
          },
          loc: [shopLat, shopLng] as [number, number],
          isOpen: true,
          openTime: '09:00',
          closeTime: '21:00',
          phone: s.phone || '+91 98370 12345',
          products: s.products || [],
          distanceMeters: dist,
          distanceFormatted: formatDistance(dist),
        };
      })
      .filter((s) => {
        if (s.distanceMeters > radius) return false;

        if (category && category !== 'all') {
          const matchCat =
            s.category.toLowerCase() === category ||
            s.subcategory.toLowerCase().includes(category);
          if (!matchCat) return false;
        }

        if (search) {
          const hay = `${s.name} ${s.description} ${s.category} ${s.subcategory} ${s.address}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }

        return true;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);

    shops = matched;
  }

  return NextResponse.json(
    {
      success: true,
      shops,
      total: shops.length,
      location: {
        lat,
        lng,
        radius,
      },
      source,
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
