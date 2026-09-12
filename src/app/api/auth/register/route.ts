import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/mongodb";
import { signAuthToken } from "@/lib/auth";
import { upsertRoleAuthUser } from "@/lib/authStores";
import { User } from "@/models/User";

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password ?? "");
    const role = body?.role;
    const img = body?.img;
    const requestedRole = role === "owner" ? "owner" : "explorer";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, and a number" },
        { status: 400 }
      );
    }

    await connectDb();

    const normalizedEmail = email;
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.password) {
        if (requestedRole === "owner" && existingUser.role !== "owner") {
          const samePassword = await bcrypt.compare(password, existingUser.password);
          if (samePassword) {
            existingUser.role = "owner";
            if (!existingUser.name && name) existingUser.name = name;
            if (!existingUser.img) {
              existingUser.img =
                img || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(normalizedEmail)}`;
            }
            await existingUser.save();
            await upsertRoleAuthUser("owner", {
              userId: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              password: existingUser.password,
              img: existingUser.img,
              provider: existingUser.provider,
              googleId: existingUser.googleId,
            });

            const token = signAuthToken({
              id: existingUser._id.toString(),
              email: existingUser.email,
              role: existingUser.role,
            });

            return NextResponse.json({
              user: {
                id: existingUser._id.toString(),
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                img: existingUser.img,
              },
              token,
            });
          }
        }

        return NextResponse.json({ error: "Email already registered. Please sign in." }, { status: 409 });
      }

      // Existing Google-only account: securely link password auth without removing Google option.
      existingUser.password = await bcrypt.hash(password, 10);
      if (requestedRole === "owner") {
        existingUser.role = "owner";
      }
      if (!existingUser.name && name) existingUser.name = name;
      if (!existingUser.img) {
        existingUser.img =
          img || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(normalizedEmail)}`;
      }
      await existingUser.save();
      await upsertRoleAuthUser(requestedRole, {
        userId: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        password: existingUser.password,
        img: existingUser.img,
        provider: existingUser.provider,
        googleId: existingUser.googleId,
      });

      const token = signAuthToken({
        id: existingUser._id.toString(),
        email: existingUser.email,
        role: existingUser.role,
      });

      return NextResponse.json({
        user: {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          img: existingUser.img,
        },
        token,
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: requestedRole,
      provider: "credentials",
      img: img || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(normalizedEmail)}`,
    });

    await upsertRoleAuthUser(requestedRole, {
      userId: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      img: user.img,
      provider: user.provider,
      googleId: user.googleId,
    });

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
    console.error("Register error", error);
    return NextResponse.json({ error: "Unable to register user" }, { status: 500 });
  }
}
