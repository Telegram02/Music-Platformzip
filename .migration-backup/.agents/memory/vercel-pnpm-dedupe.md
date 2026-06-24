---
name: Vercel pnpm duplicate deps + pino worker crash
description: Two bugs that caused FUNCTION_INVOCATION_FAILED on Vercel and how they were fixed
---

## Bug 1: Duplicate drizzle-orm from pnpm workspace

Vercel's @vercel/node bundler doesn't deduplicate across pnpm workspace packages.
@workspace/api-server and @workspace/db each got their own drizzle-orm, making
SQL<unknown> types incompatible → 126 TS errors on Vercel, none locally.

**Fix:** Pre-build the entire Express API into a single esbuild bundle via
`build-vercel.mjs`. Output goes to `api/` directory as `api/index.mjs`.
esbuild deduplicates all imports internally.

## Bug 2: Pino worker thread files not deployed (FUNCTION_INVOCATION_FAILED)

esbuild-plugin-pino generates 4 sibling worker files alongside the main bundle:
- pino-worker.mjs, pino-file.mjs, pino-pretty.mjs, thread-stream-worker.mjs

When the bundle was in `artifacts/api-server/dist/` and `api/index.ts` re-exported
it, Vercel only bundled `index.ts` + `vercel-handler.mjs` — the pino worker files
were left behind. Pino crashed on cold start trying to spawn worker threads → FUNCTION_INVOCATION_FAILED.

**Fix:** Output esbuild bundle DIRECTLY into `api/` (project root). All 5 files
(index.mjs + 4 pino workers) land in api/ together. Vercel auto-includes the entire
api/ directory when deploying the serverless function.

**How to apply:** Any time you use esbuild-plugin-pino for a Vercel function,
ensure outdir is the same directory as the function entry point. Never have the
main bundle in one directory with the function entry point importing it from another.

**Key config:**
- `build-vercel.mjs`: outdir = `path.resolve(artifactDir, "../../api")`
- entryPoints uses named entry: `{ in: "src/vercel-handler.ts", out: "index" }`
- `api/index.ts` deleted — replaced by generated `api/index.mjs`
- `.gitignore`: api/index.mjs + all api/pino-*.mjs + api/thread-stream-worker.mjs
