---
name: Vercel pnpm duplicate deps
description: Why drizzle-orm (and other shared workspace packages) cause type errors on Vercel and the fix
---

When Vercel bundles a serverless function from a pnpm workspace (api/index.ts), it does NOT deduplicate across workspace packages the way local pnpm does. Result: @workspace/api-server and @workspace/db each get their own copy of drizzle-orm nested in their respective node_modules. This creates incompatible types (SQL<unknown> from one copy ≠ SQL<unknown> from another copy), producing 100+ TS errors on Vercel while local typecheck passes.

**Fix:** Pre-build the entire Express API into a single esbuild bundle (build-vercel.mjs → dist/vercel-handler.mjs). api/index.ts becomes a thin @ts-nocheck re-export from the pre-built file. esbuild deduplicates all imports internally so there's only one drizzle-orm instance.

**Why:** Vercel's @vercel/node bundler resolves imports independently without honoring pnpm's workspace hoisting/deduplication. Pre-building sidesteps this entirely.

**How to apply:** Any time a workspace package is shared between a serverless function entry and a lib package, pre-build the entry with esbuild rather than letting Vercel bundle the TypeScript source directly. Remove the offending package from externals list in the vercel build script so it gets bundled.

**Key config:**
- artifacts/api-server/build-vercel.mjs — esbuild config, @aws-sdk bundled (not external), no entryNames
- api/index.ts — // @ts-nocheck + export { default } from "../artifacts/api-server/dist/vercel-handler.mjs"
- vercel.json buildCommand — runs build:vercel before frontend build; no functions.includeFiles
