import { embeddingService } from './embeddingService';
import { visualIndexRepository, VectorCandidateMatch } from '@/repositories/VisualIndexRepository';
import { shopRepository } from '@/repositories/ShopRepository';
import { productRepository } from '@/repositories/ProductRepository';
import { getDistanceMeters } from '@/lib/geo';

export interface VisualSearchRequest {
  image?: string | Buffer;
  textQuery?: string;
  userLat?: number;
  userLng?: number;
  radiusMeters?: number;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  limit?: number;
}

export interface VisualSearchResultItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  stockCount: number;

  // Scores
  visualSimilarity: number; // 0..1
  visualMatchPercent: number; // e.g. 94%
  matchLabel: string; // "Best Visual Match" | "Very Similar Style" | "Similar Aesthetic"
  locationScore: number;
  availabilityScore: number;
  finalScore: number;

  // Shop details
  shop: {
    id: string;
    name: string;
    address: string;
    city: string;
    rating: number;
    photos: string[];
    distanceMeters?: number;
    distanceText?: string;
    lat: number;
    lng: number;
    isOpen: boolean;
  };
}

export class VisualSearchService {
  /**
   * Executes visual product search with multimodal embedding & hybrid ranking.
   */
  async executeVisualSearch(
    request: VisualSearchRequest
  ): Promise<{
    results: VisualSearchResultItem[];
    queryType: 'image' | 'text' | 'multimodal';
    model: string;
    version: string;
    totalMatched: number;
  }> {
    const {
      image,
      textQuery,
      userLat,
      userLng,
      category,
      maxPrice,
      minPrice,
      limit = 20,
    } = request;

    if (!image && !textQuery) {
      throw new Error('Please provide an image or text query for visual search.');
    }

    // 1. Generate query embedding
    const queryMeta = await embeddingService.generateQueryEmbedding({
      imageBuffer: image,
      textQuery,
    });

    // 2. Vector similarity candidate retrieval
    const candidateMatches = await visualIndexRepository.findSimilarProducts(
      queryMeta.embedding,
      {
        category,
        maxPrice,
        minPrice,
        onlyAvailable: true,
        limit: 40,
      }
    );

    // 3. Hydrate with shop metadata and calculate distance / hybrid ranking
    const hydratedResults: VisualSearchResultItem[] = [];

    for (const match of candidateMatches) {
      const shop = await shopRepository.getShopById(match.shopId);
      if (!shop) continue;

      const product = await productRepository.getProductById(match.productId);

      let distanceMeters: number | undefined;
      let locationScore = 0.5; // Default neutral location score if no GPS supplied

      const shopLat = shop.location?.coordinates?.[1] || 28.6515;
      const shopLng = shop.location?.coordinates?.[0] || 77.1906;

      if (userLat !== undefined && userLng !== undefined) {
        distanceMeters = Math.round(
          getDistanceMeters(userLat, userLng, shopLat, shopLng)
        );

        // Distance decay score: 1.0 at 0m, 0.5 at 7.5km, 0.0 at >= 15km
        locationScore = Math.max(0, Number((1 - distanceMeters / 15000).toFixed(4)));
      }

      const availabilityScore = match.isAvailable ? 1.0 : 0.0;
      const shopRating = shop.rating || 4.5;
      const shopQualityScore = Number((shopRating / 5.0).toFixed(4));

      // Hybrid Ranking Formulation:
      // FINAL_SCORE = visualSimilarity * 0.65 + locationScore * 0.15 + availabilityScore * 0.10 + shopQualityScore * 0.10
      const finalScore = Number(
        (
          match.similarity * 0.65 +
          locationScore * 0.15 +
          availabilityScore * 0.1 +
          shopQualityScore * 0.1
        ).toFixed(4)
      );

      const visualMatchPercent = Math.round(match.similarity * 100);
      const matchLabel = this.getDescriptiveMatchLabel(visualMatchPercent);

      hydratedResults.push({
        productId: match.productId,
        productName: match.productName || product?.name || 'Handcrafted Heritage Item',
        category: match.category || product?.category || 'Specialty',
        price: match.price || product?.price || 1200,
        imageUrl: match.imageUrl || product?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
        inStock: match.isAvailable,
        stockCount: product?.stock || 10,
        visualSimilarity: match.similarity,
        visualMatchPercent,
        matchLabel,
        locationScore,
        availabilityScore,
        finalScore,
        shop: {
          id: shop.shopId || match.shopId,
          name: shop.name || 'Locara Heritage Shop',
          address: shop.address || 'Central Market Area',
          city: shop.city || 'Delhi',
          rating: shop.rating || 4.8,
          photos: shop.photos || [],
          distanceMeters,
          distanceText: distanceMeters !== undefined ? this.formatDistance(distanceMeters) : undefined,
          lat: shopLat,
          lng: shopLng,
          isOpen: shop.isOpen !== false,
        },
      });
    }

    // Sort by hybrid final score descending
    hydratedResults.sort((a, b) => b.finalScore - a.finalScore);

    return {
      results: hydratedResults.slice(0, limit),
      queryType: queryMeta.type,
      model: queryMeta.model,
      version: queryMeta.version,
      totalMatched: hydratedResults.length,
    };
  }

  private getDescriptiveMatchLabel(percent: number): string {
    if (percent >= 90) return 'Best Visual Match';
    if (percent >= 80) return 'Very Similar Style';
    if (percent >= 70) return 'Similar Aesthetic';
    return 'Complementary Style';
  }

  private formatDistance(meters: number): string {
    if (meters < 1000) return `${meters}m away`;
    return `${(meters / 1000).toFixed(1)} km away`;
  }
}

export const visualSearchService = new VisualSearchService();
