import { connectDb } from '@/lib/mongodb';
import { overpassProvider, DiscoveredOSMBusiness } from '@/providers/OverpassBusinessDiscoveryProvider';
import { DiscoveredBusinessCache } from '@/models/DiscoveredBusinessCache';
import { shopRepository } from '@/repositories/ShopRepository';
import { getDistanceMeters } from '@/lib/geo';

export interface UnifiedBusinessItem {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  rating?: number;
  isLocaraShop: boolean;
  hasVisualInventory: boolean;
  distanceMeters?: number;
  distanceText?: string;
}

export class BusinessDiscoveryService {
  /**
   * Discovers all commercial businesses and Locara boutiques around given coordinates.
   */
  async discoverNearby(
    lat: number,
    lng: number,
    radiusMeters: number = 3000
  ): Promise<UnifiedBusinessItem[]> {
    const unified: UnifiedBusinessItem[] = [];

    // 1. Fetch Locara registered shops
    const locaraShops = await shopRepository.getNearbyShops({
      lat,
      lng,
      maxDistanceMeters: radiusMeters,
      limit: 25,
    });

    for (const shop of locaraShops) {
      const sLat = shop.location?.coordinates?.[1] || lat;
      const sLng = shop.location?.coordinates?.[0] || lng;
      const distance = Math.round(getDistanceMeters(lat, lng, sLat, sLng));

      unified.push({
        id: shop.shopId || shop._id?.toString(),
        name: shop.name,
        category: shop.category || 'Heritage Boutique',
        address: shop.address || 'Marketplace Lane',
        city: shop.city || 'Delhi',
        lat: sLat,
        lng: sLng,
        phone: shop.phone,
        website: shop.website,
        rating: shop.rating || 4.8,
        isLocaraShop: true,
        hasVisualInventory: true,
        distanceMeters: distance,
        distanceText: distance < 1000 ? `${distance}m away` : `${(distance / 1000).toFixed(1)} km away`,
      });
    }

    // 2. Fetch or retrieve cached OpenStreetMap businesses
    let osmBusinesses: DiscoveredOSMBusiness[] = [];

    try {
      await connectDb();
      const cached = await DiscoveredBusinessCache.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusMeters,
          },
        },
      })
        .limit(20)
        .lean();

      if (cached && cached.length > 0) {
        osmBusinesses = cached.map((c) => ({
          osmId: c.osmId,
          name: c.name,
          category: c.category,
          lat: c.location.coordinates[1],
          lng: c.location.coordinates[0],
          address: c.address,
          city: c.city,
          phone: c.phone,
          website: c.website,
          tags: (c.tags as any) || {},
          isLocaraShop: false,
        }));
      }
    } catch {}

    if (osmBusinesses.length === 0) {
      osmBusinesses = await overpassProvider.discoverNearbyBusinesses(lat, lng, radiusMeters);

      // Async cache to MongoDB
      void this.cacheDiscoveredBusinesses(osmBusinesses);
    }

    // Merge OSM businesses with Locara shops
    for (const osm of osmBusinesses) {
      const distance = Math.round(getDistanceMeters(lat, lng, osm.lat, osm.lng));

      unified.push({
        id: osm.osmId,
        name: osm.name,
        category: osm.category,
        address: osm.address || 'Local Bazaar Road',
        city: osm.city || 'Local City',
        lat: osm.lat,
        lng: osm.lng,
        phone: osm.phone,
        website: osm.website,
        isLocaraShop: false,
        hasVisualInventory: false,
        distanceMeters: distance,
        distanceText: distance < 1000 ? `${distance}m away` : `${(distance / 1000).toFixed(1)} km away`,
      });
    }

    // Sort by distance ascending
    unified.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

    return unified;
  }

  private async cacheDiscoveredBusinesses(businesses: DiscoveredOSMBusiness[]): Promise<void> {
    try {
      await connectDb();
      for (const b of businesses) {
        await DiscoveredBusinessCache.findOneAndUpdate(
          { osmId: b.osmId },
          {
            osmId: b.osmId,
            name: b.name,
            category: b.category,
            address: b.address,
            city: b.city,
            phone: b.phone,
            website: b.website,
            location: {
              type: 'Point',
              coordinates: [b.lng, b.lat],
            },
            tags: b.tags,
            isLocaraShop: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          { upsert: true }
        );
      }
    } catch {}
  }
}

export const businessDiscoveryService = new BusinessDiscoveryService();
