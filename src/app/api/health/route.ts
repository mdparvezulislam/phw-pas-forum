import { NextResponse } from "next/server";
import { healthService } from "@/modules/infrastructure/monitoring/health-service";
import { getEnv } from "@/validations/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = getEnv();

  // Validate HEALTH_CHECK_SECRET if configured
  if (env.HEALTH_CHECK_SECRET) {
    const { searchParams } = new URL(request.url);
    const token =
      searchParams.get("token") || request.headers.get("x-health-token");

    if (token !== env.HEALTH_CHECK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const report = await healthService.getFullHealth();
    const isOk = report.status !== "unhealthy";

    return NextResponse.json(report, {
      status: isOk ? 200 : 503,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message || String(error) },
      { status: 503 },
    );
  }
}
