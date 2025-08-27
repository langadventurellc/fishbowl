import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

/**
 * Ensure personality definitions file is copied to userData on first run.
 *
 * - Packaged: copy from process.resourcesPath
 * - Dev/E2E: copy from projectRoot/resources (mirrors migrations path logic)
 *
 * Never overwrites an existing userData copy (preserves user modifications).
 */
export async function ensurePersonalityDefinitions(): Promise<void> {
  const userDataPath = app.getPath("userData");
  const userDataFile = path.join(userDataPath, "personality_definitions.json");

  // Skip if file already exists (never overwrite user modifications)
  if (fs.existsSync(userDataFile)) {
    return;
  }

  // Determine source file based on environment
  const bundleSourceFile = (() => {
    if (app.isPackaged) {
      // Packaged app: file included via electron-builder extraResources
      return path.join(process.resourcesPath, "personality_definitions.json");
    }

    // Development or E2E test: locate file from project root resources
    const appPath = app.getAppPath();
    const isTest = process.env.NODE_ENV === "test";
    // E2E tests need to go up 4 levels, development only needs 2
    const projectRoot = isTest
      ? path.resolve(appPath, "..", "..", "..", "..")
      : path.resolve(appPath, "..", "..");
    return path.join(projectRoot, "resources", "personality_definitions.json");
  })();

  try {
    // Ensure userData directory exists
    fs.mkdirSync(userDataPath, { recursive: true });

    // Copy from bundle to userData
    fs.copyFileSync(bundleSourceFile, userDataFile);

    console.log(
      `First-run copy: personality definitions copied to ${userDataFile}`,
    );
  } catch (error) {
    // Log error but don't crash the app
    console.error(
      "Failed to copy personality definitions on first run:",
      error,
    );

    // Re-throw specific errors for debugging
    if (error instanceof Error) {
      const nodeError = error as { code?: string };
      if (nodeError.code === "ENOENT") {
        console.error(`Source file not found: ${bundleSourceFile}`);
      } else if (nodeError.code === "EACCES") {
        console.error(`Permission denied accessing: ${userDataPath}`);
      }
    }

    throw error;
  }
}
