import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, adminCredentialsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET (or SESSION_SECRET) environment variable is required.");
  }
  return secret;
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  try {
    const rows = await db
      .select()
      .from(adminCredentialsTable)
      .orderBy(desc(adminCredentialsTable.id))
      .limit(1);
    if (rows.length > 0) {
      if (rows[0].username !== username) return false;
      return bcrypt.compare(password, rows[0].passwordHash);
    }
  } catch {
    // DB unavailable — fall through to env-based check
  }

  // Fall back to env vars (required on first deploy before DB is seeded)
  const envUsername = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envUsername && envPassword) {
    return username === envUsername && password === envPassword;
  }

  // No credentials configured at all — log a clear warning
  console.error(
    "LOGIN FAILED: No admin credentials found in the database or environment. " +
    "Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables in Vercel."
  );
  return false;
}

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const rows = await db
      .select()
      .from(adminCredentialsTable)
      .orderBy(desc(adminCredentialsTable.id))
      .limit(1);
    if (rows.length > 0) {
      return bcrypt.compare(password, rows[0].passwordHash);
    }
  } catch {
    // fall through
  }
  return !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;
}

export function signAdminToken(rememberMe = false): string {
  const expiresIn = rememberMe ? "30d" : "24h";
  return jwt.sign({ adminLoggedIn: true }, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as { adminLoggedIn?: boolean };
    return payload.adminLoggedIn === true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.["caktus.tok"];
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
