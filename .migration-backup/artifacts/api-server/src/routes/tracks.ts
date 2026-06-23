import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, audioTracksTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/tracks", async (_req, res): Promise<void> => {
  const tracks = await db
    .select()
    .from(audioTracksTable)
    .where(eq(audioTracksTable.active, true))
    .orderBy(asc(audioTracksTable.sortOrder));
  res.json(tracks);
});

router.get("/tracks/all", requireAdmin, async (_req, res): Promise<void> => {
  const tracks = await db.select().from(audioTracksTable).orderBy(asc(audioTracksTable.sortOrder));
  res.json(tracks);
});

router.post("/tracks", requireAdmin, async (req, res): Promise<void> => {
  const [track] = await db.insert(audioTracksTable).values(req.body).returning();
  res.status(201).json(track);
});

router.put("/tracks/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = req.body;
  const [track] = await db.update(audioTracksTable).set(rest).where(eq(audioTracksTable.id, id)).returning();
  if (!track) { res.status(404).json({ error: "Not found" }); return; }
  res.json(track);
});

router.delete("/tracks/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(audioTracksTable).where(eq(audioTracksTable.id, id));
  res.sendStatus(204);
});

export default router;
