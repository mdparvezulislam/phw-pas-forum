import { NextResponse } from "next/server";
import { searchOptimizationService } from "@/modules/performance/search";
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
    const metrics = await searchOptimizationService.getCollectionMetrics();
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch search metrics" },
      { status: 500 },
    );
  }
}
