import { NextResponse } from "next/server";
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

  return NextResponse.json({
    incidents: [],
    total: 0,
    active: 0,
    resolved: 0,
  });
}
