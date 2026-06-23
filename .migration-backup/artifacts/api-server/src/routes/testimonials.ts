import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, testimonialsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/testimonials", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.active, true))
    .orderBy(asc(testimonialsTable.sortOrder), asc(testimonialsTable.id));
  res.json(rows);
});

router.get("/testimonials/all", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .orderBy(asc(testimonialsTable.sortOrder), asc(testimonialsTable.id));
  res.json(rows);
});

router.post("/testimonials", requireAdmin, async (req, res): Promise<void> => {
  const { quote, authorName, authorTitle, authorAvatar, rating, sortOrder, active } = req.body as {
    quote?: string; authorName?: string; authorTitle?: string;
    authorAvatar?: string; rating?: number; sortOrder?: number; active?: boolean;
  };
  if (!quote?.trim() || !authorName?.trim()) {
    res.status(400).json({ error: "quote and authorName are required" });
    return;
  }
  const [row] = await db.insert(testimonialsTable).values({
    quote: quote.trim().slice(0, 1000),
    authorName: authorName.trim().slice(0, 100),
    authorTitle: (authorTitle ?? "").trim().slice(0, 100),
    authorAvatar: (authorAvatar ?? "").trim(),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    sortOrder: Number(sortOrder) || 0,
    active: active !== false,
  }).returning();
  res.status(201).json(row);
});

router.put("/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { quote, authorName, authorTitle, authorAvatar, rating, sortOrder, active } = req.body as {
    quote?: string; authorName?: string; authorTitle?: string;
    authorAvatar?: string; rating?: number; sortOrder?: number; active?: boolean;
  };
  type Update = {
    quote?: string; authorName?: string; authorTitle?: string;
    authorAvatar?: string; rating?: number; sortOrder?: number; active?: boolean;
  };
  const updates: Update = {};
  if (quote !== undefined) updates.quote = quote.trim().slice(0, 1000);
  if (authorName !== undefined) updates.authorName = authorName.trim().slice(0, 100);
  if (authorTitle !== undefined) updates.authorTitle = authorTitle.trim().slice(0, 100);
  if (authorAvatar !== undefined) updates.authorAvatar = authorAvatar.trim();
  if (rating !== undefined) updates.rating = Math.min(5, Math.max(1, Number(rating)));
  if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
  if (active !== undefined) updates.active = active;
  const [row] = await db.update(testimonialsTable).set(updates).where(eq(testimonialsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
  res.status(204).end();
});

export default router;
