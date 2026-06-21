import { NextResponse } from "next/server";
import { healthService } from "@/modules/infrastructure/monitoring/health-service";
import { getEnv } from "@/validations/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = getEnv();

  if (env.HEALTH_CHECK_SECRET) {
    const { searchParams } = new URL(request.url);
    const token =
      searchParams.get("token") || request.headers.get("x-health-token");
    if (token !== env.HEALTH_CHECK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const stat = await healthService.checkDatabase();
  return NextResponse.json(stat, {
    status: stat.status === "up" ? 200 : 503,
  });
}
