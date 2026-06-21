import bcrypt from "bcryptjs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "caktus2024";

let cachedHash: string | null = null;

export async function getPasswordHash(): Promise<string> {
  if (!cachedHash) {
    cachedHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  }
  return cachedHash;
}

export async function verifyPassword(password: string): Promise<boolean> {
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
