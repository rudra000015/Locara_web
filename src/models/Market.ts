import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IMarket extends Document {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  state: string;
  coverImage: string;
  photos: string[];
  shopCount: number;
  categories: string[];
  specialties: string[];
  historicalEra: string;
  popularTimings: string;
  location: {
    lat: number;
    lng: number;
  };
  featuredShops: string[]; // shop IDs or names
  createdAt: Date;
  updatedAt: Date;
}

const MarketSchema = new Schema<IMarket>(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true, trim: true },
    photos: [{ type: String, trim: true }],
    shopCount: { type: Number, default: 0 },
    categories: [{ type: String, trim: true }],
    specialties: [{ type: String, trim: true }],
    historicalEra: { type: String, trim: true },
    popularTimings: { type: String, trim: true, default: "10:30 AM - 09:30 PM" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    featuredShops: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

export const Market =
  (models.Market || model<IMarket>("Market", MarketSchema)) as mongoose.Model<IMarket>;
