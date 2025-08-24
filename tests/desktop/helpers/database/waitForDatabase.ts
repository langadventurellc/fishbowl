import sqlite3 from "sqlite3";
import path from "path";
import { promises as fs } from "fs";

import type { TestElectronApplication } from "../TestElectronApplication";

/**
 * Waits for the database to be created and accessible
 */
export async function waitForDatabase(
  electronApp: TestElectronApplication,
  timeoutMs = 10000,
): Promise<void> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Check if file exists
      await fs.access(dbPath);

      // Try to connect to the database
      await new Promise<void>((resolve, reject) => {
        const db = new sqlite3.Database(
          dbPath,
          sqlite3.OPEN_READONLY,
          (err: Error | null) => {
            if (err) {
              reject(err);
              return;
            }

            // Try a simple query to ensure the database is properly initialized
            db.get(
              "SELECT name FROM sqlite_master WHERE type='table' LIMIT 1",
              (err: Error | null) => {
                db.close((closeErr: Error | null) => {
                  if (err || closeErr) {
                    reject(err || closeErr);
                  } else {
                    resolve();
                  }
                });
              },
            );
          },
        );
      });

      // If we get here, the database is accessible
      return;
    } catch {
      // Wait a bit before trying again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`Database not ready after ${timeoutMs}ms timeout`);
}
