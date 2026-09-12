import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Collection } from "@/models/Collection";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SEED_COLLECTIONS = [
  {
    id: "col-wedding-2026",
    shopId: "sharma-fashion",
    shopName: "Sharma Fashion House",
    title: "Wedding Couture Edit 2026",
    slug: "wedding-couture-2026",
    description: "Handcrafted Zari lehengas, pure silk sherwanis, and heirloom dupattas for the festive season.",
    coverImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    tag: "Wedding Collection",
    featured: true,
    status: "ACTIVE",
    products: [
      {
        id: "prod-w1",
        name: "Cotton Embroidered Kurta",
        price: 2499,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
        category: "Ethnic Wear",
      },
      {
        id: "prod-w2",
        name: "Banarasi Silk Saree",
        price: 4999,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
        category: "Silk Sarees",
      },
    ],
  },
  {
    id: "col-diwali-sweets",
    shopId: "hira",
    shopName: "Hira Sweets & Sons",
    title: "Diwali Shubh Shuruat Hamper",
    slug: "diwali-sweets-hamper",
    description: "Pure desi ghee motichoor laddus, roasted dry fruit kaju katli, and traditional pinni boxes.",
    coverImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop",
    tag: "Festive Collection",
    featured: true,
    status: "ACTIVE",
    products: [
      {
        id: "prod-s1",
        name: "Kesar Kaju Katli (500g)",
        price: 580,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
        category: "Sweets",
      },
    ],
  },
  {
    id: "col-under-999",
    shopId: "chinar-crafts",
    shopName: "Chinar Crafts Guild",
    title: "Artisanal Keepsakes Under ₹999",
    slug: "keepsakes-under-999",
    description: "Authentic block-printed stoles, terracotta diffusers, and brass diya sets for every home.",
    coverImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    tag: "Under ₹999",
    featured: true,
    status: "ACTIVE",
    products: [
      {
        id: "prod-u1",
        name: "Hand-Block Printed Scarf",
        price: 799,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
        category: "Handlooms",
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const tag = searchParams.get("tag");

    try {
      await connectDb();
      const filter: Record<string, any> = { status: "ACTIVE" };
      if (shopId) filter.shopId = shopId;
      if (tag) filter.tag = tag;

      const collections = await Collection.find(filter).sort({ createdAt: -1 }).lean();
      if (collections.length > 0) {
        return NextResponse.json({
          collections: collections.map((c) => ({ ...c, id: c._id.toString() })),
          total: collections.length,
        });
      }
    } catch {}

    let filtered = SEED_COLLECTIONS;
    if (shopId) filtered = filtered.filter((c) => c.shopId === shopId);
    if (tag) filtered = filtered.filter((c) => c.tag.toLowerCase() === tag.toLowerCase());

    return NextResponse.json({
      collections: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    console.error("[GET /api/collections]", err?.message ?? err);
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const auth = verifyAuthToken(token);
    if (auth.role !== "owner") {
      return NextResponse.json({ error: "Only shop owners can publish collections" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, coverImage, tag, products = [], shopId, shopName } = body;

    if (!title || !coverImage) {
      return NextResponse.json({ error: "Collection title and cover image are required" }, { status: 400 });
    }

    await connectDb();
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const created = await Collection.create({
      shopId: shopId || `shop_${auth.id}`,
      shopName: shopName || "Heritage Store",
      title: title.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: description ? description.trim() : "",
      coverImage: coverImage.trim(),
      tag: tag || "New Arrivals",
      products: Array.isArray(products) ? products : [],
      status: "ACTIVE",
    });

    return NextResponse.json({
      success: true,
      collection: { ...created.toObject(), id: created._id.toString() },
    });
  } catch (err: any) {
    console.error("[POST /api/collections]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to create collection" }, { status: 500 });
  }
}
