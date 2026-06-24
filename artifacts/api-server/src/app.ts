import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import router from "./routes";
import { logger } from "./lib/logger";

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

function makeOriginChecker() {
  const isProd = process.env.NODE_ENV === "production";
  const staticOrigins: string[] = [];

  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) staticOrigins.push(trimmed);
    });
  }

  if (process.env.VERCEL_URL) {
    staticOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  const replitDomains: string[] = [];
  if (process.env.REPLIT_DOMAINS) {
    process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
      const trimmed = d.trim();
      staticOrigins.push(`https://${trimmed}`);
      replitDomains.push(trimmed);
    });
  }

  if (staticOrigins.length === 0 && isProd) {
    console.warn("WARNING: No CORS_ORIGIN set in production. Set CORS_ORIGIN to your frontend URL.");
  }

  // In dev, allow any subdomain of the same replit.dev project (e.g. Expo web preview)
  const replitDevBase = replitDomains.length > 0
    ? replitDomains[0].replace(/^[^.]+\./, "")  // strip leading segment → pike.replit.dev
    : null;

  return function originFn(
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin) { callback(null, true); return; }
    if (staticOrigins.includes(origin)) { callback(null, true); return; }
    if (!isProd && replitDevBase && origin.endsWith(`.${replitDevBase}`)) {
      callback(null, true); return;
    }
    if (staticOrigins.length === 0 && !isProd) { callback(null, true); return; }
    callback(null, false);
  };
}

app.use(cors({ origin: makeOriginChecker(), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use("/api", router);

export default app;
