import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RoleName } from "@/types/rbac";
import { costMonitorService } from "@/modules/performance/monitoring/cost-monitor";

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
    const breakdown = await costMonitorService.getCostBreakdown();
    return NextResponse.json(breakdown);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cost data" },
      { status: 500 },
    );
  }
}
