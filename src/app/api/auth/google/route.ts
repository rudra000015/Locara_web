import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDb } from "@/lib/mongodb";
import { upsertRoleAuthUser } from "@/lib/authStores";
import { User } from "@/models/User";
import { signAuthToken } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const credential = String(body?.credential ?? "").trim();
    const requestedRole = body?.role === "owner" ? "owner" : "explorer";

    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID || !googleClient) {
      return NextResponse.json(
        { error: "Google auth is not configured. Set GOOGLE_CLIENT_ID (or NEXT_PUBLIC_GOOGLE_CLIENT_ID)." },
        { status: 500 }
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase().trim();
    const name = payload?.name?.trim() || "Google User";
    const picture = payload?.picture || undefined;
    const googleId = payload?.sub;
    const emailVerified = payload?.email_verified === true;

    if (!googleId || !email || !emailVerified) {
      return NextResponse.json({ error: "Unable to verify Google account" }, { status: 401 });
    }

    await connectDb();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: requestedRole,
        img: picture,
        provider: "google",
        googleId,
      });
    } else {
      let changed = false;
      if (requestedRole !== user.role) {
        user.role = requestedRole;
        changed = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (!user.img && picture) {
        user.img = picture;
        changed = true;
      }
      if (user.provider !== "google") {
        user.provider = "google";
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    const token = signAuthToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await upsertRoleAuthUser(user.role, {
      userId: user._id,
      name: user.name,
      email: user.email,
      img: user.img,
      provider: "google",
      googleId: user.googleId,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        img: user.img,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error", error);
    const message = error instanceof Error ? error.message : "Google sign-in failed";
    if (/audience/i.test(message)) {
      return NextResponse.json(
        { error: "Google client mismatch. Check GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_CLIENT_ID." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: message || "Google sign-in failed" }, { status: 500 });
  }
}
