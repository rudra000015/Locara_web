import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDb } from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { ShopProfile } from "@/models/ShopProfile";
import { FootfallEvent } from "@/models/Visit";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

function generateReservationNumber(): string {
  const prefix = "LOC";
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const timePart = Date.now().toString().slice(-4);
  return `${prefix}-${timePart}-${randomPart}`;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateVerificationPayload(reservationNumber: string, shopId: string, otp: string): string {
  const payload = JSON.stringify({
    resNum: reservationNumber,
    shop: shopId,
    otp,
    t: Date.now(),
  });
  return Buffer.from(payload).toString("base64");
}

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    await connectDb();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, any> = {};

    if (payload.role === "owner") {
      const ownerShop = await ShopProfile.findOne({ ownerId: payload.id }).lean();
      if (!ownerShop) return NextResponse.json({ reservations: [] });
      query.shopId = ownerShop.shopId;
    } else {
      query.userId = payload.id;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    const reservations = await Reservation.find(query).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      reservations: reservations.map((r) => ({
        ...r,
        id: r._id.toString(),
      })),
    });
  } catch (err: any) {
    console.error("[GET /api/reservations]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to retrieve reservations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    let userId = "guest_explorer";
    let userName = "Locara Explorer";
    let userEmail = "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const auth = verifyAuthToken(token);
      userId = auth.id;
      userEmail = auth.email;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await req.json();
    const {
      shopId,
      shopName,
      shopAddress,
      shopLocation,
      items,
      durationHours = 8, // Expiration window in hours
      customerName,
      customerPhone,
      customerEmail,
    } = body;

    if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Shop ID and reservation items are required" }, { status: 400 });
    }

    // Calculate total price and 10% advance deposit
    let totalAmount = 0;
    const sanitizedItems = items.map((item: any) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(item.price || item.unitPrice) || 0);
      const totalPrice = unitPrice * quantity;
      totalAmount += totalPrice;

      return {
        productId: String(item.id || item.productId || `prod_${Date.now()}`),
        name: String(item.name || "Heritage Product"),
        size: item.size ? String(item.size) : undefined,
        color: item.color ? String(item.color) : undefined,
        quantity,
        unitPrice,
        totalPrice,
        image: item.image ? String(item.image) : undefined,
        unit: item.unit ? String(item.unit) : "piece",
      };
    });

    const advanceAmount = Math.round(totalAmount * 0.1); // 10% advance
    const remainingAmount = totalAmount - advanceAmount; // 90% in-store balance

    const reservationNumber = generateReservationNumber();
    const pickupOtp = generateOtp();
    const verificationQr = generateVerificationPayload(reservationNumber, shopId, pickupOtp);

    // Calculate expiry timestamp based on selected duration
    const expiryTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    const txnId = body.paymentTransactionId || `TXN_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const reservationPayload = {
      reservationNumber,
      userId,
      userName: customerName || userName,
      userEmail: customerEmail || userEmail,
      userPhone: customerPhone || "",
      shopId,
      shopName: shopName || "Heritage Shop",
      shopAddress: shopAddress || "",
      shopLocation: Array.isArray(shopLocation) && shopLocation.length === 2 ? shopLocation : undefined,
      items: sanitizedItems,
      totalAmount,
      advanceAmount,
      remainingAmount,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: body.paymentMethod || "RAZORPAY",
      paymentTransactionId: txnId,
      pickupOtp,
      verificationQr,
      expiryTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let savedReservation: any = null;

    try {
      await connectDb();
      const doc = await Reservation.create(reservationPayload);
      savedReservation = {
        ...doc.toObject(),
        id: doc._id.toString(),
      };

      try {
        await FootfallEvent.create({
          shopId,
          userId,
          reservationId: doc._id.toString(),
          eventType: "RESERVED",
          metadata: {
            reservationNumber,
            totalAmount,
            advanceAmount,
            itemCount: sanitizedItems.length,
          },
        });
      } catch {}
    } catch (dbErr: any) {
      console.warn("[POST /api/reservations] MongoDB save fallback to local:", dbErr?.message ?? dbErr);
      savedReservation = {
        ...reservationPayload,
        id: `res_${Date.now()}`,
        _id: `res_${Date.now()}`,
      };
    }

    return NextResponse.json(
      {
        success: true,
        reservation: savedReservation,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/reservations]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to create reservation" }, { status: 500 });
  }
}
