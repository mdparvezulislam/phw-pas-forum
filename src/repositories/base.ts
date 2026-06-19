import "server-only";

import { type Database, getDatabase } from "@/db";

export abstract class BaseRepository {
  protected db: Database;

  constructor() {
    this.db = getDatabase();
  }
}
