import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IProductImage {
  url: string;
  embeddingId?: string;
  embeddingModel?: string;
  embeddingVersion?: string;
  width?: number;
  height?: number;
  createdAt: Date;
}

export interface IProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  price?: number;
  sku?: string;
}

export interface IProduct extends Document {
  shopId: string;
  name: string;
  normalizedName: string;
  description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number;
  unit: string;
  inStock: boolean;
  stock: number;
  isNewItem: boolean;
  isActive: boolean;
  variants: IProductVariant[];
  images: IProductImage[];
  visualSearch: {
    enabled: boolean;
    primaryEmbeddingId?: string;
    embeddingModel?: string;
    embeddingVersion?: string;
    indexedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true, trim: true },
    embeddingId: { type: String, trim: true },
    embeddingModel: { type: String, trim: true },
    embeddingVersion: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    id: { type: String, required: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    stock: { type: Number, default: 10 },
    price: { type: Number },
    sku: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    shopId: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true, index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "piece", trim: true },
    inStock: { type: Boolean, default: true, index: true },
    stock: { type: Number, default: 15 },
    isNewItem: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    variants: [ProductVariantSchema],
    images: [ProductImageSchema],
    visualSearch: {
      enabled: { type: Boolean, default: true, index: true },
      primaryEmbeddingId: { type: String, trim: true },
      embeddingModel: { type: String, trim: true },
      embeddingVersion: { type: String, trim: true },
      indexedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

ProductSchema.index({ shopId: 1, isActive: 1, inStock: 1 });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ tags: 1 });

export const Product =
  (models.Product || model<IProduct>("Product", ProductSchema)) as mongoose.Model<IProduct>;
