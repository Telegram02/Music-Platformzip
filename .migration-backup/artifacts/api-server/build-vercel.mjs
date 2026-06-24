import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
// Output directly into api/ at the project root so pino worker files
// land alongside the handler — Vercel auto-includes all files in api/.
// CJS format (.js) is used because Vercel's function auto-detection
// reliably handles api/index.js; .mjs was treated as a static file.
const apiDir = path.resolve(artifactDir, "../../api");

async function buildVercel() {
  await esbuild({
    // Named entry so output file is api/bundle.js
    // api/index.js is committed to git (thin wrapper) so Vercel always sees the function.
    entryPoints: [{ in: path.resolve(artifactDir, "src/vercel-handler.ts"), out: "bundle" }],
    platform: "node",
    bundle: true,
    format: "cjs",
    outdir: apiDir,
    logLevel: "info",
    // @aws-sdk and nodemailer are intentionally bundled here so Vercel gets
    // a single self-contained file with no external workspace dependencies.
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
    ],
    sourcemap: false,
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],
  });
}

buildVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
