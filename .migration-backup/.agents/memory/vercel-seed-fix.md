---
name: Vercel serverless seed fix
description: Why admin login fails on Vercel and how to fix it in this project
---

The Express server calls `seedDefaults()` inside `app.listen(callback)`. On Vercel serverless, `app.listen()` never fires — each request gets a fresh function invocation. So the admin user is never seeded, causing login to fail even with correct env vars.

**Fix:** `api/index.ts` wraps the Express app and runs `seedDefaults()` on the first cold start:
```ts
let seeded = false;
export default async function handler(req, res) {
  if (!seeded) { await seedDefaults().catch(() => {}); seeded = true; }
  return app(req, res);
}
```

**Why:** Vercel serverless = no persistent process, no port binding, no startup lifecycle.

**How to apply:** Any time the server moves to a serverless platform, move seed/init logic into the request handler behind a `seeded` guard, not into the listen callback.
