import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  const rows = await db.select().from(servicesTable).where(eq(servicesTable.active, true)).orderBy(asc(servicesTable.sortOrder));
  res.json(rows);
});

router.get("/services/all", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.sortOrder));
  res.json(rows);
});

router.post("/services", requireAdmin, async (req, res): Promise<void> => {
  const { iconName, title, description, colorClass, sortOrder, active } = req.body as {
    iconName?: string; title?: string; description?: string;
    colorClass?: string; sortOrder?: number; active?: boolean;
  };
  if (!title) { res.status(400).json({ error: "Title required" }); return; }
  const [row] = await db.insert(servicesTable).values({
    iconName: iconName ?? "Music2", title, description: description ?? "",
    colorClass: colorClass ?? "from-purple-500/20 to-primary/5",
    sortOrder: sortOrder ?? 0, active: active ?? true,
  }).returning();
  res.status(201).json(row);
});

router.put("/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { iconName, title, description, colorClass, sortOrder, active } = req.body as {
    iconName?: string; title?: string; description?: string;
    colorClass?: string; sortOrder?: number; active?: boolean;
  };
  const [row] = await db.update(servicesTable)
    .set({
      ...(iconName !== undefined && { iconName }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(colorClass !== undefined && { colorClass }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(active !== undefined && { active }),
    })
    .where(eq(servicesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  res.status(204).end();
});

export default router;
