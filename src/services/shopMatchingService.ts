import { VisualSearchResultItem } from './visualSearchService';

export interface ShopVisualMatchCluster {
  shopId: string;
  shopName: string;
  address: string;
  city: string;
  rating: number;
  lat: number;
  lng: number;
  distanceMeters?: number;
  distanceText?: string;
  totalMatches: number;
  highestSimilarity: number;
  highestMatchPercent: number;
  bestMatchLabel: string;
  matchingProducts: Array<{
    productId: string;
    productName: string;
    price: number;
    imageUrl: string;
    similarity: number;
    matchPercent: number;
  }>;
}

export class ShopMatchingService {
  /**
   * Clusters visual search product results by physical shop for map display.
   */
  clusterMatchesByShop(results: VisualSearchResultItem[]): ShopVisualMatchCluster[] {
    const shopMap = new Map<string, ShopVisualMatchCluster>();

    for (const item of results) {
      const shopId = item.shop.id;

      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, {
          shopId,
          shopName: item.shop.name,
          address: item.shop.address,
          city: item.shop.city,
          rating: item.shop.rating,
          lat: item.shop.lat,
          lng: item.shop.lng,
          distanceMeters: item.shop.distanceMeters,
          distanceText: item.shop.distanceText,
          totalMatches: 0,
          highestSimilarity: item.visualSimilarity,
          highestMatchPercent: item.visualMatchPercent,
          bestMatchLabel: item.matchLabel,
          matchingProducts: [],
        });
      }

      const cluster = shopMap.get(shopId)!;
      cluster.totalMatches += 1;

      if (item.visualSimilarity > cluster.highestSimilarity) {
        cluster.highestSimilarity = item.visualSimilarity;
        cluster.highestMatchPercent = item.visualMatchPercent;
        cluster.bestMatchLabel = item.matchLabel;
      }

      cluster.matchingProducts.push({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        imageUrl: item.imageUrl,
        similarity: item.visualSimilarity,
        matchPercent: item.visualMatchPercent,
      });
    }

    const clusters = Array.from(shopMap.values());
    // Sort by highest similarity descending, then distance ascending
    clusters.sort((a, b) => {
      if (b.highestSimilarity !== a.highestSimilarity) {
        return b.highestSimilarity - a.highestSimilarity;
      }
      return (a.distanceMeters || 0) - (b.distanceMeters || 0);
    });

    return clusters;
  }
}

export const shopMatchingService = new ShopMatchingService();
