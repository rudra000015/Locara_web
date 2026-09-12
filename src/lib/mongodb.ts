import mongoose from "mongoose";

function normalizeMongoUri(raw: string): string {
  const uri = raw.trim();
  if (!uri.includes("://")) return uri;

  // Rebuild authority with escaped credentials while preserving host/path/query.
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
    // Keep raw value if it is not percent-encoded.
  }
  try {
    password = decodeURIComponent(rawPassword);
  } catch {
    // Keep raw value if it is not percent-encoded.
  }

  return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}${suffix}`;
}

const rawUri = process.env.MONGODB_URI;

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as unknown as { mongoose?: MongooseGlobal };
const cached = globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

export async function connectDb() {
  if (!rawUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = normalizeMongoUri(rawUri);
    cached.promise = mongoose
      .connect(uri)
      .then((mongooseClient) => mongooseClient)
      .catch((error) => {
        cached.conn = null;
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
