import { connectDb } from '@/lib/mongodb';
import { ProductVisualIndex, IProductVisualIndex } from '@/models/ProductVisualIndex';
import { embeddingProvider } from '@/providers/EmbeddingProvider';
import { SEED_VISUAL_INDEX } from '@/data/seedVisualSearchData';

export interface VectorSearchOptions {
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  shopId?: string;
  onlyAvailable?: boolean;
  limit?: number;
}

export interface VectorCandidateMatch {
  productId: string;
  shopId: string;
  imageId: string;
  imageUrl: string;
  productName: string;
  category: string;
  price: number;
  isAvailable: boolean;
  similarity: number;
  embeddingModel: string;
  embeddingVersion: string;
}

export class VisualIndexRepository {
  /**
   * Performs vector nearest-neighbor similarity search against the indexed product vectors.
   */
  async findSimilarProducts(
    queryEmbedding: number[],
    options: VectorSearchOptions = {}
  ): Promise<VectorCandidateMatch[]> {
    const {
      category,
      maxPrice,
      minPrice,
      shopId,
      onlyAvailable = true,
      limit = 25,
    } = options;

    let candidates: any[] = [];

    try {
      await connectDb();
      const filter: Record<string, any> = {};

      if (onlyAvailable) filter.isAvailable = true;
      if (category && category !== 'all') filter.category = new RegExp(category, 'i');
      if (shopId) filter.shopId = shopId;
      if (maxPrice !== undefined || minPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }

      candidates = await ProductVisualIndex.find(filter).lean();
    } catch {}

    // If database has no candidates yet, fall back to robust precomputed seed index
    if (!candidates || candidates.length === 0) {
      candidates = SEED_VISUAL_INDEX.filter((item) => {
        if (onlyAvailable && !item.isAvailable) return false;
        if (category && category !== 'all' && !item.category.toLowerCase().includes(category.toLowerCase()))
          return false;
        if (shopId && item.shopId !== shopId) return false;
        if (maxPrice !== undefined && item.price > maxPrice) return false;
        if (minPrice !== undefined && item.price < minPrice) return false;
        return true;
      });
    }

    // Compute exact Cosine Similarity for each candidate vector
    const scored: VectorCandidateMatch[] = candidates.map((c) => {
      const similarity = embeddingProvider.calculateCosineSimilarity(
        queryEmbedding,
        c.embedding
      );

      return {
        productId: c.productId,
        shopId: c.shopId,
        imageId: c.imageId,
        imageUrl: c.imageUrl,
        productName: c.productName,
        category: c.category,
        price: c.price,
        isAvailable: c.isAvailable !== false,
        similarity: Number(similarity.toFixed(4)),
        embeddingModel: c.embeddingModel || 'locara-multimodal-v1',
        embeddingVersion: c.embeddingVersion || '1.0.0',
      };
    });

    // Sort descending by vector similarity
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit);
  }

  /**
   * Upserts or indexes a single product image vector embedding.
   */
  async indexProductVector(payload: {
    productId: string;
    shopId: string;
    imageId: string;
    imageUrl: string;
    productName: string;
    embedding: number[];
    category: string;
    price: number;
    isAvailable?: boolean;
    location?: { type: 'Point'; coordinates: [number, number] };
  }): Promise<void> {
    try {
      await connectDb();
      await ProductVisualIndex.findOneAndUpdate(
        { productId: payload.productId, imageId: payload.imageId },
        {
          ...payload,
          embeddingModel: 'locara-multimodal-v1',
          embeddingVersion: '1.0.0',
          isAvailable: payload.isAvailable !== false,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[VisualIndexRepository] Indexing fallback warning:', err);
    }
  }
}

export const visualIndexRepository = new VisualIndexRepository();
