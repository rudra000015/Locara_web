import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IDiscoveredBusinessCache extends Document {
  osmId: string;
  name: string;
  category: string;
  cuisine?: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  tags: Record<string, string>;
  isLocaraShop: false; // Explicitly false to prevent false inventory claims
  source: "openstreetmap";
  expiresAt: Date;
  createdAt: Date;
}

const DiscoveredBusinessCacheSchema = new Schema<IDiscoveredBusinessCache>(
  {
    osmId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    cuisine: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    openingHours: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    tags: { type: Map, of: String, default: {} },
    isLocaraShop: { type: Boolean, default: false },
    source: { type: String, default: "openstreetmap" },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24hr TTL cache
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

DiscoveredBusinessCacheSchema.index({ location: "2dsphere" });

export const DiscoveredBusinessCache =
  (models.DiscoveredBusinessCache ||
    model<IDiscoveredBusinessCache>(
      "DiscoveredBusinessCache",
      DiscoveredBusinessCacheSchema
    )) as mongoose.Model<IDiscoveredBusinessCache>;
