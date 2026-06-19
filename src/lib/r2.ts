import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/validations/env";

let _r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_r2Client) return _r2Client;

  const env = getEnv();

  _r2Client = new S3Client({
    region: env.R2_REGION,
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  return _r2Client;
}

export class R2Storage {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = getR2Client();
    this.bucket = getEnv().R2_BUCKET_NAME;
  }

  async upload(
    key: string,
    body: Buffer | Uint8Array | Blob,
    contentType?: string,
  ): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);

    const url = await this.getPublicUrl(key);
    return { url, key };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getPublicUrl(key: string): Promise<string> {
    const env = getEnv();
    if (env.R2_PUBLIC_URL) {
      return `${env.R2_PUBLIC_URL}/${key}`;
    }
    return `${env.R2_ENDPOINT}/${this.bucket}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async deleteMany(prefix: string): Promise<void> {
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const listResponse = await this.client.send(listCommand);

    if (!listResponse.Contents?.length) return;

    for (const object of listResponse.Contents) {
      if (object.Key) {
        await this.delete(object.Key);
      }
    }
  }

  async list(prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const response = await this.client.send(command);
    return response.Contents?.map((obj) => obj.Key ?? "").filter(Boolean) ?? [];
  }
}

export const storage = new R2Storage();
