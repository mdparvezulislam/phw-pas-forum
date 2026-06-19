import type { SessionUser } from "@/types/auth";
import type { RoleName, Permission } from "@/types/rbac";

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    id: string;
  }

  interface JWT {
    id: string;
    username: string | null;
    displayName: string | null;
    role: RoleName;
    permissions: Permission[];
    isBanned: boolean;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string | null;
    displayName: string | null;
    role: RoleName;
    permissions: Permission[];
    isBanned: boolean;
    isVerified: boolean;
  }
}
