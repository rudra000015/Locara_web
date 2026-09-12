import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICollectionProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface ICollection extends Document {
  shopId: string;
  shopName: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  tag: string; // e.g., "Festive", "Wedding", "Summer", "New Arrivals", "Under ₹999"
  products: ICollectionProduct[];
  status: "ACTIVE" | "ARCHIVED";
  startDate?: Date;
  endDate?: Date;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionProductSchema = new Schema<ICollectionProduct>(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    image: { type: String, trim: true },
    category: { type: String, trim: true },
  },
  { _id: false }
);

const CollectionSchema = new Schema<ICollection>(
  {
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    coverImage: { type: String, required: true, trim: true },
    tag: { type: String, trim: true, default: "New Arrivals" },
    products: { type: [CollectionProductSchema], default: [] },
    status: { type: String, enum: ["ACTIVE", "ARCHIVED"], default: "ACTIVE", index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ shopId: 1, status: 1 });

export const Collection =
  (models.Collection || model<ICollection>("Collection", CollectionSchema)) as mongoose.Model<ICollection>;
