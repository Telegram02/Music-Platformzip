import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, contactMessagesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, subject, message } = req.body as {
    name?: string; email?: string; subject?: string; message?: string;
  };
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required" });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  await db.insert(contactMessagesTable).values({
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    subject: (subject ?? "").slice(0, 300),
    message: message.slice(0, 5000),
  });
  res.json({ ok: true });
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

router.delete("/contact/messages/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.status(204).end();
});

export default router;
