import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDatabase } from "@/db";
import { schema } from "@/db";
import { verifyPassword } from "@/modules/auth/helpers";
import type { SessionUser } from "@/types/auth";
import { RoleName, type Permission } from "@/types/rbac";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDatabase(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
    authenticatorsTable: schema.authenticators,
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = getDatabase();

        const user = await db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.email, credentials.email as string),
          with: {
            role: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        if (user.isBanned) {
          throw new Error("Account is banned");
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.displayName ?? user.username ?? undefined,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const db = getDatabase();

        const dbUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, user.id as string),
          with: {
            role: true,
          },
        });

        if (!dbUser) return token;

        const { getPermissionsForRole } = await import("@/config/rbac");
        const dbUserAny = dbUser as any;

        token.id = dbUserAny.id;
        token.username = dbUserAny.username;
        token.displayName = dbUserAny.displayName;
        token.role = dbUserAny.role?.name ?? RoleName.MEMBER;
        token.permissions = getPermissionsForRole(
          (dbUserAny.role?.name as RoleName) ?? RoleName.MEMBER,
        );
        token.isBanned = dbUserAny.isBanned;
        token.isVerified = dbUserAny.isVerified;
      }

      return token;
    },
    async session({ session, token }) {
      const sessionUser: SessionUser = {
        id: token.id as string,
        username: (token.username as string) ?? "",
        email: session.user?.email ?? "",
        displayName: (token.displayName as string) ?? (token.name as string) ?? "",
        image: (session.user?.image as string) ?? null,
        isBanned: (token.isBanned as boolean) ?? false,
        isVerified: (token.isVerified as boolean) ?? false,
        isTwoFactorEnabled: false,
        role: (token.role as RoleName) ?? RoleName.GUEST,
        permissions: (token.permissions as Permission[]) ?? [],
      };

      return {
        ...session,
        user: sessionUser,
      };
    },
  },
});
