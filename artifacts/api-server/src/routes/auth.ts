import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { desc, eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { db, adminCredentialsTable, adminOtpTable, loginActivityTable } from "@workspace/db";
import { verifyCredentials, requireAdmin, signAdminToken } from "../lib/auth";
import { sendOtpEmail, isEmailConfigured } from "../lib/email";

const router: IRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const isProd = process.env.NODE_ENV === "production";

router.post("/auth/request-reset", async (req, res): Promise<void> => {
  if (!isEmailConfigured()) {
    res.status(503).json({ error: "Email is not configured on this server. Contact the site owner." });
    return;
  }

  const rows = await db.select().from(adminCredentialsTable).orderBy(desc(adminCredentialsTable.id)).limit(1);
  const toEmail = rows[0]?.email ?? process.env.GMAIL_USER;

  if (!toEmail) {
    res.status(503).json({ error: "No admin email configured. Set GMAIL_USER in environment secrets." });
    return;
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.insert(adminOtpTable).values({ code, expiresAt, used: "false" });

  try {
    await sendOtpEmail(toEmail, code);
    const masked = toEmail.replace(/(.{2}).+(@.+)/, "$1***$2");
    res.json({ ok: true, sentTo: masked });
  } catch (err) {
    req.log.error({ err }, "Failed to send reset OTP email");
    res.status(500).json({ error: "Failed to send reset email. Check server email configuration." });
  }
});

router.post("/auth/confirm-reset", resetLimiter, async (req, res): Promise<void> => {
  const { code, newPassword, newUsername } = req.body as {
    code?: string; newPassword?: string; newUsername?: string;
  };

  if (!code) { res.status(400).json({ error: "Reset code required" }); return; }
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" }); return;
  }

  const now = new Date();
  const otpRows = await db.select().from(adminOtpTable).orderBy(desc(adminOtpTable.id)).limit(10);
  const match = otpRows.find((r) => r.code === code && r.used === "false" && new Date(r.expiresAt) > now);
  if (!match) { res.status(401).json({ error: "Invalid or expired code. Request a new one." }); return; }

  await db.update(adminOtpTable).set({ used: "true" }).where(eq(adminOtpTable.id, match.id));

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const existing = await db.select().from(adminCredentialsTable).limit(1);

  type CredUpdate = { passwordHash: string; username?: string };
  const updates: CredUpdate = { passwordHash };
  if (newUsername?.trim()) updates.username = newUsername.trim();

  if (existing.length > 0) {
    await db.update(adminCredentialsTable).set(updates);
  } else {
    const fallbackEmail = process.env.ADMIN_EMAIL ?? process.env.GMAIL_USER ?? "admin@caktus.local";
    const fallbackUsername = newUsername?.trim() ?? process.env.ADMIN_USERNAME ?? "admin";
    await db.insert(adminCredentialsTable).values({ email: fallbackEmail, username: fallbackUsername, passwordHash });
  }

  req.log.info("Admin credentials reset via email OTP");
  res.json({ ok: true });
});

router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  const { username, password, rememberMe } = req.body as {
    username?: string; password?: string; rememberMe?: boolean;
  };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" }); return;
  }

  const valid = await verifyCredentials(username, password);

  await db.insert(loginActivityTable).values({
    username,
    success: valid,
    ipAddress: (req.ip ?? "").slice(0, 100),
  }).catch(() => {});

  if (!valid) {
    req.log.warn("Failed admin login attempt");
    res.status(401).json({ error: "Invalid username or password" }); return;
  }

  const token = signAdminToken(!!rememberMe);
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  res.cookie("caktus.tok", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  res.json({ ok: true, rememberMe: !!rememberMe });
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie("caktus.tok", { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", requireAdmin, (_req, res): void => {
  res.json({ loggedIn: true });
});

export default router;
