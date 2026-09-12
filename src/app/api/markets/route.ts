import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Market } from "@/models/Market";
import { MARKETS_DATA } from "@/data/markets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "";

    try {
      await connectDb();
      const dbMarkets = await Market.find(city ? { city: new RegExp(`^${city}$`, "i") } : {}).lean();
      if (dbMarkets.length > 0) {
        return NextResponse.json({
          markets: dbMarkets,
          total: dbMarkets.length,
        });
      }
    } catch (e) {
      console.warn("DB Market fetch fallback to static dataset", e);
    }

    const filtered = city
      ? MARKETS_DATA.filter((m) => m.city.toLowerCase().includes(city.toLowerCase()))
      : MARKETS_DATA;

    return NextResponse.json({
      markets: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    console.error("[GET /api/markets]", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
