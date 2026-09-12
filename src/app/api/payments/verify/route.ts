import { NextRequest, NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/provider";
import { connectDb } from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentId, signature, reservationId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: "Order ID and Payment ID are required" }, { status: 400 });
    }

    const verificationResult = await paymentProvider.verifyPayment({
      orderId,
      paymentId,
      signature: signature || `sig_test_${Date.now()}`,
      reservationId,
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || "Payment verification failed" },
        { status: 400 }
      );
    }

    if (reservationId) {
      await connectDb();
      const res = await Reservation.findOne({
        $or: [{ _id: reservationId }, { reservationNumber: reservationId }],
      });

      if (res) {
        res.status = "CONFIRMED";
        res.paymentStatus = "PAID";
        res.paymentTransactionId = paymentId;
        await res.save();
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: verificationResult.transactionId,
      verifiedAt: verificationResult.verifiedAt,
    });
  } catch (err: any) {
    console.error("[POST /api/payments/verify]", err?.message ?? err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
