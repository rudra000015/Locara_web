import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Market } from "@/models/Market";
import { MARKETS_DATA } from "@/data/markets";
import { SHOPS } from "@/data/shops";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug.toLowerCase();

    let marketData: any = null;

    try {
      await connectDb();
      marketData = await Market.findOne({ slug }).lean();
    } catch {}

    if (!marketData) {
      marketData = MARKETS_DATA.find((m) => m.slug === slug);
    }

    if (!marketData) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    // Correlate with shops located in this market/city
    const relatedShops = SHOPS.filter(
      (s) =>
        s.addr.toLowerCase().includes(marketData.name.toLowerCase()) ||
        s.addr.toLowerCase().includes(marketData.city.toLowerCase()) ||
        s.cat === marketData.categories[0]?.toLowerCase()
    ).slice(0, 12);

    return NextResponse.json({
      market: marketData,
      shops: relatedShops,
    });
  } catch (err: any) {
    console.error("[GET /api/markets/:slug]", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch market details" }, { status: 500 });
  }
}
