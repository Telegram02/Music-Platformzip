import app from "../artifacts/api-server/src/app.js";
import { seedDefaults } from "../artifacts/api-server/src/lib/seed.js";

let seeded = false;

export default async function handler(req: any, res: any) {
  if (!seeded) {
    seeded = true;
    await seedDefaults().catch(console.error);
  }
  return app(req, res);
}
