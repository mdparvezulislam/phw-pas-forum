import "server-only";

import { getDatabase, type Database } from "@/db";

export abstract class BaseRepository {
  protected db: Database;

  constructor() {
    this.db = getDatabase();
  }
}
