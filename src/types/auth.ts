import type { User } from "@/db/schema/users";
import type { Permission, RoleName } from "./rbac";

export type SessionUser = Pick<
  User,
  | "id"
  | "username"
  | "email"
  | "image"
  | "displayName"
  | "isBanned"
  | "isVerified"
  | "isTwoFactorEnabled"
> & {
  role: RoleName;
  permissions: Permission[];
};

export interface AuthSession {
  user: SessionUser;
  expires: Date;
}

export type AuthProvider = "credentials" | "github" | "google";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
