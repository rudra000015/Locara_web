import mongoose, { Connection, Document, Model, Schema } from "mongoose";

export type AuthRole = "owner" | "explorer";

interface IAuthStoreUser extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: AuthRole;
  img?: string;
  provider: "credentials" | "google";
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthStoreUserSchema = new Schema<IAuthStoreUser>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ["owner", "explorer"], required: true },
    img: { type: String, trim: true },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials", required: true },
    googleId: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

type AuthConnectionCache = {
  owner?: CachedConnection;
  explorer?: CachedConnection;
};

const globalWithAuthConnections = globalThis as unknown as { authConnections?: AuthConnectionCache };
const authConnections: AuthConnectionCache = globalWithAuthConnections.authConnections || {};
if (!globalWithAuthConnections.authConnections) {
  globalWithAuthConnections.authConnections = authConnections;
}

function normalizeMongoUri(raw: string): string {
  const uri = raw.trim();
  if (!uri.includes("://")) return uri;

  const protocolEnd = uri.indexOf("://");
  const protocol = uri.slice(0, protocolEnd + 3);
  const rest = uri.slice(protocolEnd + 3);

  const slashIndex = rest.search(/[/?#]/);
  const authority = slashIndex >= 0 ? rest.slice(0, slashIndex) : rest;
  const suffix = slashIndex >= 0 ? rest.slice(slashIndex) : "";

  const atIndex = authority.lastIndexOf("@");
  if (atIndex <= 0) return uri;

  const credentials = authority.slice(0, atIndex);
  const host = authority.slice(atIndex + 1);
  const colonIndex = credentials.indexOf(":");
  if (colonIndex <= 0) return uri;

  const rawUsername = credentials.slice(0, colonIndex);
  const rawPassword = credentials.slice(colonIndex + 1);

  let username = rawUsername;
  let password = rawPassword;
  try {
    username = decodeURIComponent(rawUsername);
  } catch {
    // Keep raw value if not encoded.
  }
  try {
    password = decodeURIComponent(rawPassword);
  } catch {
    // Keep raw value if not encoded.
  }

  return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}${suffix}`;
}

function withDbName(uri: string, dbName: string): string {
  const normalized = normalizeMongoUri(uri);
  if (!normalized.includes("://")) return normalized;

  const protocolEnd = normalized.indexOf("://");
  const protocol = normalized.slice(0, protocolEnd + 3);
  const rest = normalized.slice(protocolEnd + 3);

  const slashIndex = rest.indexOf("/");
  if (slashIndex === -1) {
    return `${protocol}${rest}/${dbName}`;
  }

  const authority = rest.slice(0, slashIndex);
  const afterSlash = rest.slice(slashIndex + 1);
  const queryIndex = afterSlash.indexOf("?");
  const query = queryIndex >= 0 ? afterSlash.slice(queryIndex) : "";

  return `${protocol}${authority}/${dbName}${query}`;
}

function getRoleDbName(role: AuthRole): string {
  return role === "owner"
    ? process.env.AUTH_OWNER_DB || "ownerdata"
    : process.env.AUTH_SHOPPER_DB || "shopperdata";
}

function getRoleUri(role: AuthRole): string {
  const roleUri = role === "owner" ? process.env.MONGODB_URI_OWNER : process.env.MONGODB_URI_SHOPPER;
  const fallback = process.env.MONGODB_URI;
  const raw = roleUri || fallback;
  if (!raw) {
    throw new Error("Missing MONGODB_URI (or role-specific auth URIs)");
  }
  return withDbName(raw, getRoleDbName(role));
}

async function getRoleConnection(role: AuthRole): Promise<Connection> {
  const key = role === "owner" ? "owner" : "explorer";
  const cached = authConnections[key] || { conn: null, promise: null };
  authConnections[key] = cached;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = getRoleUri(role);
    cached.promise = mongoose
      .createConnection(uri)
      .asPromise()
      .then((conn) => conn)
      .catch((error) => {
        cached.conn = null;
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function getRoleModel(role: AuthRole): Promise<Model<IAuthStoreUser>> {
  const conn = await getRoleConnection(role);
  return (conn.models.AuthStoreUser || conn.model<IAuthStoreUser>("AuthStoreUser", AuthStoreUserSchema)) as Model<IAuthStoreUser>;
}

export async function upsertRoleAuthUser(
  role: AuthRole,
  payload: {
    userId: mongoose.Types.ObjectId | string;
    name: string;
    email: string;
    password?: string;
    img?: string;
    provider: "credentials" | "google";
    googleId?: string;
  }
) {
  const Model = await getRoleModel(role);
  const email = String(payload.email).trim().toLowerCase();

  return Model.findOneAndUpdate(
    { email },
    {
      userId: payload.userId,
      name: payload.name,
      email,
      role,
      img: payload.img,
      provider: payload.provider,
      ...(payload.password ? { password: payload.password } : {}),
      ...(payload.googleId ? { googleId: payload.googleId } : {}),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function findRoleAuthUserByEmail(role: AuthRole, email: string) {
  const Model = await getRoleModel(role);
  return Model.findOne({ email: String(email).trim().toLowerCase() });
}

export async function syncRoleAuthIndexes() {
  const ownerModel = await getRoleModel("owner");
  const shopperModel = await getRoleModel("explorer");
  await ownerModel.syncIndexes();
  await shopperModel.syncIndexes();
}


