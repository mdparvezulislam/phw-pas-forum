import "server-only";

import sharp, { type OutputInfo } from "sharp";
import { storage } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "@/validations/env";

export class ImageProcessor {
  /**
   * Optimize image using sharp. Strips metadata, resizes if too large, and compresses to webp/avif.
   */
  async optimizeImage(
    buffer: Buffer,
    format: "webp" | "avif" = "webp",
    maxWidth = 1920,
    maxHeight = 1080,
  ): Promise<{ data: Buffer; info: OutputInfo }> {
    let pipeline = sharp(buffer).rotate();

    // Resize if dimensions exceed limits
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

    if (format === "webp") {
      pipeline = pipeline.webp({ quality: 80, effort: 4 });
    } else {
      pipeline = pipeline.avif({ quality: 70, effort: 4 });
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { data, info };
  }

  /**
   * Generate 200x200 cropped square thumbnail for user avatars or marketplace cards
   */
  async generateThumbnail(
    buffer: Buffer,
    format: "webp" | "avif" = "webp",
  ): Promise<Buffer> {
    let pipeline = sharp(buffer).rotate().resize(200, 200, {
      fit: "cover",
      position: "center",
    });

    if (format === "webp") {
      pipeline = pipeline.webp({ quality: 75 });
    } else {
      pipeline = pipeline.avif({ quality: 65 });
    }

    return pipeline.toBuffer();
  }

  /**
   * Uploads processed image with CDN Cache-Control headers
   */
  async uploadOptimized(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ url: string; key: string }> {
    const bucket = getEnv().R2_BUCKET_NAME;
    const client = (storage as any).client;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable", // Cloudflare CDN cache forever
    });

    await client.send(command);

    const url = await storage.getPublicUrl(key);
    return { url, key };
  }
}

export const imageProcessor = new ImageProcessor();
export default imageProcessor;
