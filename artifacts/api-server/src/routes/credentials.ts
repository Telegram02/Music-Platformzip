import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminCredentialsTable, adminOtpTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { sendOtpEmail, isEmailConfigured } from "../lib/email";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getAdminEmail(): Promise<string | null> {
  const rows = await db.select().from(adminCredentialsTable).orderBy(desc(adminCredentialsTable.id)).limit(1);
  return rows[0]?.email ?? null;
}

async function getAdminPasswordHash(): Promise<string | null> {
  const rows = await db.select().from(adminCredentialsTable).orderBy(desc(adminCredentialsTable.id)).limit(1);
  return rows[0]?.passwordHash ?? null;
}

router.get("/credentials/status", requireAdmin, async (_req, res): Promise<void> => {
  const email = await getAdminEmail();
  const configured = isEmailConfigured();
  res.json({ hasStoredCredentials: !!email, adminEmail: email, emailConfigured: configured });
});

router.post("/credentials/request-otp", requireAdmin, async (req, res): Promise<void> => {
  if (!isEmailConfigured()) {
    res.status(503).json({ error: "Email not configured on server" });
    return;
  }

  const { currentPassword } = req.body as { currentPassword?: string };
  if (!currentPassword) {
    res.status(400).json({ error: "Current password required" });
    return;
  }

  const storedHash = await getAdminPasswordHash();
  const envPassword = process.env.ADMIN_PASSWORD ?? "caktus2024";

  let valid = false;
  if (storedHash) {
    valid = await bcrypt.compare(currentPassword, storedHash);
  } else {
    valid = currentPassword === envPassword;
  }

  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  const adminEmail = await getAdminEmail();
  const toEmail = adminEmail ?? process.env.GMAIL_USER;
  if (!toEmail) {
    res.status(503).json({ error: "No admin email configured" });
    return;
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(adminOtpTable).values({ code, expiresAt, used: "false" });

  try {
    await sendOtpEmail(toEmail, code);
    res.json({ ok: true, sentTo: toEmail });
  } catch (err) {
    req.log.error({ err }, "Failed to send OTP email");
    res.status(500).json({ error: "Failed to send OTP email. Check Gmail credentials." });
  }
});

router.post("/credentials/verify-otp", requireAdmin, async (req, res): Promise<void> => {
  const { code, newPassword, newEmail, newUsername } = req.body as {
    code?: string;
    newPassword?: string;
    newEmail?: string;
    newUsername?: string;
  };

  if (!code) {
    res.status(400).json({ error: "OTP code required" });
    return;
  }
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }

  const now = new Date();
  const otpRows = await db
    .select()
    .from(adminOtpTable)
    .orderBy(desc(adminOtpTable.id))
    .limit(10);

  const match = otpRows.find(
    (r) => r.code === code && r.used === "false" && new Date(r.expiresAt) > now
  );

  if (!match) {
    res.status(401).json({ error: "Invalid or expired code" });
    return;
  }

  await db.update(adminOtpTable).set({ used: "true" }).where(eq(adminOtpTable.id, match.id));

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const email = newEmail?.trim() || (await getAdminEmail()) || (process.env.ADMIN_EMAIL ?? process.env.GMAIL_USER ?? "admin@caktus.local");

  type CredUpdate = { email: string; passwordHash: string; username?: string };
  const updates: CredUpdate = { email, passwordHash };
  if (newUsername?.trim()) updates.username = newUsername.trim();

  const existing = await db.select().from(adminCredentialsTable).limit(1);
  if (existing.length > 0) {
    await db.update(adminCredentialsTable).set(updates);
  } else {
    const username = newUsername?.trim() ?? process.env.ADMIN_USERNAME ?? "admin";
    await db.insert(adminCredentialsTable).values({ email, username, passwordHash });
  }

  req.log.info("Admin credentials updated");
  res.json({ ok: true });
});

export default router;
