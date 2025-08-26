import sqlite3 from "sqlite3";
import path from "path";

import type { TestElectronApplication } from "../TestElectronApplication";

/**
 * Executes a modification query (INSERT, UPDATE, DELETE) on the test database
 * @param electronApp - The test electron application instance
 * @param sql - SQL statement to execute
 * @param params - Parameters for the SQL statement
 * @returns Promise that resolves when the query completes
 */
export async function executeDatabase(
  electronApp: TestElectronApplication,
  sql: string,
  params: unknown[] = [],
): Promise<void> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      dbPath,
      sqlite3.OPEN_READWRITE,
      (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }

        // Enable foreign key constraints to match production behavior
        db.exec("PRAGMA foreign_keys = ON");

        db.run(sql, params, function (err: Error | null) {
          db.close((closeErr: Error | null) => {
            if (err) {
              reject(err);
            } else if (closeErr) {
              reject(closeErr);
            } else {
              resolve();
            }
          });
        });
      },
    );
  });
}
