import { promises as fs } from "fs";
import path from "path";

import type { TestElectronApplication } from "../TestElectronApplication";

/**
 * Resets the test database by deleting the database file
 * Allows app to recreate database with fresh migrations on restart
 */
export async function resetDatabase(
  electronApp: TestElectronApplication,
): Promise<void> {
  const userDataPath = await electronApp.evaluate(async ({ app }) => {
    return app.getPath("userData");
  });

  const dbPath = path.join(userDataPath, "fishbowl.db");

  try {
    await fs.unlink(dbPath);
  } catch {
    // Database might not exist, that's fine for test initialization
  }
}
