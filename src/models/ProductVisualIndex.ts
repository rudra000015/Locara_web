import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IProductVisualIndex extends Document {
  productId: string;
  shopId: string;
  imageId: string;
  imageUrl: string;
  productName: string;
  embedding: number[];
  embeddingModel: string;
  embeddingVersion: string;
  category: string;
  subcategory?: string;
  price: number;
  isAvailable: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductVisualIndexSchema = new Schema<IProductVisualIndex>(
  {
    productId: { type: String, required: true, index: true, trim: true },
    shopId: { type: String, required: true, index: true, trim: true },
    imageId: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => Array.isArray(v) && v.length > 0,
        message: "Vector embedding must be a non-empty array of numbers.",
      },
    },
    embeddingModel: { type: String, required: true, default: "locara-multimodal-v1" },
    embeddingVersion: { type: String, required: true, default: "1.0.0" },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [77.209, 28.6139], // [lng, lat]
      },
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

ProductVisualIndexSchema.index({ location: "2dsphere" });
ProductVisualIndexSchema.index({ category: 1, isAvailable: 1 });
ProductVisualIndexSchema.index({ shopId: 1, isAvailable: 1 });
ProductVisualIndexSchema.index({ embeddingModel: 1, embeddingVersion: 1 });

export const ProductVisualIndex =
  (models.ProductVisualIndex ||
    model<IProductVisualIndex>("ProductVisualIndex", ProductVisualIndexSchema)) as mongoose.Model<IProductVisualIndex>;
