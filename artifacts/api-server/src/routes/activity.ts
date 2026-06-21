import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, loginActivityTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/activity", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(loginActivityTable)
    .orderBy(desc(loginActivityTable.createdAt))
    .limit(100);
  res.json(rows);
});

export default router;
