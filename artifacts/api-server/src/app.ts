import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import pinoHttp from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string | number }) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: ServerResponse) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

function getAllowedOrigins(): string[] | true {
  const origins: string[] = [];

  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.push(trimmed);
    });
  }

  if (process.env.REPLIT_DOMAINS) {
    process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
      origins.push(`https://${d.trim()}`);
    });
  }

  return origins.length > 0 ? origins : true;
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(
  session({
    name: "caktus.sid",
    secret: process.env.SESSION_SECRET ?? "caktus-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
