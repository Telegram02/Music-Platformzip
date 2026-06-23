// @ts-nocheck — pre-built bundle; types are checked within the api-server workspace.
// The Vercel build step runs build:vercel which produces dist/vercel-handler.mjs
// via esbuild with all workspace deps deduplicated into a single bundle.
export { default } from "../artifacts/api-server/dist/vercel-handler.mjs";
