import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import router from "./routes";
import { logger } from "./lib/logger";

export { seedDefaults } from "./lib/seed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app: any = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpLogger = (pinoHttp as any)({
  logger,
  serializers: {
    req(req: IncomingMessage & { id?: string | number }) {
      return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
    },
    res(res: ServerResponse) {
      return { statusCode: res.statusCode };
    },
  },
});

app.use(httpLogger);

function getCorsOrigin(): cors.CorsOptionsDelegate | string[] | true {
  const origins: string[] = [];

  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.push(trimmed);
    });
  }

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  if (process.env.REPLIT_DOMAINS) {
    process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
      origins.push(`https://${d.trim()}`);
    });
  }

  // On Vercel, allow any *.vercel.app preview URL (for preview deployments)
  if (process.env.VERCEL) {
    return (requestOrigin, callback) => {
      if (!requestOrigin) { callback(null, true); return; }
      const allowed =
        origins.includes(requestOrigin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(requestOrigin);
      callback(null, allowed ? requestOrigin : false);
    };
  }

  return origins.length > 0 ? origins : true;
}

app.use(cors({ origin: getCorsOrigin(), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use("/api", router);

export default app;
