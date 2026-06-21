import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteSettingsTable);
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

router.put("/settings", requireAdmin, async (req, res): Promise<void> => {
  const updates = req.body as Record<string, string>;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ error: "Expected an object of key-value pairs" });
    return;
  }
  for (const [key, value] of Object.entries(updates)) {
    await db
      .insert(siteSettingsTable)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value: String(value), updatedAt: new Date() },
      });
  }
  res.json({ ok: true });
});

export default router;
