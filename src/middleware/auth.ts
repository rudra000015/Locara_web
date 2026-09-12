import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, verifyAuthToken } from "@/lib/auth";

export interface AuthPayload {
  id: string;
  email: string;
  role: "explorer" | "owner";
  iat: number;
  exp: number;
}

export function requireAuth(request: NextRequest): AuthPayload {
  const token = extractBearerToken(request);
  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const decoded = verifyAuthToken(token) as unknown as AuthPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
