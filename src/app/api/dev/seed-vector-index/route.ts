import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { ProductVisualIndex } from '@/models/ProductVisualIndex';
import { ShopProfile } from '@/models/ShopProfile';
import { SEED_LOCARA_SHOPS, SEED_PRODUCTS, SEED_VISUAL_INDEX } from '@/data/seedVisualSearchData';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    // 1. Seed Locara Shops
    for (const shop of SEED_LOCARA_SHOPS) {
      await ShopProfile.findOneAndUpdate(
        { shopId: shop.id },
        {
          shopId: shop.id,
          name: shop.name,
          category: shop.category,
          tagline: shop.tagline,
          address: shop.addr,
          city: shop.city,
          rating: shop.rating,
          totalRatings: shop.reviewsCount,
          photos: shop.photos,
          isOpen: shop.isOpen,
          location: {
            type: 'Point',
            coordinates: [shop.lng, shop.lat],
          },
        },
        { upsert: true }
      );
    }

    // 2. Seed Products
    for (const prod of SEED_PRODUCTS) {
      await Product.findOneAndUpdate(
        { _id: prod.id },
        {
          _id: prod.id,
          shopId: prod.shopId,
          name: prod.name,
          normalizedName: prod.normalizedName,
          description: prod.description,
          category: prod.category,
          subcategory: prod.subcategory,
          price: prod.price,
          unit: prod.unit,
          stock: prod.stock,
          inStock: prod.inStock,
          isActive: true,
          images: prod.images.map((img: any) => ({
            url: img.url,
            embeddingId: img.embeddingId,
            embeddingModel: 'locara-multimodal-v1',
            embeddingVersion: '1.0.0',
            createdAt: new Date(),
          })),
          tags: prod.tags,
          visualSearch: prod.visualSearch,
        },
        { upsert: true }
      );
    }

    // 3. Seed Vector Index
    for (const vec of SEED_VISUAL_INDEX) {
      await ProductVisualIndex.findOneAndUpdate(
        { productId: vec.productId, imageId: vec.imageId },
        {
          productId: vec.productId,
          shopId: vec.shopId,
          imageId: vec.imageId,
          imageUrl: vec.imageUrl,
          productName: vec.productName,
          category: vec.category,
          subcategory: vec.subcategory,
          price: vec.price,
          isAvailable: vec.isAvailable,
          embedding: vec.embedding,
          embeddingModel: vec.embeddingModel,
          embeddingVersion: vec.embeddingVersion,
          location: vec.location,
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      indexedShops: SEED_LOCARA_SHOPS.length,
      indexedProducts: SEED_PRODUCTS.length,
      indexedVectors: SEED_VISUAL_INDEX.length,
      message: 'Locara visual search vector index successfully populated.',
    });
  } catch (err: any) {
    console.error('[POST /api/dev/seed-vector-index]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Failed to seed vector index' },
      { status: 500 }
    );
  }
}
