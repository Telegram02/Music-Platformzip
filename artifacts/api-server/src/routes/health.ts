import { Router, type IRouter } from "express";
import { pool, db, adminCredentialsTable } from "@workspace/db";

const router: IRouter = Router();

// Lightweight keep-alive endpoint — no DB, no async work.
// Point an external cron at /api/ping every 5 min to prevent Vercel cold starts.
router.get("/ping", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, ts: Date.now() });
});

router.get("/healthz", async (_req, res) => {
  const result: Record<string, unknown> = { status: "ok" };

  try {
    await pool.query("SELECT 1");
    result.database = "connected";
  } catch (err: unknown) {
    result.database = "error";
    result.databaseError = err instanceof Error ? err.message : "unknown error";
    result.status = "degraded";
  }

  try {
    const admins = await db.select().from(adminCredentialsTable).limit(1);
    result.adminSeeded = admins.length > 0;
    result.adminTablesExist = true;
  } catch {
    result.adminSeeded = false;
    result.adminTablesExist = false;
    result.hint = "Run: pnpm db:push to create schema tables";
  }

  result.jwtConfigured = !!(process.env.JWT_SECRET || process.env.SESSION_SECRET);
  result.adminPasswordEnvSet = !!process.env.ADMIN_PASSWORD;
  result.nodeEnv = process.env.NODE_ENV ?? "not set";

  res.json(result);
});

export default router;
