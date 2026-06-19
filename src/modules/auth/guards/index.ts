import "server-only";

import { auth } from "@/lib/auth";
import {
  hasPermission,
  isAtLeast,
} from "@/config/rbac";
import type { Permission } from "@/types/rbac";
import type { RoleName } from "@/types/rbac";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError("Authentication required");
  }
  return session.user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError("Insufficient permissions");
  }
  return user;
}

export async function requireRole(minimumRole: RoleName) {
  const user = await requireAuth();
  if (!isAtLeast(user, minimumRole)) {
    throw new AuthorizationError("Insufficient role");
  }
  return user;
}

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}
