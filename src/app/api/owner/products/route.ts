import { NextRequest, NextResponse } from "next/server";

import { extractBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { mapDbShopToShop } from "@/lib/shopMapper";
import { ShopProfile } from "@/models/ShopProfile";

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

function productId() {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const price = Number(body?.price);
    const unit = String(body?.unit ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Valid product price is required" }, { status: 400 });
    }
    if (!unit) {
      return NextResponse.json({ error: "Product unit is required" }, { status: 400 });
    }

    await connectDb();
    const doc = await ShopProfile.findOne({ ownerId: auth.payload.id }).sort({ updatedAt: -1 });
    if (!doc) {
      return NextResponse.json(
        { error: "No shop registered for this owner yet. Create your shop first on /register-shop." },
        { status: 404 }
      );
    }

    const nextProduct = {
      id: productId(),
      name,
      price: Math.round(price),
      unit,
      description: typeof body?.description === "string" ? body.description.trim() : undefined,
      category: typeof body?.category === "string" ? body.category.trim() : undefined,
      inStock: typeof body?.inStock === "boolean" ? body.inStock : true,
      isNew: typeof body?.isNew === "boolean" ? body.isNew : true,
      image: typeof body?.image === "string" && body.image.trim() ? body.image.trim() : undefined,
    };

    doc.products = [...(doc.products ?? []), nextProduct];
    await doc.save();

    const lean = doc.toObject();
    return NextResponse.json({
      product: nextProduct,
      shop: mapDbShopToShop(lean),
      products: lean.products ?? [],
    });
  } catch (err: any) {
    console.error("[POST /api/owner/products]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to add product" }, { status: 500 });
  }
}

