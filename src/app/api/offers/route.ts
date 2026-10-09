import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Offer } from "@/models/Offer";
import { ShopProfile } from "@/models/ShopProfile";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SEED_OFFERS = [
  {
    id: "off-flash-1",
    shopId: "hira",
    shopName: "Hira Sweets & Sons",
    title: "Diwali Special Sweet Boxes",
    description: "Flat 25% off on all assorted mithai gift hampers reserved online for in-store pickup.",
    discountType: "FLASH_SALE",
    discountValue: 25,
    badgeText: "🔥 Flash Sale — 25% Off",
    flashSale: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    status: "ACTIVE",
  },
  {
    id: "off-open-2",
    shopId: "sharma-fashion",
    shopName: "Sharma Fashion House",
    title: "Opening Storefront Season",
    description: "Get 20% discount voucher applied automatically on all embroidered kurtas.",
    discountType: "OPENING_SPECIAL",
    discountValue: 20,
    badgeText: "🎁 Opening Special — 20% Off",
    flashSale: false,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
    status: "ACTIVE",
  },
  {
    id: "off-fest-3",
    shopId: "kanhaiyalal",
    shopName: "Kanhaiyalal & Sons Silver",
    title: "Dhanteras Silverware Bonanza",
    description: "Flat ₹500 off on solid 925 silver pooja thali sets when you reserve with 10% advance.",
    discountType: "FIXED_AMOUNT",
    discountValue: 500,
    badgeText: "✦ Festive Silver Offer",
    flashSale: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
    status: "ACTIVE",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flashSale = searchParams.get("flashSale");
    const token = extractBearerToken(req);
    const auth = token ? verifyAuthToken(token) : null;
    const ownerView = auth?.role === "owner";

    try {
      await connectDb();
      const filter: Record<string, any> = { status: "ACTIVE" };
      if (ownerView) {
        const ownerShop = await ShopProfile.findOne({ ownerId: auth!.id }).sort({ updatedAt: -1 }).lean();
        if (!ownerShop) return NextResponse.json({ offers: [], total: 0 });
        filter.shopId = ownerShop.shopId;
      } else {
        const requestedShopId = searchParams.get("shopId");
        if (requestedShopId) {
          // Explorer routes may use the Mongo document id while owner content
          // is stored against the public shop slug.
          const shop = await ShopProfile.findOne({ shopId: requestedShopId }).select({ shopId: 1 }).lean()
            ?? (/^[a-f\d]{24}$/i.test(requestedShopId)
              ? await ShopProfile.findById(requestedShopId).select({ shopId: 1 }).lean()
              : null);
          filter.shopId = shop?.shopId ?? requestedShopId;
        }
      }
      if (flashSale === "true") filter.flashSale = true;

      const offers = await Offer.find(filter).sort({ createdAt: -1 }).lean();
      if (ownerView || offers.length > 0) {
        return NextResponse.json({
          offers: offers.map((o) => ({ ...o, id: o._id.toString() })),
          total: offers.length,
        });
      }
    } catch {}

    if (ownerView) return NextResponse.json({ offers: [], total: 0 });
    const shopId = searchParams.get("shopId");
    let filtered = SEED_OFFERS;
    if (shopId) filtered = filtered.filter((o) => o.shopId === shopId);
    if (flashSale === "true") filtered = filtered.filter((o) => o.flashSale);

    return NextResponse.json({
      offers: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    console.error("[GET /api/offers]", err?.message ?? err);
    return NextResponse.json({ error: "Failed to load offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const auth = verifyAuthToken(token);
    if (auth.role !== "owner") {
      return NextResponse.json({ error: "Only shop owners can create offers" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      discountType = "PERCENTAGE",
      discountValue,
      badgeText,
      flashSale = false,
      endDate,
      applicableProducts = [],
    } = body;

    if (!title || !discountValue) {
      return NextResponse.json({ error: "Offer title and discount value are required" }, { status: 400 });
    }
    if (!Number.isFinite(Number(discountValue)) || Number(discountValue) <= 0) {
      return NextResponse.json({ error: "Enter a valid positive discount value" }, { status: 400 });
    }

    await connectDb();
    const ownedShop = await ShopProfile.findOne({ ownerId: auth.id }).sort({ updatedAt: -1 }).lean();
    if (!ownedShop) return NextResponse.json({ error: "Register your shop before creating an offer" }, { status: 404 });

    const created = await Offer.create({
      shopId: ownedShop.shopId,
      shopName: ownedShop.name,
      title: title.trim(),
      description: description ? description.trim() : "",
      discountType,
      discountValue: Number(discountValue),
      badgeText: badgeText ? badgeText.trim() : `${discountValue}% OFF`,
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts.map(String).slice(0, 100) : [],
      flashSale: Boolean(flashSale),
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 10 * 24 * 3600 * 1000),
      status: "ACTIVE",
    });

    return NextResponse.json({
      success: true,
      offer: { ...created.toObject(), id: created._id.toString() },
    });
  } catch (err: any) {
    console.error("[POST /api/offers]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to create offer" }, { status: 500 });
  }
}
