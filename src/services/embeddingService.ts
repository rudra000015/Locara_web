import { embeddingProvider } from '@/providers/EmbeddingProvider';
import { visualIndexRepository } from '@/repositories/VisualIndexRepository';

export interface ProcessImageEmbeddingParams {
  productId: string;
  shopId: string;
  imageId: string;
  imageUrl: string;
  productName: string;
  category: string;
  price: number;
  isAvailable?: boolean;
  imageBuffer?: Buffer;
  location?: { type: 'Point'; coordinates: [number, number] };
}

export class EmbeddingService {
  /**
   * Generates a visual vector embedding for an image and indexes it in the vector collection.
   */
  async processAndIndexProductImage(params: ProcessImageEmbeddingParams): Promise<number[]> {
    const input = params.imageBuffer || params.imageUrl || params.productName;
    const embedding = await embeddingProvider.generateImageEmbedding(input);

    await visualIndexRepository.indexProductVector({
      productId: params.productId,
      shopId: params.shopId,
      imageId: params.imageId,
      imageUrl: params.imageUrl,
      productName: params.productName,
      embedding,
      category: params.category,
      price: params.price,
      isAvailable: params.isAvailable !== false,
      location: params.location,
    });

    return embedding;
  }

  /**
   * Generates a query vector embedding from user uploaded image or text.
   */
  async generateQueryEmbedding(input: {
    imageBuffer?: Buffer | string;
    textQuery?: string;
  }): Promise<{ embedding: number[]; model: string; version: string; type: 'image' | 'text' | 'multimodal' }> {
    const modelInfo = embeddingProvider.getModelInfo();

    if (input.imageBuffer && input.textQuery) {
      const imgVec = await embeddingProvider.generateImageEmbedding(input.imageBuffer);
      const txtVec = await embeddingProvider.generateTextEmbedding(input.textQuery);

      // Blend multimodal vectors (70% image visual intent, 30% text filter intent)
      const blended = imgVec.map((val, idx) => val * 0.7 + txtVec[idx] * 0.3);
      const norm = Math.sqrt(blended.reduce((acc, v) => acc + v * v, 0)) || 1;
      const normalized = blended.map((v) => Number((v / norm).toFixed(6)));

      return {
        embedding: normalized,
        model: modelInfo.model,
        version: modelInfo.version,
        type: 'multimodal',
      };
    }

    if (input.imageBuffer) {
      const embedding = await embeddingProvider.generateImageEmbedding(input.imageBuffer);
      return {
        embedding,
        model: modelInfo.model,
        version: modelInfo.version,
        type: 'image',
      };
    }

    const embedding = await embeddingProvider.generateTextEmbedding(input.textQuery || '');
    return {
      embedding,
      model: modelInfo.model,
      version: modelInfo.version,
      type: 'text',
    };
  }
}

export const embeddingService = new EmbeddingService();
