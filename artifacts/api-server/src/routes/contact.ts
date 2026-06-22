import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { db, contactMessagesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { sendContactNotification, sendAutoReply, sendTestimonialRequest, isEmailConfigured } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please wait before trying again." },
  keyGenerator: (req) => req.ip ?? "unknown",
});

router.post("/contact", contactLimiter, async (req, res): Promise<void> => {
  const { name, email, subject, message, _hp } = req.body as {
    name?: string; email?: string; subject?: string; message?: string; _hp?: string;
  };

  if (_hp && _hp.length > 0) {
    res.json({ ok: true });
    return;
  }

  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required" });
    return;
  }

  const nameStr = name.trim();
  const emailStr = email.trim();
  const messageStr = message.trim();

  if (nameStr.length < 2 || nameStr.length > 100) {
    res.status(400).json({ error: "Name must be between 2 and 100 characters" });
    return;
  }
  if (messageStr.length < 10 || messageStr.length > 5000) {
    res.status(400).json({ error: "Message must be between 10 and 5000 characters" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailStr)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const subjectStr = (subject ?? "").trim().slice(0, 300);

  await db.insert(contactMessagesTable).values({
    name: nameStr.slice(0, 100),
    email: emailStr.slice(0, 200),
    subject: subjectStr,
    message: messageStr.slice(0, 5000),
  });

  if (isEmailConfigured()) {
    sendContactNotification({
      name: nameStr,
      email: emailStr,
      subject: subjectStr,
      message: messageStr,
    }).catch((err) => logger.error({ err }, "Contact notification failed"));

    sendAutoReply({
      name: nameStr,
      email: emailStr,
      subject: subjectStr,
    }).catch((err) => logger.error({ err }, "Auto-reply failed"));
  }

  res.json({ ok: true });
});

router.get("/contact/unread-count", requireAdmin, async (_req, res): Promise<void> => {
  const result = await db
    .select({ count: count() })
    .from(contactMessagesTable)
    .where(eq(contactMessagesTable.read, false));
  res.json({ count: result[0]?.count ?? 0 });
});

router.get("/contact/messages", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt))
    .limit(100);
  res.json(rows);
});

router.put("/contact/messages/:id/read", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { read } = req.body as { read?: boolean };
  await db.update(contactMessagesTable)
    .set({ read: read ?? true })
    .where(eq(contactMessagesTable.id, id));
  res.json({ ok: true });
});

router.post("/contact/messages/:id/request-testimonial", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [msg] = await db.select().from(contactMessagesTable).where(eq(contactMessagesTable.id, id)).limit(1);
  if (!msg) { res.status(404).json({ error: "Message not found" }); return; }
  if (!isEmailConfigured()) { res.status(503).json({ error: "Email not configured" }); return; }
  await sendTestimonialRequest({ name: msg.name, email: msg.email });
  res.json({ ok: true });
});

router.delete("/contact/messages/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.status(204).end();
});

export default router;
