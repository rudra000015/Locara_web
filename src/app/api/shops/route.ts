import { NextRequest, NextResponse } from 'next/server';

import { shopImages, SHOPS } from '@/data/shops';
import { extractBearerToken, verifyAuthToken } from '@/lib/auth';
import { getCityByName, getDefaultCity } from '@/lib/cities';
import { connectDb } from '@/lib/mongodb';
import { searchNearbyShops, textSearchShops } from '@/lib/overpass';
import { resolveShopCategory } from '@/lib/shopCategories';
import { mapDbShopToShop, getAllSeedShops } from '@/lib/shopMapper';
import { searchGoogleNearbyShops, searchGoogleTextShops } from '@/lib/googlePlaces';
import { getDistanceMeters } from '@/lib/geo';
import { ShopProfile } from '@/models/ShopProfile';
import { User } from '@/models/User';
import type { Shop } from '@/types/shop';

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeCoords(lat?: number, lng?: number, cityName?: string | null) {
  if (lat !== undefined && lng !== undefined) {
    return { lat, lng };
  }

  const city = getCityByName(cityName) ?? getDefaultCity();
  return { lat: city.lat, lng: city.lng };
}

function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function sanitizeStringArray(input: unknown, limit = 20): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const city = (searchParams.get('city') ?? '').trim();
  const radius = toNumber(searchParams.get('radius')) ?? 10000;

  const inputLat = toNumber(searchParams.get('lat'));
  const inputLng = toNumber(searchParams.get('lng'));
  const { lat, lng } = normalizeCoords(inputLat, inputLng, city);

  const qLower = q.toLowerCase();
  const tokens = qLower
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !['india', 'up', 'uttar', 'pradesh', 'in'].includes(t));

  // 1. Gather all local seed shops and static shops
  const allCuratedShops: Shop[] = [...getAllSeedShops(), ...SHOPS];

  // 2. Filter curated shops by city & query
  const curatedMatches = allCuratedShops.filter((shop) => {
    // Check text search tokens
    if (tokens.length > 0) {
      const hay = [
        shop.name,
        shop.addr,
        shop.cat,
        shop.story ?? '',
        ...(shop.products ?? []).map((p) => p.name),
      ]
        .join(' ')
        .toLowerCase();
      const matchesText = tokens.some((token) => hay.includes(token));
      if (!matchesText) return false;
    }

    // Check city / proximity filter
    if (city) {
      const cityLower = city.toLowerCase();
      const matchesCityName = shop.addr.toLowerCase().includes(cityLower);
      if (matchesCityName) return true;

      // Check distance from current city / coordinates
      if (shop.loc && shop.loc.length === 2) {
        const dist = getDistanceMeters(lat, lng, shop.loc[0], shop.loc[1]);
        if (dist <= Math.max(radius, 35000)) return true;
      }
      return false;
    }

    return true;
  });

  // If city filter returned 0, provide closest curated shops so map is never empty
  const effectiveCurated = curatedMatches.length > 0 ? curatedMatches : allCuratedShops;

  // 3. Query MongoDB ShopProfile if connected
  let dbShops: Shop[] = [];
  try {
    await connectDb();

    const baseFilter: Record<string, any> = {};
    if (city) {
      baseFilter.city = new RegExp(`^${city}$`, 'i');
    }

    if (tokens.length > 0) {
      baseFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
        { specialties: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    const docs = await ShopProfile.find({
      ...baseFilter,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: Math.max(radius, 50000),
        },
      },
    })
      .limit(50)
      .lean();

    dbShops = docs.map((doc) => mapDbShopToShop(doc));
  } catch (dbErr: any) {
    console.warn('[GET /api/shops] MongoDB fetch fallback:', dbErr?.message ?? dbErr);
  }

  // 4. Overpass OpenStreetMap discovery with quick timeout
  let osmShops: Shop[] = [];
  try {
    const osmPromise = q.length > 0
      ? textSearchShops(q, lat, lng, radius)
      : searchNearbyShops(lat, lng, radius);

    const timeoutPromise = new Promise<Shop[]>((resolve) => {
      setTimeout(() => resolve([]), 2500);
    });

    osmShops = await Promise.race([osmPromise, timeoutPromise]);
  } catch (err: any) {
    console.warn('[GET /api/shops] Overpass fetch skipped/failed:', err?.message ?? err);
  }

  // 5. Google Places API (New) discovery if GOOGLE_PLACES_API_KEY is configured
  let googlePlacesShops: Shop[] = [];
  try {
    if (process.env.GOOGLE_PLACES_API_KEY) {
      const gPromise = q.length > 0
        ? searchGoogleTextShops(q, lat, lng, radius)
        : searchGoogleNearbyShops(lat, lng, radius);

      const gTimeout = new Promise<Shop[]>((resolve) => {
        setTimeout(() => resolve([]), 3000);
      });

      googlePlacesShops = await Promise.race([gPromise, gTimeout]);
    }
  } catch (gErr: any) {
    console.warn('[GET /api/shops] Google Places fetch skipped/failed:', gErr?.message ?? gErr);
  }

  // 6. Merge, calculate distance, and deduplicate
  const merged = [...dbShops, ...effectiveCurated, ...googlePlacesShops, ...osmShops];
  const mapById = new Map<string, Shop>();


  for (const shop of merged) {
    if (!shop.id && !shop.placeId) continue;
    const key = shop.id || shop.placeId;
    if (!mapById.has(key)) {
      const distance =
        Array.isArray(shop.loc) && shop.loc.length === 2
          ? getDistanceMeters(lat, lng, shop.loc[0], shop.loc[1])
          : undefined;

      mapById.set(key, {
        ...shop,
        distanceMeters: distance,
      });
    }
  }

  const sortedShops = Array.from(mapById.values()).sort(
    (a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER)
  );

  return NextResponse.json(
    {
      shops: sortedShops,
      total: sortedShops.length,
      location: { lat, lng, city: city || getDefaultCity().name },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    }
  );
}


