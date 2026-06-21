import "server-only";
import sharp from "sharp";
import { IMAGE_PROCESSING, FILE_LIMITS } from "@/constants";
import { logger } from "@/lib/logger";
import { getEnv } from "@/validations/env";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

interface ProcessedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
}

interface PendingJob {
  id: string;
  storageKey: string;
  type: "thumbnail" | "preview" | "avatar" | "cover";
}

export class MediaOptimizationService {
  private s3: S3Client | null = null;
  private pendingQueue: PendingJob[] = [];

  private getS3Client(): S3Client {
    if (this.s3) return this.s3;
    const env = getEnv();
    this.s3 = new S3Client({
      endpoint: env.R2_ENDPOINT,
      region: env.R2_REGION,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
    return this.s3;
  }

  async optimizeImage(
    input: Buffer | string,
    options: ImageProcessingOptions = {},
  ): Promise<ProcessedImage> {
    const format = (options.format ?? IMAGE_PROCESSING.PREFERRED_FORMAT) as
      | "jpeg"
      | "png"
      | "webp"
      | "avif";
    const quality = options.quality ?? IMAGE_PROCESSING.QUALITY;

    let pipeline = sharp(input);

    const metadata = await pipeline.metadata();

    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: options.fit ?? "cover",
        withoutEnlargement: true,
      });
    }

    pipeline = pipeline.rotate();

    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case "png":
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          palette: true,
        });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality, effort: 6 });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality, effort: 6 });
        break;
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      format: info.format,
      width: info.width,
      height: info.height,
      size: info.size,
    };
  }

  async generateThumbnail(input: Buffer): Promise<ProcessedImage> {
    return this.optimizeImage(input, {
      width: IMAGE_PROCESSING.THUMBNAIL_WIDTH,
      height: IMAGE_PROCESSING.THUMBNAIL_HEIGHT,
      quality: IMAGE_PROCESSING.THUMBNAIL_QUALITY,
      format: "webp",
    });
  }

  async generatePreview(input: Buffer): Promise<ProcessedImage> {
    return this.optimizeImage(input, {
      width: IMAGE_PROCESSING.PREVIEW_WIDTH,
      height: IMAGE_PROCESSING.PREVIEW_HEIGHT,
      quality: IMAGE_PROCESSING.QUALITY,
      format: "webp",
    });
  }

  async generateAvatar(input: Buffer): Promise<ProcessedImage> {
    return this.optimizeImage(input, {
      width: IMAGE_PROCESSING.AVATAR_SIZE,
      height: IMAGE_PROCESSING.AVATAR_SIZE,
      quality: IMAGE_PROCESSING.QUALITY,
      format: "webp",
    });
  }

  async processAndUpload(
    input: Buffer,
    storageKey: string,
    bucket?: string,
  ): Promise<{
    original: ProcessedImage;
    thumbnail: ProcessedImage;
    preview: ProcessedImage;
  }> {
    const env = getEnv();
    const targetBucket = bucket ?? env.R2_BUCKET_NAME;

    const [original, thumbnail, preview] = await Promise.all([
      this.optimizeImage(input, { format: "webp" }),
      this.generateThumbnail(input),
      this.generatePreview(input),
    ]);

    const client = this.getS3Client();

    await Promise.all([
      client.send(
        new PutObjectCommand({
          Bucket: targetBucket,
          Key: storageKey,
          Body: original.buffer,
          ContentType: `image/${original.format}`,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      ),
      client.send(
        new PutObjectCommand({
          Bucket: targetBucket,
          Key: `thumbnails/${storageKey}`,
          Body: thumbnail.buffer,
          ContentType: `image/${thumbnail.format}`,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      ),
      client.send(
        new PutObjectCommand({
          Bucket: targetBucket,
          Key: `previews/${storageKey}`,
          Body: preview.buffer,
          ContentType: `image/${preview.format}`,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      ),
    ]);

    logger.info("[MediaOptimization] Image processed and uploaded", {
      storageKey,
      originalSize: original.size,
      thumbnailSize: thumbnail.size,
      previewSize: preview.size,
    });

    return { original, thumbnail, preview };
  }

  async processImageForAttachment(
    input: Buffer,
    originalName: string,
  ): Promise<{
    buffer: Buffer;
    format: string;
    webpBuffer?: Buffer;
  }> {
    const metadata = await sharp(input).metadata();
    const fmt = metadata.format ?? "unknown";
    const shouldConvert = !["gif", "png", "webp", "avif"].includes(fmt);

    if (!shouldConvert) {
      const webpImg = await this.optimizeImage(input, {
        format: "webp",
        quality: IMAGE_PROCESSING.QUALITY,
      });
      return {
        buffer: input,
        format: fmt,
        webpBuffer: webpImg.buffer,
      };
    }

    const optimized = await this.optimizeImage(input, {
      format: "webp",
      quality: IMAGE_PROCESSING.QUALITY,
    });

    return {
      buffer: input,
      format: fmt,
      webpBuffer: optimized.buffer,
    };
  }

  async getImageDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number } | null> {
    try {
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.height) {
        return { width: metadata.width, height: metadata.height };
      }
      return null;
    } catch {
      return null;
    }
  }

  validateImage(buffer: Buffer): { valid: boolean; error?: string } {
    try {
      if (buffer.length > FILE_LIMITS.IMAGE_MAX_SIZE) {
        return { valid: false, error: "Image exceeds maximum file size" };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Invalid image data" };
    }
  }

  enqueueProcessing(storageKey: string, type: PendingJob["type"]): void {
    this.pendingQueue.push({
      id: crypto.randomUUID(),
      storageKey,
      type,
    });
  }

  async processPendingQueue(): Promise<void> {
    const batch = this.pendingQueue.splice(0, 10);
    if (batch.length === 0) return;

    const env = getEnv();
    const client = this.getS3Client();

    for (const job of batch) {
      try {
        const response = await client.send(
          new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: job.storageKey,
          }),
        );

        const body = await response.Body?.transformToByteArray();
        if (!body) continue;

        const buffer = Buffer.from(body);

        if (job.type === "thumbnail") {
          await this.generateThumbnail(buffer);
        } else if (job.type === "avatar") {
          await this.generateAvatar(buffer);
        } else if (job.type === "preview") {
          await this.generatePreview(buffer);
        }

        logger.debug("[MediaOptimization] Pending job processed", {
          storageKey: job.storageKey,
          type: job.type,
        });
      } catch (err) {
        logger.error("[MediaOptimization] Pending job failed", err as Error, {
          storageKey: job.storageKey,
          type: job.type,
        });
      }
    }
  }
}

export const mediaOptimizationService = new MediaOptimizationService();
