import type { SessionUser } from "@/types/auth";
import {
  type Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  RoleName,
} from "@/types/rbac";

export function getRoleHierarchy(role: RoleName): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function getPermissionsForRole(role: RoleName): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  user: SessionUser | null,
  permission: Permission,
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: SessionUser | null,
  permissions: Permission[],
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

export function hasAllPermissions(
  user: SessionUser | null,
  permissions: Permission[],
): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

export function hasRole(
  user: Pick<SessionUser, "role"> | null,
  role: RoleName,
): boolean {
  if (!user) return false;
  return getRoleHierarchy(user.role) >= getRoleHierarchy(role);
}

export function isAtLeast(
  user: Pick<SessionUser, "role"> | null,
  minimumRole: RoleName,
): boolean {
  if (!user) return false;
  return getRoleHierarchy(user.role) >= getRoleHierarchy(minimumRole);
}

export function canModerate(user: Pick<SessionUser, "role"> | null): boolean {
  if (!user) return false;
  return getRoleHierarchy(user.role) >= getRoleHierarchy(RoleName.MODERATOR);
}

export function canAdmin(user: Pick<SessionUser, "role"> | null): boolean {
  if (!user) return false;
  return getRoleHierarchy(user.role) >= getRoleHierarchy(RoleName.ADMIN);
}
