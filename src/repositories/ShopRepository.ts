import { connectDb } from '@/lib/mongodb';
import { ShopProfile, IShopProfile } from '@/models/ShopProfile';
import { SHOPS } from '@/data/shops';
import { SEED_LOCARA_SHOPS } from '@/data/seedVisualSearchData';

export interface ShopFilterOptions {
  city?: string;
  category?: string;
  lat?: number;
  lng?: number;
  maxDistanceMeters?: number;
  limit?: number;
}

export class ShopRepository {
  async getShopById(shopId: string): Promise<IShopProfile | any | null> {
    try {
      await connectDb();
      const shop = await ShopProfile.findOne({ shopId }).lean();
      if (shop) return shop;
    } catch {}

    // Check seed visual search shops
    const seedShop = SEED_LOCARA_SHOPS.find((s) => s.id === shopId);
    if (seedShop) {
      return {
        shopId: seedShop.id,
        name: seedShop.name,
        description: seedShop.tagline,
        address: seedShop.addr,
        city: seedShop.city,
        category: seedShop.category,
        rating: seedShop.rating,
        totalRatings: seedShop.reviewsCount,
        photos: seedShop.photos,
        location: {
          type: 'Point',
          coordinates: [seedShop.lng, seedShop.lat],
        },
        isOpen: seedShop.isOpen,
      };
    }

    // Fallback to static shops dataset
    const staticShop = SHOPS.find((s) => s.id === shopId);
    if (staticShop) {
      return {
        shopId: staticShop.id,
        name: staticShop.name,
        description: staticShop.story || 'Heritage boutique in historic marketplace',
        address: staticShop.addr,
        city: 'Delhi',
        category: staticShop.cat,
        rating: staticShop.rating,
        totalRatings: staticShop.totalRatings || staticShop.reviews?.length || 42,
        photos: staticShop.photos || staticShop.images || [],
        products: staticShop.products?.map((item, idx) => ({
          id: item.id || `item_${idx}`,
          name: item.name,
          price: item.price,
          unit: item.unit || 'piece',
          inStock: item.inStock !== false,
          isNew: item.isNew !== false,
          image: item.image,
        })),
        location: {
          type: 'Point',
          coordinates: [staticShop.loc[1], staticShop.loc[0]], // [lng, lat]
        },
        isOpen: staticShop.openNow !== false,
      };
    }

    return null;
  }

  async getNearbyShops(options: ShopFilterOptions): Promise<any[]> {
    const { lat, lng, maxDistanceMeters = 15000, city, category, limit = 50 } = options;

    try {
      await connectDb();
      const query: Record<string, any> = {};

      if (city) {
        query.city = new RegExp(`^${city}$`, 'i');
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      if (lat !== undefined && lng !== undefined) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistanceMeters,
          },
        };
      }

      const shops = await ShopProfile.find(query).limit(limit).lean();
      if (shops.length > 0) return shops;
    } catch {}

    // Static fallback
    return SHOPS.map((s) => ({
      shopId: s.id,
      name: s.name,
      description: s.story,
      address: s.addr,
      city: 'Delhi',
      category: s.cat,
      rating: s.rating,
      totalRatings: s.totalRatings || s.reviews?.length || 42,
      photos: s.photos || s.images || [],
      location: {
        type: 'Point',
        coordinates: [s.loc[1], s.loc[0]],
      },
      isOpen: s.openNow !== false,
    }));
  }
}

export const shopRepository = new ShopRepository();
