import { NextRequest, NextResponse } from 'next/server';
import { shopImages, SHOPS } from '@/data/shops';
import { extractBearerToken, verifyAuthToken } from '@/lib/auth';
import { getCityByName, getDefaultCity } from '@/lib/cities';
import { connectDb } from '@/lib/mongodb';
import { resolveShopCategory } from '@/lib/shopCategories';
import { mapDbShopToShop, getAllSeedShops } from '@/lib/shopMapper';
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
  const requestedRadius = toNumber(searchParams.get('radius')) ?? 5000;
  const radius = Math.min(25000, Math.max(1000, requestedRadius));

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
        shop.subcategory ?? '',
        shop.story ?? '',
        shop.aiGeneratedDescription ?? '',
        ...(shop.tags ?? []),
        ...(shop.keywords ?? []),
        ...(shop.products ?? []).flatMap((p) => [p.name, p.category ?? '', p.description ?? '']),
      ]
        .join(' ')
        .toLowerCase();
      const matchesText = tokens.every((token) => hay.includes(token));
      if (!matchesText) return false;
    }

    // Check city / proximity filter
    if (shop.loc && shop.loc.length === 2) {
      const dist = getDistanceMeters(lat, lng, shop.loc[0], shop.loc[1]);
      if (dist > radius) return false;
    } else if (city) {
      const cityLower = city.toLowerCase();
      if (!shop.addr.toLowerCase().includes(cityLower)) return false;
    }

    return true;
  });

  // If city filter returned 0, provide closest curated shops so map is never empty
  const effectiveCurated = curatedMatches;

  // 3. Query MongoDB ShopProfile if connected
  let dbShops: Shop[] = [];
  try {
    await connectDb();

    const baseFilter: Record<string, any> = {};
    if (city) {
      baseFilter.city = new RegExp(`^${city}$`, 'i');
    }

    if (tokens.length > 0) {
      const searchableFields = ['name', 'category', 'subcategory', 'description', 'aiGeneratedDescription', 'address', 'tags', 'specialties', 'keywords', 'products.name', 'products.category', 'products.description'];
      baseFilter.$and = tokens.map((token) => {
        const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return {
          $or: searchableFields.map((field) => ({ [field]: { $regex: escaped, $options: 'i' } })),
        };
      });
    }

    const docs = await ShopProfile.find({
      ...baseFilter,
      status: 'APPROVED',
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    })
      .limit(50)
      .lean();

    dbShops = docs.map((doc) => mapDbShopToShop(doc));
  } catch (dbErr: any) {
    console.warn('[GET /api/shops] MongoDB fetch fallback:', dbErr?.message ?? dbErr);
  }

  // Merge MongoDB shops and local curated shops
  const merged = [
    ...dbShops,
    ...effectiveCurated.map((shop) => ({ ...shop, source: shop.source ?? 'curated' as const })),
  ];
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
      headers: { 'Cache-Control': 'no-store' },
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

    if (!auth?.id || auth.role !== 'owner') {
      return NextResponse.json({ error: 'Sign in with an owner account to register a shop' }, { status: 401 });
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
    const keywords = sanitizeStringArray(body?.keywords, 50).map((value) => value.toLowerCase());
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

    const owner = await User.findById(auth.id).lean();
    if (!owner || owner.role !== 'owner') {
      return NextResponse.json({ error: 'Owner account could not be verified' }, { status: 403 });
    }

    const profilePayload = {
      ownerId: owner._id,
      ownerName: String(body?.ownerName ?? owner.name).trim(),
      ownerEmail: owner.email,
      contactEmail: String(body?.email ?? owner.email).trim().toLowerCase(),
      ownerImg: owner.img,
      name,
      category,
      subcategory: String(body?.subcategory ?? '').trim(),
      businessType: String(body?.businessType ?? '').trim(),
      priceRange: String(body?.priceRange ?? '').trim(),
      yearsInBusiness: Number.isFinite(Number(body?.yearsInBusiness)) ? Math.max(0, Number(body.yearsInBusiness)) : undefined,
      targetAudience: String(body?.targetAudience ?? '').trim(),
      productsServices: String(body?.productsServices ?? '').trim(),
      area: String(body?.area ?? '').trim(),
      pincode: String(body?.pincode ?? '').trim(),
      shopStyle: String(body?.shopStyle ?? '').trim(),
      aiGeneratedDescription: String(body?.aiGeneratedDescription ?? '').trim(),
      description,
      address,
      city,
      state,
      country,
      phone,
      website,
      tags,
      keywords,
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
      status: 'APPROVED',
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
