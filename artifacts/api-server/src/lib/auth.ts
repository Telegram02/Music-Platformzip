import bcrypt from "bcryptjs";
import { db, adminCredentialsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "caktus2024";

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
    // fall through to env-based check
  }
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
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
    // fall through to env-based check
  }
  return password === ADMIN_PASSWORD;
}

export function requireAdmin(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
): void {
  const session = req.session as { adminLoggedIn?: boolean };
  if (!session.adminLoggedIn) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
