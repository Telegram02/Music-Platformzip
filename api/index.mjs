import app from "../artifacts/api-server/dist/app.mjs";
import { seedDefaults } from "../artifacts/api-server/dist/lib/seed.mjs";

let seeded = false;

export default async function handler(req, res) {
  if (!seeded) {
    seeded = true;
    await seedDefaults().catch(console.error);
  }
  return app(req, res);
}
