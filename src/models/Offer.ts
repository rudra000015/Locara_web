import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOffer extends Document {
  shopId: string;
  shopName: string;
  title: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FLASH_SALE" | "OPENING_SPECIAL";
  discountValue: number; // e.g., 40 for 40% or 200 for ₹200
  badgeText: string; // e.g. "Up to 40% Off", "Flash Sale"
  applicableProducts: string[]; // product IDs or empty for all
  minOrderValue?: number;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "EXPIRED" | "SCHEDULED";
  flashSale?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED_AMOUNT", "FLASH_SALE", "OPENING_SPECIAL"],
      default: "PERCENTAGE",
    },
    discountValue: { type: Number, required: true },
    badgeText: { type: String, required: true, trim: true },
    applicableProducts: [{ type: String, trim: true }],
    minOrderValue: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "EXPIRED", "SCHEDULED"], default: "ACTIVE", index: true },
    flashSale: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

OfferSchema.index({ shopId: 1, status: 1 });
OfferSchema.index({ flashSale: 1, status: 1 });

export const Offer =
  (models.Offer || model<IOffer>("Offer", OfferSchema)) as mongoose.Model<IOffer>;
