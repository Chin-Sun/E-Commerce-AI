import OSS from "ali-oss";
import { ENV } from "./_core/env";

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
