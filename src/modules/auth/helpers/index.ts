import "server-only";

import { compare, hash } from "bcryptjs";
import { getDatabase, schema } from "@/db";
import type { User } from "@/db/schema/users";
import type { SessionUser } from "@/types/auth";
import type { Permission } from "@/types/rbac";
import { ROLE_PERMISSIONS, RoleName } from "@/types/rbac";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  return compare(password, hashed);
}

export async function getUserRolePermissions(
  userId: string,
): Promise<{ role: RoleName; permissions: Permission[] }> {
  const db = getDatabase();
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userAny = user as any;
  const roleName = (userAny.role?.name as RoleName) ?? RoleName.MEMBER;
  const permissions = ROLE_PERMISSIONS[roleName] ?? [];

  return { role: roleName, permissions };
}

export function toSessionUser(
  user: User,
  role: RoleName,
  permissions: Permission[],
): SessionUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    image: user.image,
    isBanned: user.isBanned,
    isVerified: user.isVerified,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    role,
    permissions,
  };
}
