import { NextResponse } from "next/server";
import { redisService } from "@/modules/performance/cache/redis-service";
import { auth } from "@/lib/auth";
import { RoleName } from "@/types/rbac";

export async function GET() {
  const session = await auth();
  if (
    !session?.user?.role ||
    (session.user.role !== RoleName.ADMIN &&
      session.user.role !== RoleName.SUPER_ADMIN)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const health = await redisService.getCacheHealth();
    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cache health" },
      { status: 500 },
    );
  }
}
