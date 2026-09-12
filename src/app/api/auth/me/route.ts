import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { User } from "@/models/User";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    await connectDb();

    const user = await User.findById(payload.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        img: user.img,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
