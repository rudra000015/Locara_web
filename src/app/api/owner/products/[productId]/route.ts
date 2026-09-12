import { NextRequest, NextResponse } from "next/server";

import { extractBearerToken, verifyAuthToken } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
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

type Params = { params: { productId: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const productId = params.productId;
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

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

    const products = [...(doc.products ?? [])];
    const index = products.findIndex((product) => product.id === productId);
    if (index < 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const current = products[index];
    const next = { ...current };

    if (typeof body?.name === "string" && body.name.trim()) next.name = body.name.trim();
    if (typeof body?.price === "number" && Number.isFinite(body.price) && body.price > 0) {
      next.price = Math.round(body.price);
    }
    if (typeof body?.unit === "string" && body.unit.trim()) next.unit = body.unit.trim();
    if (typeof body?.description === "string") next.description = body.description.trim();
    if (typeof body?.category === "string") next.category = body.category.trim();
    if (typeof body?.inStock === "boolean") next.inStock = body.inStock;
    if (typeof body?.isNew === "boolean") next.isNew = body.isNew;
    if (typeof body?.image === "string") next.image = body.image.trim() || undefined;

    products[index] = next;
    doc.products = products;
    await doc.save();

    return NextResponse.json({
      product: next,
      products: doc.toObject().products ?? [],
    });
  } catch (err: any) {
    console.error("[PATCH /api/owner/products/:productId]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const productId = params.productId;
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    await connectDb();

    const doc = await ShopProfile.findOne({ ownerId: auth.payload.id }).sort({ updatedAt: -1 });
    if (!doc) {
      return NextResponse.json(
        { error: "No shop registered for this owner yet. Create your shop first on /register-shop." },
        { status: 404 }
      );
    }

    const before = doc.products?.length ?? 0;
    doc.products = (doc.products ?? []).filter((product) => product.id !== productId);
    if ((doc.products?.length ?? 0) === before) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await doc.save();

    return NextResponse.json({
      ok: true,
      products: doc.toObject().products ?? [],
    });
  } catch (err: any) {
    console.error("[DELETE /api/owner/products/:productId]", err?.message ?? err);
    return NextResponse.json({ error: "Unable to delete product" }, { status: 500 });
  }
}

