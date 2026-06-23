import { Router, type IRouter, type Request, type Response } from "express";
import { db, siteVisitsTable } from "@workspace/db";
import { desc, sql, count, gte } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { createHash } from "crypto";

const router: IRouter = Router();

router.post("/analytics/visit", async (req: Request, res: Response) => {
  try {
    const path = String(req.body.path ?? "/").slice(0, 500);
    const referrer = String(req.body.referrer ?? "").slice(0, 500);
    const userAgent = String(req.headers["user-agent"] ?? "").slice(0, 500);
    const ip = String(req.ip ?? "unknown").slice(0, 64);
    const ipHash = createHash("sha256").update(ip + new Date().toDateString()).digest("hex");
    await db.insert(siteVisitsTable).values({ path, referrer, userAgent, ipHash });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to record visit" });
  }
});

router.get("/analytics", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const fourteenAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const [[total], [last30], [last7], [today], [unique], topPages, daily] = await Promise.all([
      db.select({ count: count() }).from(siteVisitsTable),
      db.select({ count: count() }).from(siteVisitsTable).where(gte(siteVisitsTable.createdAt, thirtyAgo)),
      db.select({ count: count() }).from(siteVisitsTable).where(gte(siteVisitsTable.createdAt, sevenAgo)),
      db.select({ count: count() }).from(siteVisitsTable).where(gte(siteVisitsTable.createdAt, todayStart)),
      db.select({ count: sql<number>`COUNT(DISTINCT ip_hash)` }).from(siteVisitsTable).where(gte(siteVisitsTable.createdAt, thirtyAgo)),
      db.select({ path: siteVisitsTable.path, count: count() }).from(siteVisitsTable).groupBy(siteVisitsTable.path).orderBy(desc(count())).limit(8),
      db.select({ day: sql<string>`DATE(created_at)`, count: count() }).from(siteVisitsTable).where(gte(siteVisitsTable.createdAt, fourteenAgo)).groupBy(sql`DATE(created_at)`).orderBy(sql`DATE(created_at)`),
    ]);

    res.json({ total: total.count, last30Days: last30.count, last7Days: last7.count, today: today.count, uniqueVisitors30: unique.count, topPages, daily });
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
