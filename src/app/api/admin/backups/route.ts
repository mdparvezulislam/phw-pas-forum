import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RoleName } from "@/types/rbac";
import { redisService } from "@/modules/performance/cache/redis-service";

export async function GET() {
  const session = await auth();
  if (
    !session?.user?.role ||
    (session.user.role !== RoleName.ADMIN &&
      session.user.role !== RoleName.SUPER_ADMIN)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lastBackup = await redisService.get<string>("backup:last_timestamp");
  const lastSize = await redisService.get<string>("backup:last_size");
  const lastStatus = await redisService.get<"success" | "failed">(
    "backup:last_status",
  );
  const totalCount = await redisService.get<number>("backup:total_count");

  return NextResponse.json({
    lastBackup,
    lastBackupSize: lastSize,
    lastBackupStatus: lastStatus,
    totalBackups: totalCount ?? 0,
    totalSize: "N/A",
    nextScheduledBackup: null,
  });
}
