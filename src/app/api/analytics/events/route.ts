import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { FootfallEvent } from "@/models/Visit";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    let userId: string | undefined = undefined;
    if (token) {
      try {
        const auth = verifyAuthToken(token);
        userId = auth.id;
      } catch {}
    }

    const body = await req.json();
    const { shopId, eventType, reservationId, verificationMethod, metadata } = body;

    if (!shopId || !eventType) {
      return NextResponse.json({ error: "Shop ID and eventType are required" }, { status: 400 });
    }

    await connectDb();

    const event = await FootfallEvent.create({
      shopId,
      userId: body.userId || userId,
      reservationId,
      eventType,
      verificationMethod,
      metadata,
    });

    return NextResponse.json({ success: true, eventId: event._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/analytics/events]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to log event" }, { status: 500 });
  }
}
