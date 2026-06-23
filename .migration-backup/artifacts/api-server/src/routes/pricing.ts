import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, pricingTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/pricing", async (_req, res): Promise<void> => {
  const rows = await db.select().from(pricingTable).where(eq(pricingTable.active, true)).orderBy(asc(pricingTable.sortOrder));
  res.json(rows);
});

router.get("/pricing/all", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(pricingTable).orderBy(asc(pricingTable.sortOrder));
  res.json(rows);
});

router.post("/pricing", requireAdmin, async (req, res): Promise<void> => {
  const [row] = await db.insert(pricingTable).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/pricing/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = req.body;
  const [row] = await db.update(pricingTable).set(rest).where(eq(pricingTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/pricing/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(pricingTable).where(eq(pricingTable.id, id));
  res.sendStatus(204);
});

export default router;
