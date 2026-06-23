import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, portfolioItemsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/portfolio", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(portfolioItemsTable)
    .where(eq(portfolioItemsTable.active, true))
    .orderBy(asc(portfolioItemsTable.sortOrder));
  res.json(items);
});

router.get("/portfolio/all", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(portfolioItemsTable).orderBy(asc(portfolioItemsTable.sortOrder));
  res.json(items);
});

router.post("/portfolio", requireAdmin, async (req, res): Promise<void> => {
  const [item] = await db.insert(portfolioItemsTable).values(req.body).returning();
  res.status(201).json(item);
});

router.put("/portfolio/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = req.body;
  const [item] = await db.update(portfolioItemsTable).set(rest).where(eq(portfolioItemsTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/portfolio/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(portfolioItemsTable).where(eq(portfolioItemsTable.id, id));
  res.sendStatus(204);
});

export default router;
