import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const id = params.id;

    const reservation = await Reservation.findOne({
      $or: [{ _id: id }, { reservationNumber: id }],
    }).lean();

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json({
      reservation: {
        ...reservation,
        id: reservation._id.toString(),
      },
    });
  } catch (err: any) {
    console.error("[GET /api/reservations/:id]", err?.message ?? err);
    return NextResponse.json({ error: "Failed to load reservation" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = verifyAuthToken(token);
    const body = await req.json();
    await connectDb();

    const reservation = await Reservation.findOne({
      $or: [{ _id: params.id }, { reservationNumber: params.id }],
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Cancellation request
    if (body.action === "CANCEL") {
      if (reservation.status === "COMPLETED" || reservation.status === "VISITED") {
        return NextResponse.json({ error: "Completed reservations cannot be cancelled" }, { status: 400 });
      }

      reservation.status = "CANCELLED";
      reservation.cancelledAt = new Date();
      reservation.cancelReason = body.reason || "User requested cancellation";
      await reservation.save();

      return NextResponse.json({
        success: true,
        reservation: {
          ...reservation.toObject(),
          id: reservation._id.toString(),
        },
      });
    }

    return NextResponse.json({ error: "Unsupported reservation update action" }, { status: 400 });
  } catch (err: any) {
    console.error("[PATCH /api/reservations/:id]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to update reservation" }, { status: 500 });
  }
}
