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

  async downloadObject(file: StorageFile, cacheTtlSec = 3600): Promise<Response> {
    const client = getR2Client();
    const bucket = getBucketName();
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: file.key })
    );
    const body = response.Body as Readable;
    const webStream = Readable.toWeb(body) as ReadableStream;
    return new Response(webStream, {
      headers: {
        "Content-Type": response.ContentType ?? "application/octet-stream",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
        ...(response.ContentLength
          ? { "Content-Length": String(response.ContentLength) }
          : {}),
      },
    });
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
