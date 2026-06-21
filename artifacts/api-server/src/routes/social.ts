import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, socialLinksTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/social", async (_req, res): Promise<void> => {
  const links = await db
    .select()
    .from(socialLinksTable)
    .where(eq(socialLinksTable.active, true))
    .orderBy(asc(socialLinksTable.sortOrder));
  res.json(links);
});

router.get("/social/all", requireAdmin, async (_req, res): Promise<void> => {
  const links = await db
    .select()
    .from(socialLinksTable)
    .orderBy(asc(socialLinksTable.sortOrder));
  res.json(links);
});

router.post("/social", requireAdmin, async (req, res): Promise<void> => {
  const [link] = await db.insert(socialLinksTable).values(req.body).returning();
  res.status(201).json(link);
});

router.put("/social/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { id: _id, updatedAt: _u, ...rest } = req.body;
  const [link] = await db
    .update(socialLinksTable)
    .set(rest)
    .where(eq(socialLinksTable.id, id))
    .returning();
  if (!link) { res.status(404).json({ error: "Not found" }); return; }
  res.json(link);
});

router.delete("/social/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(socialLinksTable).where(eq(socialLinksTable.id, id));
  res.sendStatus(204);
});

export default router;
