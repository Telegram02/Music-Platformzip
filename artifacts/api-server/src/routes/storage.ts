import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { requireAdmin } from "../lib/auth";

const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number(),
  contentType: z.string(),
});

const RequestUploadUrlResponse = z.object({
  uploadURL: z.string(),
  objectPath: z.string(),
  metadata: z.object({ name: z.string(), size: z.number(), contentType: z.string() }),
});

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// CORS headers required for media (audio seeking, cross-origin video).
// Browsers send an OPTIONS preflight before range requests on audio/video —
// without these headers the audio player stalls waiting for permission.
function setMediaCorsHeaders(res: Response): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
}

// Handle OPTIONS preflight for public media files
router.options("/storage/public-objects/*filePath", (_req: Request, res: Response) => {
  setMediaCorsHeaders(res);
  res.setHeader("Access-Control-Max-Age", "86400"); // cache preflight for 24h
  res.sendStatus(204);
});

router.post("/storage/uploads/request-url", requireAdmin, async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json(RequestUploadUrlResponse.parse({ uploadURL, objectPath, metadata: { name, size, contentType } }));
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    if ((error as Error).message?.includes("R2")) {
      res.status(503).json({ error: "File storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME." });
    } else {
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  }
});

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) { res.status(404).json({ error: "File not found" }); return; }

    const response = await objectStorageService.downloadObject(file);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.status === 200) {
      // CORS headers so browsers can make range requests (audio seek, video scrub)
      setMediaCorsHeaders(res);

      // Long-lived cache: Vercel Edge Network serves from CDN after first load.
      // Subsequent visitors never reach this serverless function for the same file.
      res.setHeader("Cache-Control", "public, max-age=31536000, stale-while-revalidate=86400, immutable");
      res.setHeader("Vary", "Accept-Encoding");

      // Required for audio/video seeking in browsers
      res.setHeader("Accept-Ranges", "bytes");
    }

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const response = await objectStorageService.downloadObject(objectFile);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.status === 200) {
      setMediaCorsHeaders(res);
      res.setHeader("Cache-Control", "public, max-age=31536000, stale-while-revalidate=86400, immutable");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Accept-Ranges", "bytes");
    }

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

// OPTIONS preflight for /storage/objects/* (needed for audio/video range requests)
router.options("/storage/objects/*path", (_req: Request, res: Response) => {
  setMediaCorsHeaders(res);
  res.setHeader("Access-Control-Max-Age", "86400");
  res.sendStatus(204);
});

router.get("/storage/bucket/list", requireAdmin, async (req: Request, res: Response) => {
  try {
    const items = await objectStorageService.listObjects("uploads/");
    res.json({ items });
  } catch (error) {
    req.log.error({ err: error }, "Error listing bucket objects");
    if ((error as Error).message?.includes("R2")) {
      res.status(503).json({ error: "File storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME." });
    } else {
      res.status(500).json({ error: "Failed to list bucket objects" });
    }
  }
});

export default router;
