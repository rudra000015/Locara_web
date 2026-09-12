import { NextRequest, NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/provider";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    let userId = "guest_explorer";
    let userName = "Locara Explorer";
    let userEmail = "";

    if (token) {
      try {
        const auth = verifyAuthToken(token);
        userId = auth.id;
        userEmail = auth.email;
      } catch {}
    }

    const body = await req.json();
    const {
      reservationId,
      amount,
      shopId,
      shopName,
      customerName,
      customerPhone,
      customerEmail,
      description,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const orderResult = await paymentProvider.createPaymentOrder({
      orderId,
      reservationId: reservationId || `temp_${Date.now()}`,
      amount: Math.round(amount),
      currency: "INR",
      customer: {
        id: userId,
        name: customerName || userName,
        email: customerEmail || userEmail,
        phone: customerPhone || "",
      },
      shop: {
        id: shopId || "shop_generic",
        name: shopName || "Heritage Store",
      },
      description: description || `10% Advance Reservation at ${shopName || "Heritage Store"}`,
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
    });
  } catch (err: any) {
    console.error("[POST /api/payments/create]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to create payment order" }, { status: 500 });
  }
}
