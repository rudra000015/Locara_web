import mongoose, { Schema, Document, model, models } from "mongoose";

export type FootfallEventType =
  | "MAP_DISCOVERY"
  | "SHOP_VIEW"
  | "PRODUCT_VIEW"
  | "RESERVED"
  | "NAVIGATION_STARTED"
  | "GEOFENCE_ENTERED"
  | "VISIT_CONFIRMED"
  | "PURCHASE_COMPLETED";

export interface IFootfallEvent extends Document {
  shopId: string;
  userId?: string;
  reservationId?: string;
  eventType: FootfallEventType;
  verificationMethod?: "QR_SCAN" | "OTP" | "SELLER_MANUAL" | "GEOFENCE";
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IVisit extends Document {
  shopId: string;
  shopName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  reservationId?: string;
  verificationMethod: "QR_SCAN" | "OTP" | "SELLER_MANUAL";
  totalSpent?: number;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FootfallEventSchema = new Schema<IFootfallEvent>(
  {
    shopId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    reservationId: { type: String, index: true },
    eventType: {
      type: String,
      enum: [
        "MAP_DISCOVERY",
        "SHOP_VIEW",
        "PRODUCT_VIEW",
        "RESERVED",
        "NAVIGATION_STARTED",
        "GEOFENCE_ENTERED",
        "VISIT_CONFIRMED",
        "PURCHASE_COMPLETED",
      ],
      required: true,
      index: true,
    },
    verificationMethod: {
      type: String,
      enum: ["QR_SCAN", "OTP", "SELLER_MANUAL", "GEOFENCE"],
    },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

FootfallEventSchema.index({ shopId: 1, eventType: 1, createdAt: -1 });

const VisitSchema = new Schema<IVisit>(
  {
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, required: true, trim: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, trim: true, lowercase: true },
    reservationId: { type: String, index: true },
    verificationMethod: {
      type: String,
      enum: ["QR_SCAN", "OTP", "SELLER_MANUAL"],
      required: true,
    },
    totalSpent: { type: Number, default: 0 },
    reviewed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

VisitSchema.index({ shopId: 1, createdAt: -1 });

export const FootfallEvent =
  (models.FootfallEvent || model<IFootfallEvent>("FootfallEvent", FootfallEventSchema)) as mongoose.Model<IFootfallEvent>;

export const Visit =
  (models.Visit || model<IVisit>("Visit", VisitSchema)) as mongoose.Model<IVisit>;
