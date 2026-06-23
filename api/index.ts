import app from "../artifacts/api-server/src/app";
import { seedDefaults } from "../artifacts/api-server/src/lib/seed";

let seeded = false;

export default async function handler(req: any, res: any) {
  if (!seeded) {
    await seedDefaults()
      .then(() => {
        seeded = true;
      })
      .catch((err: unknown) => {
        // Keep seeded=false so it retries on next request.
        // This happens when DB tables don't exist yet — run db:push before deploying.
        console.error("[vercel] Seed error on cold start (tables may not exist — run db:push):", err);
      });
  }
  return app(req, res);
}
