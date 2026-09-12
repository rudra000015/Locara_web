import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IShopProfile extends Document {
  shopId: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName?: string;
  ownerEmail?: string;
  ownerImg?: string;

  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;

  category?: string;
  tags?: string[];
  specialties?: string[];
  tagline?: string;

  est?: number;
  age?: number;
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  rating?: number;
  totalRatings?: number;

  photos?: string[];
  products?: Array<{
    id: string;
    name: string;
    price: number;
    unit: string;
    description?: string;
    category?: string;
    inStock: boolean;
    isNew: boolean;
    image?: string;
  }>;

  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };

  createdAt: Date;
  updatedAt: Date;
}

const ShopProfileSchema = new Schema<IShopProfile>(
  {
    shopId: { type: String, required: true, unique: true, trim: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerName: { type: String, trim: true },
    ownerEmail: { type: String, trim: true, lowercase: true },
    ownerImg: { type: String, trim: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: "India" },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },

    category: { type: String, trim: true, default: "general", index: true },
    tags: [{ type: String, trim: true }],
    specialties: [{ type: String, trim: true }],
    tagline: { type: String, trim: true },

    est: { type: Number },
    age: { type: Number },
    isOpen: { type: Boolean, default: null },
    openTime: { type: String, trim: true, default: "09:00" },
    closeTime: { type: String, trim: true, default: "21:00" },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    photos: [{ type: String, trim: true }],
    products: [
      new Schema(
        {
          id: { type: String, required: true, trim: true },
          name: { type: String, required: true, trim: true },
          price: { type: Number, required: true },
          unit: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          category: { type: String, trim: true },
          inStock: { type: Boolean, default: true },
          isNew: { type: Boolean, default: true },
          image: { type: String, trim: true },
        },
        {
          _id: false,
          suppressReservedKeysWarning: true,
        }
      ),
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [77.7064, 28.9845], // [lng, lat]
        validate: {
          validator: (value: number[]) => {
            if (!Array.isArray(value) || value.length !== 2) return false;
            const [lng, lat] = value;
            const validLng = Number.isFinite(lng) && lng >= -180 && lng <= 180;
            const validLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
            return validLng && validLat;
          },
          message: "Location coordinates must be [lng, lat] within valid ranges.",
        },
      },
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

ShopProfileSchema.index({ location: "2dsphere" });
ShopProfileSchema.index({ ownerId: 1, updatedAt: -1 });
ShopProfileSchema.index({ ownerEmail: 1 });

export const ShopProfile = (models.ShopProfile || model<IShopProfile>("ShopProfile", ShopProfileSchema)) as mongoose.Model<IShopProfile>;
