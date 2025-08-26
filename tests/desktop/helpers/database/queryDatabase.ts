import sqlite3 from "sqlite3";
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

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      dbPath,
      sqlite3.OPEN_READONLY,
      (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }

        // Enable foreign key constraints to match production behavior
        db.exec("PRAGMA foreign_keys = ON");

        db.all(sql, params, (err: Error | null, rows: T[]) => {
          db.close((closeErr: Error | null) => {
            if (err) {
              reject(err);
            } else if (closeErr) {
              reject(closeErr);
            } else {
              resolve(rows || []);
            }
          });
        });
      },
    );
  });
}
