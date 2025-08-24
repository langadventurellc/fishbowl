import Database from "better-sqlite3";
import path from "path";

import type { TestElectronApplication } from "../TestElectronApplication";

/**
 * Executes a SELECT query on the test database and returns results
 */
export async function queryDatabase<T = unknown>(
  electronApp: TestElectronApplication,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");

  let db: Database.Database | null = null;
  try {
    db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare(sql);
    const results = stmt.all(...params) as T[];
    return results;
  } finally {
    if (db) {
      db.close();
    }
  }
}
