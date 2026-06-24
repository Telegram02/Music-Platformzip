import app, { seedDefaults } from "../artifacts/api-server/dist/app.mjs";

let seeded = false;

export default async function handler(req, res) {
  if (!seeded) {
    seeded = true;
    await seedDefaults().catch(console.error);
  }
  return app(req, res);
}
