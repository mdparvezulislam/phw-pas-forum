import { NextResponse } from "next/server";
import { FILE_LIMITS } from "@/constants";
import { storage } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { rateLimiter } from "@/services/rate-limit";

/**
 * Direct image upload endpoint used by the TipTap UploadImage extension's
 * default uploadFn (paste/drop). Larger/attachment uploads go through the
 * presigned-URL flow in src/modules/media/actions/upload.ts.
 *
 * This route is intentionally restricted to image types and enforces auth +
 * rate limiting server-side.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await rateLimiter.check("FORUM_POST", session.user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait." },
      { status: 429 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!FILE_LIMITS.IMAGE_ALLOWED_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      {
        error: `File type "${file.type}" is not allowed. Accepted: ${FILE_LIMITS.IMAGE_ALLOWED_TYPES.join(", ")}`,
      },
      { status: 415 },
    );
  }

  if (file.size > FILE_LIMITS.IMAGE_MAX_SIZE) {
    const maxMB = Math.round(FILE_LIMITS.IMAGE_MAX_SIZE / (1024 * 1024));
    return NextResponse.json(
      { error: `Image exceeds the ${maxMB}MB limit.` },
      { status: 413 },
    );
  }

  const ext = file.name.split(".").pop() || "bin";
  const uuid = crypto.randomUUID();
  const key = `attachments/${session.user.id}/${uuid}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await storage.upload(key, buffer, file.type);

    const url = await storage.getPublicUrl(key);

    return NextResponse.json({
      url,
      key,
      alt: file.name,
    });
  } catch (error) {
    console.error("[/api/upload] upload failed", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
