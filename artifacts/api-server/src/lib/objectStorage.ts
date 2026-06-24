import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { randomUUID } from "crypto";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export interface StorageFile {
  key: string;
}

export interface ObjectMeta {
  contentType: string;
  contentLength: number;
}

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME not configured.");
  return bucket;
}

export class ObjectStorageService {
  getPrivateObjectDir(): string {
    return process.env.R2_BUCKET_NAME ?? "uploads";
  }

  getPublicObjectSearchPaths(): string[] {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) throw new Error("R2_BUCKET_NAME not configured.");
    return [bucket];
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const client = getR2Client();
    const bucket = getBucketName();
    const key = `uploads/${randomUUID()}`;
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 900 }
    );
    return url;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("http")) return rawPath;
    try {
      const url = new URL(rawPath);
      const parts = url.pathname.split("/").filter(Boolean);
      const bucket = getBucketName();
      const bucketIdx = parts.indexOf(bucket);
      const key =
        bucketIdx >= 0
          ? parts.slice(bucketIdx + 1).join("/")
          : parts.join("/");
      return `/objects/${key}`;
    } catch {
      return rawPath;
    }
  }

  async searchPublicObject(filePath: string): Promise<StorageFile | null> {
    try {
      const client = getR2Client();
      const bucket = getBucketName();
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: filePath }));
      return { key: filePath };
    } catch {
      return null;
    }
  }

  async headObject(file: StorageFile): Promise<ObjectMeta> {
    const client = getR2Client();
    const bucket = getBucketName();
    const response = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: file.key })
    );
    return {
      contentType: response.ContentType ?? "application/octet-stream",
      contentLength: response.ContentLength ?? 0,
    };
  }

  /**
   * Download an object (or a byte range of it) from R2.
   *
   * When `range` is provided (e.g. "bytes=0-1023") R2 returns a 206 Partial
   * Content response with Content-Range and a smaller Content-Length.  We
   * surface both as headers on the returned Response so the route can forward
   * them to the browser unchanged.
   */
  async downloadObject(file: StorageFile, range?: string): Promise<Response> {
    const client = getR2Client();
    const bucket = getBucketName();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: file.key,
      ...(range ? { Range: range } : {}),
    });

    const s3res = await client.send(command);
    const body = s3res.Body as Readable;
    const webStream = Readable.toWeb(body) as ReadableStream;

    const isPartial = range && s3res.ContentRange != null;
    const status = isPartial ? 206 : 200;

    const headers: Record<string, string> = {
      "Content-Type": s3res.ContentType ?? "application/octet-stream",
    };

    if (s3res.ContentLength != null) {
      headers["Content-Length"] = String(s3res.ContentLength);
    }

    if (s3res.ContentRange) {
      headers["Content-Range"] = s3res.ContentRange;
    }

    return new Response(webStream, { status, headers });
  }

  async getObjectEntityFile(objectPath: string): Promise<StorageFile> {
    if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
    const key = objectPath.slice("/objects/".length);
    if (!key) throw new ObjectNotFoundError();
    try {
      const client = getR2Client();
      const bucket = getBucketName();
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return { key };
    } catch {
      throw new ObjectNotFoundError();
    }
  }

  async listObjects(
    prefix = ""
  ): Promise<
    Array<{
      objectPath: string;
      name: string;
      size: number;
      contentType: string;
      updatedAt: string;
    }>
  > {
    const client = getR2Client();
    const bucket = getBucketName();
    const response = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
    );
    const items = (response.Contents ?? []).map((obj) => {
      const key = obj.Key ?? "";
      const namePart = key.replace(/^uploads\/[^/]+\//, "").replace(/^uploads\//, "");
      return {
        objectPath: `/objects/${key}`,
        name: namePart,
        size: obj.Size ?? 0,
        contentType: "application/octet-stream",
        updatedAt: obj.LastModified?.toISOString() ?? "",
      };
    });
    items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return items;
  }

  async trySetObjectEntityAclPolicy(rawPath: string): Promise<string> {
    return rawPath;
  }
}
