import { NextRequest, NextResponse } from 'next/server';
import { getShopById } from '@/lib/overpass';
import { SHOPS } from '@/data/shops';
import { connectDb } from '@/lib/mongodb';
import { ShopProfile } from '@/models/ShopProfile';
import { mapDbShopToShop, getAllSeedShops } from '@/lib/shopMapper';
import mongoose from 'mongoose';

export async function GET(
  _req: NextRequest,
  { params }: { params: { placeId: string } }
) {
  const { placeId } = params;

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
  }

  // 1. Check static shops
  const staticShop = SHOPS.find((s) => s.id === placeId || s.placeId === placeId);
  if (staticShop) return NextResponse.json({ shop: staticShop });

  // 2. Check seed shops
  const seedShop = getAllSeedShops().find((s) => s.id === placeId || s.placeId === placeId);
  if (seedShop) return NextResponse.json({ shop: seedShop });

  // 3. Check MongoDB
  try {
    await connectDb();

    let dbDoc = await ShopProfile.findOne({ shopId: placeId }).lean();

    if (!dbDoc && mongoose.isValidObjectId(placeId)) {
      dbDoc = await ShopProfile.findById(placeId).lean();
    }

    if (dbDoc) {
      return NextResponse.json({ shop: mapDbShopToShop(dbDoc) });
    }
  } catch (dbErr: any) {
    console.warn(`[GET /api/shops/${placeId}] db lookup fallback`, dbErr?.message ?? dbErr);
  }

  // 4. Check OSM
  try {
    const shop = await getShopById(placeId);

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json(
      { shop },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (err: any) {
    console.error(`[GET /api/shops/${placeId}]`, err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? 'Shop lookup failed' }, { status: 500 });
  }
}

