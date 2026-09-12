import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Visit } from "@/models/Visit";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const auth = verifyAuthToken(token);
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");

    await connectDb();

    const query: Record<string, any> = {};
    if (auth.role === "owner" && shopId) {
      query.shopId = shopId;
    } else {
      query.userId = auth.id;
    }

    const visits = await Visit.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({
      visits: visits.map((v) => ({ ...v, id: v._id.toString() })),
      total: visits.length,
    });
  } catch (err: any) {
    console.error("[GET /api/visits]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to load visits" }, { status: 500 });
  }
}
