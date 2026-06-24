import app from "./app";
import { seedDefaults } from "./lib/seed";

let seeded = false;

export default async function handler(req: any, res: any) {
  if (!seeded) {
    await seedDefaults()
      .then(() => { seeded = true; })
      .catch((err: unknown) => {
        console.error("[vercel] Seed error on cold start:", err);
      });
  }
  return app(req, res);
}
