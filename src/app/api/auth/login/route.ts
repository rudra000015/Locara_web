import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/mongodb";
import { findRoleAuthUserByEmail, upsertRoleAuthUser } from "@/lib/authStores";
import { User } from "@/models/User";
import { signAuthToken } from "@/lib/auth";

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password ?? "");
    const requestedRole = body?.role === "owner" ? "owner" : "explorer";
    const oppositeRole = requestedRole === "owner" ? "explorer" : "owner";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    await connectDb();
    let roleUser = await findRoleAuthUserByEmail(requestedRole, email);

    if (!roleUser) {
      const opposite = await findRoleAuthUserByEmail(oppositeRole, email);
      if (opposite) {
        return NextResponse.json(
          { error: `This account is registered as ${oppositeRole}. Please switch role and login again.` },
          { status: 403 }
        );
      }

      // Legacy fallback for existing users before role-based auth stores were introduced.
      const legacy = await User.findOne({ email });
      if (!legacy) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      if (legacy.role !== requestedRole) {
        return NextResponse.json(
          { error: `This account is registered as ${legacy.role}. Please switch role and login again.` },
          { status: 403 }
        );
      }
      if (!legacy.password) {
        return NextResponse.json(
          { error: "This account uses Google sign-in. Please continue with Google." },
          { status: 400 }
        );
      }

      const legacyOk = await bcrypt.compare(password, legacy.password);
      if (!legacyOk) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      await upsertRoleAuthUser(requestedRole, {
        userId: legacy._id,
        name: legacy.name,
        email: legacy.email,
        password: legacy.password,
        img: legacy.img,
        provider: legacy.provider,
        googleId: legacy.googleId,
      });

      roleUser = await findRoleAuthUserByEmail(requestedRole, email);
    }

    if (!roleUser) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!roleUser.password) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Please continue with Google." },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(password, roleUser.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = await User.findById(roleUser.userId);
    if (!user) {
      return NextResponse.json({ error: "User record not found. Please create account again." }, { status: 404 });
    }

    if (user.role !== requestedRole) {
      user.role = requestedRole;
      await user.save();
    }

    const token = signAuthToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
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
    console.error("Login error", error);
    return NextResponse.json({ error: "Unable to login user" }, { status: 500 });
  }
}
