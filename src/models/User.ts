import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "explorer" | "owner";
  img?: string;
  provider: "credentials" | "google";
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ["explorer", "owner"], default: "explorer", required: true },
    img: { type: String, trim: true },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials", required: true },
    googleId: { type: String, trim: true, unique: true, sparse: true },
  },
  {
    timestamps: true,
  }
);

export const User = (models.User || model<IUser>("User", UserSchema)) as mongoose.Model<IUser>;
