import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { Visit, FootfallEvent } from "@/models/Visit";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractBearerToken(req);
    let isSeller = false;
    if (token) {
      try {
        const auth = verifyAuthToken(token);
        if (auth.role === "owner") isSeller = true;
      } catch {}
    }

    const body = await req.json();
    const { otp, qrPayload, verificationMethod = "QR_SCAN" } = body;

    await connectDb();

    let reservation = await Reservation.findOne({
      $or: [{ _id: params.id }, { reservationNumber: params.id }],
    });

    // If QR payload provided directly
    if (!reservation && qrPayload) {
      try {
        const decoded = JSON.parse(Buffer.from(qrPayload, "base64").toString());
        if (decoded?.resNum) {
          reservation = await Reservation.findOne({ reservationNumber: decoded.resNum });
        }
      } catch {}
    }

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (reservation.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This reservation has already been verified and completed." },
        { status: 400 }
      );
    }

    if (reservation.status === "CANCELLED" || reservation.status === "EXPIRED") {
      return NextResponse.json(
        { error: `Cannot verify a ${reservation.status.toLowerCase()} reservation.` },
        { status: 400 }
      );
    }

    // Verify OTP if OTP method used
    if (otp && reservation.pickupOtp !== otp.trim()) {
      return NextResponse.json({ error: "Invalid 6-digit pickup OTP" }, { status: 400 });
    }

    const now = new Date();
    reservation.status = "COMPLETED";
    reservation.visitedAt = reservation.visitedAt || now;
    reservation.completedAt = now;
    reservation.verificationMethod = verificationMethod;
    await reservation.save();

    // Create Verified Visit Record
    try {
      await Visit.create({
        shopId: reservation.shopId,
        shopName: reservation.shopName,
        userId: reservation.userId,
        userName: reservation.userName,
        userEmail: reservation.userEmail,
        reservationId: reservation._id.toString(),
        verificationMethod,
        totalSpent: reservation.totalAmount,
        reviewed: false,
      });

      // Log Conversion Footfall Event: PURCHASE_COMPLETED
      await FootfallEvent.create({
        shopId: reservation.shopId,
        userId: reservation.userId,
        reservationId: reservation._id.toString(),
        eventType: "PURCHASE_COMPLETED",
        verificationMethod,
        metadata: {
          reservationNumber: reservation.reservationNumber,
          totalAmount: reservation.totalAmount,
          advanceAmount: reservation.advanceAmount,
          inStorePaid: reservation.remainingAmount,
        },
      });
    } catch (e) {
      console.warn("Analytics recording warning", e);
    }

    return NextResponse.json({
      success: true,
      message: "Customer pickup and store visit verified successfully!",
      reservation: {
        ...reservation.toObject(),
        id: reservation._id.toString(),
      },
    });
  } catch (err: any) {
    console.error("[POST /api/reservations/:id/verify]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to verify reservation" }, { status: 500 });
  }
}
