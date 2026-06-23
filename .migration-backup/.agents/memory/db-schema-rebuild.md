---
name: DB schema lib rebuild
description: After adding new Drizzle schema files to lib/db, the lib must be rebuilt before api-server typecheck can see the new exports
---

## Rule
After creating or modifying any file in `lib/db/src/schema/`, you MUST run `pnpm run typecheck:libs` before running `pnpm --filter @workspace/api-server run typecheck`.

**Why:** The api-server package imports types from `@workspace/db` via compiled `.d.ts` declarations in `lib/db/dist/`. Without rebuilding, the old declarations are served and TypeScript reports "has no exported member" errors for the new tables.

**How to apply:** Any time you add a new schema file and update `lib/db/src/schema/index.ts`, run `pnpm run typecheck:libs` immediately after, before checking or fixing any type errors in api-server.

The runtime (esbuild) build is not affected — the server will run correctly regardless. Only the TypeScript type checker is blocked by stale declarations.
