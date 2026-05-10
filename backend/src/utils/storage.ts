import OSS from "ali-oss";
import path from "path";
import fs from "fs/promises";
import { ENV } from "./env";

function isOssConfigured(): boolean {
  return !!(ENV.ossAccessKeyId && ENV.ossAccessKeySecret && ENV.ossBucket && ENV.ossRegion);
}

function getClient(): OSS {
  return new OSS({
    region: ENV.ossRegion,
    accessKeyId: ENV.ossAccessKeyId,
    accessKeySecret: ENV.ossAccessKeySecret,
    bucket: ENV.ossBucket,
    secure: true,
  });
}

function toCdnUrl(ossUrl: string): string {
  if (!ENV.ossCdnDomain) return ossUrl;
  return ossUrl.replace(/^https?:\/\/[^/]+/, `https://${ENV.ossCdnDomain}`);
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  if (!isOssConfigured()) {
    const dest = path.join(process.cwd(), "uploads", key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, Buffer.isBuffer(data) ? data : Buffer.from(data as any));
    return { key, url: `/uploads/${key}` };
  }

  const client = getClient();
  const result = await client.put(
    key,
    Buffer.isBuffer(data) ? data : Buffer.from(data as any),
    { mime: contentType }
  );
  return { key, url: toCdnUrl(result.url) };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const client = getClient();
  const url = client.signatureUrl(key, { expires: 86400 });
  return { key, url: toCdnUrl(url) };
}
