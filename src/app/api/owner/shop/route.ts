import { NextRequest, NextResponse } from "next/server";

import { extractBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { mapDbShopToShop } from "@/lib/shopMapper";
import { ShopProfile } from "@/models/ShopProfile";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function toOwnerEditorProfile(doc: any) {
  const coords = Array.isArray(doc?.location?.coordinates) ? doc.location.coordinates : [];
  const lng = coords.length === 2 ? Number(coords[0]) : undefined;
  const lat = coords.length === 2 ? Number(coords[1]) : undefined;

  return {
    tagline: doc?.tagline ?? "",
    description: doc?.description ?? "",
    phone: doc?.phone ?? "",
    email: doc?.ownerEmail ?? "",
    website: doc?.website ?? "",
    openTime: doc?.openTime ?? "09:00",
    closeTime: doc?.closeTime ?? "21:00",
    isOpen: typeof doc?.isOpen === "boolean" ? doc.isOpen : true,
    specialties: Array.isArray(doc?.specialties) ? doc.specialties : [],
    coverImage: Array.isArray(doc?.photos) && doc.photos.length ? doc.photos[0] : undefined,
    profileImage: doc?.ownerImg ?? undefined,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  };
}

async function requireOwner(request: NextRequest) {
  const token = extractBearerToken(request);
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  try {
    const payload = verifyAuthToken(token);
    if (payload.role !== "owner") {
      return { error: NextResponse.json({ error: "Only owners can access this route" }, { status: 403 }) };
    }
    return { payload };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  try {
    await connectDb();

    const doc = await ShopProfile.findOne({ ownerId: auth.payload.id }).sort({ updatedAt: -1 }).lean();
    if (!doc) {
      return NextResponse.json(
        { error: "No shop registered for this owner yet. Create your shop first on /register-shop." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shop: mapDbShopToShop(doc),
      ownerProfile: toOwnerEditorProfile(doc),
    });
  } catch (err: any) {
    console.error("[GET /api/owner/shop]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to load owner shop" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    await connectDb();

    const doc = await ShopProfile.findOne({ ownerId: auth.payload.id }).sort({ updatedAt: -1 });
    if (!doc) {
      return NextResponse.json(
        { error: "No shop registered for this owner yet. Create your shop first on /register-shop." },
        { status: 404 }
      );
    }

    if (typeof body?.name === "string" && body.name.trim()) doc.name = body.name.trim();
    if (typeof body?.description === "string") doc.description = body.description.trim();
    if (typeof body?.tagline === "string") doc.tagline = body.tagline.trim();
    if (typeof body?.phone === "string") doc.phone = body.phone.trim();
    if (typeof body?.email === "string") doc.ownerEmail = body.email.trim().toLowerCase();
    if (typeof body?.website === "string") doc.website = body.website.trim();
    if (typeof body?.category === "string" && body.category.trim()) doc.category = body.category.trim();
    if (typeof body?.address === "string") doc.address = body.address.trim();
    if (typeof body?.city === "string") doc.city = body.city.trim();
    if (typeof body?.state === "string") doc.state = body.state.trim();
    if (typeof body?.country === "string") doc.country = body.country.trim();
    if (typeof body?.openTime === "string" && body.openTime.trim()) doc.openTime = body.openTime.trim();
    if (typeof body?.closeTime === "string" && body.closeTime.trim()) doc.closeTime = body.closeTime.trim();
    if (typeof body?.isOpen === "boolean") doc.isOpen = body.isOpen;

    if (Array.isArray(body?.specialties)) {
      doc.specialties = body.specialties
        .map((value: unknown) => String(value ?? "").trim())
        .filter(Boolean)
        .slice(0, 30);
    }

    if (typeof body?.profileImage === "string" && body.profileImage.trim()) {
      doc.ownerImg = body.profileImage.trim();
    }

    if (typeof body?.coverImage === "string" && body.coverImage.trim()) {
      const cover = body.coverImage.trim();
      const photos = Array.isArray(doc.photos) ? [...doc.photos] : [];
      if (photos.length) photos[0] = cover;
      else photos.push(cover);
      doc.photos = photos;
    }

    const lat = typeof body?.lat === "number" && Number.isFinite(body.lat) ? body.lat : undefined;
    const lng = typeof body?.lng === "number" && Number.isFinite(body.lng) ? body.lng : undefined;
    const coordsProvided = body?.lat !== undefined || body?.lng !== undefined;
    if (coordsProvided) {
      if (lat === undefined || lng === undefined) {
        return badRequest("Latitude and longitude must be valid numbers");
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return badRequest("Latitude must be between -90 and 90, longitude between -180 and 180");
      }
      doc.location = { type: "Point", coordinates: [lng, lat] };
    }

    await doc.save();
    const lean = doc.toObject();

    return NextResponse.json({
      shop: mapDbShopToShop(lean),
      ownerProfile: toOwnerEditorProfile(lean),
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return badRequest(err.message ?? "Invalid input");
    }
    console.error("[PATCH /api/owner/shop]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to update shop profile" }, { status: 500 });
  }
}
