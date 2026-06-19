import "server-only";

import { eq } from "drizzle-orm";
import { BaseRepository } from "./base";
import { schema } from "@/db";
import type { NewUser } from "@/db/schema/users";

export class UserRepository extends BaseRepository {
  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: { role: true },
    });
  }

  async findByUsername(username: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.username, username),
      with: { role: true },
    });
  }

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: { role: true },
    });
  }

  async create(data: NewUser) {
    const [user] = await this.db.insert(schema.users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<NewUser>) {
    const [user] = await this.db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async delete(id: string) {
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
  }

  async exists(email: string, username: string): Promise<boolean> {
    const existing = await this.db.query.users.findFirst({
      where: (users, { or }) =>
        or(eq(users.email, email), eq(users.username, username)),
    });
    return !!existing;
  }

  async updateLastLogin(id: string) {
    await this.db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, id));
  }
}

export const userRepository = new UserRepository();
