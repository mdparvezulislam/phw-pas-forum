import { NextResponse } from "next/server";
import { enhancedAuditService } from "@/modules/performance/security/audit";
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
    const events = await enhancedAuditService.getRecentSecurityAlerts();
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch security events" },
      { status: 500 },
    );
  }
}
