import mongoose, { Schema, Document, model, models } from "mongoose";

export type ReservationStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "CONFIRMED"
  | "ACTIVE"
  | "VISITED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface IReservationItem {
  productId: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  unit?: string;
}

export interface IReservation extends Document {
  reservationNumber: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  shopId: string;
  shopName: string;
  shopAddress?: string;
  shopLocation?: [number, number]; // [lat, lng]
  items: IReservationItem[];
  totalAmount: number;
  advanceAmount: number; // 10%
  remainingAmount: number; // 90%
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
  pickupOtp: string;
  verificationQr: string;
  expiryTime: Date;
  visitedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  verificationMethod?: "QR_SCAN" | "OTP" | "SELLER_MANUAL";
  createdAt: Date;
  updatedAt: Date;
}

const ReservationItemSchema = new Schema<IReservationItem>(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    unit: { type: String, default: "piece" },
  },
  { _id: false }
);

const ReservationSchema = new Schema<IReservation>(
  {
    reservationNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, trim: true, lowercase: true },
    userPhone: { type: String, trim: true },
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, required: true, trim: true },
    shopAddress: { type: String, trim: true },
    shopLocation: { type: [Number], default: undefined },
    items: { type: [ReservationItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    advanceAmount: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PAYMENT_PROCESSING",
        "CONFIRMED",
        "ACTIVE",
        "VISITED",
        "COMPLETED",
        "EXPIRED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "CONFIRMED",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PAID",
      index: true,
    },
    paymentMethod: { type: String, default: "UPI" },
    paymentTransactionId: { type: String, trim: true },
    pickupOtp: { type: String, required: true, trim: true },
    verificationQr: { type: String, required: true, trim: true },
    expiryTime: { type: Date, required: true, index: true },
    visitedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true },
    verificationMethod: {
      type: String,
      enum: ["QR_SCAN", "OTP", "SELLER_MANUAL"],
    },
  },
  {
    timestamps: true,
  }
);

ReservationSchema.index({ shopId: 1, status: 1 });
ReservationSchema.index({ userId: 1, status: 1 });
ReservationSchema.index({ expiryTime: 1, status: 1 });

export const Reservation =
  (models.Reservation || model<IReservation>("Reservation", ReservationSchema)) as mongoose.Model<IReservation>;
