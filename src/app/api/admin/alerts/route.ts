import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RoleName } from "@/types/rbac";
import { alertingService } from "@/modules/performance/monitoring/alerting";

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
    const alerts = alertingService.getAlertHistory();
    const rules = alertingService.getRules();
    const unacknowledged = alertingService.getUnacknowledgedCount();

    return NextResponse.json({
      alerts,
      rules: rules.map((r) => ({
        name: r.name,
        description: r.description,
        severity: r.severity,
      })),
      unacknowledged,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 },
    );
  }
}