export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    let auth: { id?: string; role?: string } | null = null;

    if (token) {
      try {
        auth = verifyAuthToken(token) as { id?: string; role?: string } | null;
      } catch {
        auth = null;
      }
    }

    const body = await req.json();

    const name = String(body?.name ?? '').trim();
    const resolvedCategory = resolveShopCategory(body?.category);
    const category = resolvedCategory.id;
    const description = String(body?.description ?? '').trim();
    const address = String(body?.address ?? '').trim();
    const city = String(body?.city ?? '').trim();
    const state = String(body?.state ?? '').trim();
    const country = String(body?.country ?? 'India').trim();
    const phone = String(body?.phone ?? '').trim();
    const website = String(body?.website ?? '').trim();
    const tags = sanitizeStringArray(body?.tags, 30);
    const specialties = sanitizeStringArray(body?.specialties, 30);
    const inputLat = toNumber(body?.lat?.toString?.() ?? null);
    const inputLng = toNumber(body?.lng?.toString?.() ?? null);

    if (
      (inputLat !== undefined || inputLng !== undefined) &&
      (inputLat === undefined || inputLng === undefined || !isValidLatitude(inputLat) || !isValidLongitude(inputLng))
    ) {
      return NextResponse.json({ error: 'Latitude/longitude values are invalid' }, { status: 400 });
    }

    const coords = normalizeCoords(inputLat, inputLng, city);

    if (!name || !city) {
      return NextResponse.json(
        { error: 'Shop name and city are required' },
        { status: 400 }
      );
    }

    await connectDb();

    let owner = null as any;
    if (auth?.id) {
      owner = await User.findById(auth.id).lean();
    }

    if (!owner) {
      const guestEmail = String(body?.ownerEmail ?? body?.email ?? 'guest-owner@locara.local').trim();
      const guestName = String(body?.ownerName ?? body?.name ?? 'Guest Owner').trim() || 'Guest Owner';
      const guestImg = body?.ownerImg ? String(body.ownerImg).trim() : undefined;

      owner = await User.findOne({ email: guestEmail }).lean();
      if (!owner) {
        owner = await User.create({
          name: guestName,
          email: guestEmail,
          role: 'owner',
          provider: 'credentials',
          img: guestImg,
        });
      }
    }

    const profilePayload = {
      ownerId: owner._id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      ownerImg: owner.img,
      name,
      category,
      description,
      address,
      city,
      state,
      country,
      phone,
      website,
      tags,
      specialties,
      tagline: body?.tagline ? String(body.tagline).trim() : undefined,
      est: typeof body?.est === 'number' ? body.est : undefined,
      isOpen: typeof body?.isOpen === 'boolean' ? body.isOpen : true,
      openTime: typeof body?.openTime === 'string' ? body.openTime : '09:00',
      closeTime: typeof body?.closeTime === 'string' ? body.closeTime : '21:00',
      photos: Array.isArray(body?.photos) && body.photos.length
        ? body.photos.filter(Boolean)
        : shopImages(resolvedCategory.canonical),
      products: Array.isArray(body?.products) ? body.products : [],
      location: {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
      },
    };

    let created = false;
    let profile = await ShopProfile.findOne({ ownerId: owner._id }).sort({ updatedAt: -1 });

    if (profile) {
      Object.assign(profile, profilePayload);
      await profile.save();
    } else {
      const baseSlug = slugify(`${name}-${city}`) || `shop-${Date.now()}`;
      const shopId = `${baseSlug}-${Date.now().toString().slice(-5)}`;
      profile = await ShopProfile.create({
        shopId,
        ...profilePayload,
      });
      created = true;
    }

    return NextResponse.json(
      {
        ok: true,
        created,
        shop: mapDbShopToShop(profile.toObject()),
      },
      { status: created ? 201 : 200 }
    );
  } catch (err: any) {
    console.error('[POST /api/shops]', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Unable to register shop' },
      { status: 500 }
    );
  }
}
