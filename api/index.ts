import app from "../artifacts/api-server/src/app";
import { seedDefaults } from "../artifacts/api-server/src/lib/seed";

let seeded = false;

export default async function handler(req: any, res: any) {
  if (!seeded) {
    await seedDefaults().catch((err: unknown) => {
      console.error("[vercel] Seed error on cold start:", err);
    });
    seeded = true;
  }
  return app(req, res);
}
