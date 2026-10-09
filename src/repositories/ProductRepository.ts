
import { connectDb } from '@/lib/mongodb';
import { Product, IProduct } from '@/models/Product';
import { SEED_PRODUCTS } from '@/data/seedVisualSearchData';

export class ProductRepository {
  async getProductById(productId: string): Promise<IProduct | any | null> {
    try {
      await connectDb();
      const product = await Product.findOne({ _id: productId, isActive: true }).lean();
      if (product) return product;
    } catch {}

    // Fallback to seed products
    const seed = SEED_PRODUCTS.find((p) => p.id === productId || p._id === productId);
    return seed || null;
  }

  async getProductsByShopId(shopId: string): Promise<any[]> {
    try {
      await connectDb();
      const products = await Product.find({ shopId, isActive: true }).lean();
      if (products.length > 0) return products;
    } catch {}

    return SEED_PRODUCTS.filter((p) => p.shopId === shopId);
  }

  async getProductsByIds(productIds: string[]): Promise<any[]> {
    try {
      await connectDb();
      const products = await Product.find({
        $or: [{ _id: { $in: productIds } }, { id: { $in: productIds } }],
        isActive: true,
      }).lean();
      if (products.length > 0) return products;
    } catch {}

    return SEED_PRODUCTS.filter((p) => productIds.includes(p.id) || productIds.includes(p._id));
  }

  async verifyProductAvailability(productId: string): Promise<{ available: boolean; stock: number }> {
    const product = await this.getProductById(productId);
    if (!product) return { available: false, stock: 0 };

    const inStock = product.inStock !== false;
    const stockCount = typeof product.stock === 'number' ? product.stock : 10;

    return {
      available: inStock && stockCount > 0,
      stock: stockCount,
    };
  }
}

export const productRepository = new ProductRepository();
