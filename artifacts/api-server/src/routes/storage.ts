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

// Pipe a fetch-style Response body to an Express response, forwarding status +
// headers.  Adds the media CORS + caching headers that every media endpoint
// needs regardless of whether the response is 200 or 206.
async function pipeMediaResponse(
  r2Response: Response,
  res: Response
): Promise<void> {
  res.status(r2Response.status);
  r2Response.headers.forEach((value, key) => res.setHeader(key, value));

  setMediaCorsHeaders(res);
  res.setHeader("Accept-Ranges", "bytes");

  // Only set immutable cache on full (200) responses.
  // 206 partial responses must NOT be cached immutably — the browser needs to
  // be able to request different ranges for the same URL.
  if (r2Response.status === 200) {
    res.setHeader("Cache-Control", "public, max-age=31536000, stale-while-revalidate=86400, immutable");
  } else {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
  res.setHeader("Vary", "Range, Accept-Encoding");

  if (r2Response.body) {
    const nodeStream = Readable.fromWeb(r2Response.body as ReadableStream<Uint8Array>);
    nodeStream.pipe(res);
  } else {
    res.end();
  }
}

// ── OPTIONS preflight ────────────────────────────────────────────────────────

router.options("/storage/public-objects/*filePath", (_req: Request, res: Response) => {
  setMediaCorsHeaders(res);
  res.setHeader("Access-Control-Max-Age", "86400");
  res.sendStatus(204);
});

router.options("/storage/objects/*path", (_req: Request, res: Response) => {
  setMediaCorsHeaders(res);
  res.setHeader("Access-Control-Max-Age", "86400");
  res.sendStatus(204);
});

// ── Upload URL generation (admin only) ──────────────────────────────────────

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

// ── Public objects (legacy path) ─────────────────────────────────────────────

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) { res.status(404).json({ error: "File not found" }); return; }

    const range = req.headers.range;
    const r2Response = await objectStorageService.downloadObject(file, range);
    await pipeMediaResponse(r2Response, res);
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

// ── Main media serving ───────────────────────────────────────────────────────

// HEAD — browsers probe this to get Content-Length before they can seek.
// Without a proper HEAD response the audio player cannot calculate seek
// positions and will refuse to seek or display duration.
router.head("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    const meta = await objectStorageService.headObject(objectFile);

    setMediaCorsHeaders(res);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", meta.contentType);
    res.setHeader("Content-Length", String(meta.contentLength));
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).end();
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).end();
      return;
    }
    req.log.error({ err: error }, "Error serving HEAD for object");
    res.status(500).end();
  }
});

// GET — serves full file (200) or a byte range (206).
// The Range header is forwarded directly to R2 so the browser only downloads
// the chunk it needs, enabling instant scrubbing without buffering the whole
// file first.
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const range = req.headers.range;
    const r2Response = await objectStorageService.downloadObject(objectFile, range);
    await pipeMediaResponse(r2Response, res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

// ── Admin: bucket listing ────────────────────────────────────────────────────

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
