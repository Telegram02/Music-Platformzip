import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { desc, eq } from "drizzle-orm";
import { db, adminCredentialsTable, adminOtpTable } from "@workspace/db";
import { verifyPassword, requireAdmin } from "../lib/auth";
import { sendOtpEmail, isEmailConfigured } from "../lib/email";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

router.post("/auth/confirm-reset", async (req, res): Promise<void> => {
  const { code, newPassword } = req.body as { code?: string; newPassword?: string };

  if (!code) {
    res.status(400).json({ error: "Reset code required" });
    return;
  }
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }

  const now = new Date();
  const otpRows = await db.select().from(adminOtpTable).orderBy(desc(adminOtpTable.id)).limit(10);
  const match = otpRows.find(
    (r) => r.code === code && r.used === "false" && new Date(r.expiresAt) > now
  );

  if (!match) {
    res.status(401).json({ error: "Invalid or expired code. Request a new one." });
    return;
  }

  await db.update(adminOtpTable).set({ used: "true" }).where(eq(adminOtpTable.id, match.id));

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const existing = await db.select().from(adminCredentialsTable).limit(1);
  if (existing.length > 0) {
    await db.update(adminCredentialsTable).set({ passwordHash });
  } else {
    const fallbackEmail = process.env.GMAIL_USER ?? "admin@caktus.local";
    await db.insert(adminCredentialsTable).values({ email: fallbackEmail, passwordHash });
  }

  req.log.info("Admin password reset via email OTP");
  res.json({ ok: true });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { password } = req.body as { password?: string };
  if (!password) {
    res.status(400).json({ error: "Password required" });
    return;
  }
  const valid = await verifyPassword(password);
  if (!valid) {
    req.log.warn("Failed admin login attempt");
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  (req.session as { adminLoggedIn?: boolean }).adminLoggedIn = true;
  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error");
      res.status(500).json({ error: "Session error" });
      return;
    }
    res.json({ ok: true });
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", requireAdmin, (_req, res): void => {
  res.json({ loggedIn: true });
});

export default router;
