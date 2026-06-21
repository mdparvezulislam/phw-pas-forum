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

  const deployments = [
    {
      id: "1",
      version: process.env.npm_package_version ?? "1.0.0",
      environment: "production",
      status: "healthy",
      deployedAt: new Date().toISOString(),
      commitSha: process.env.GITHUB_SHA ?? "local",
      commitMessage: "Production deployment",
    },
  ];

  return NextResponse.json(deployments);
}
