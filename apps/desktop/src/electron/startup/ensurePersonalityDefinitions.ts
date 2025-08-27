import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

/**
 * Ensure personality definitions file is copied from bundle to userData on first run.
 * In packaged apps, copies from process.resourcesPath to userData directory.
 * Never overwrites existing userData copy (preserves user modifications).
 */
export async function ensurePersonalityDefinitions(): Promise<void> {
  // Only perform copy in packaged apps (production)
  if (!app.isPackaged) {
    return;
  }

  const userDataPath = app.getPath("userData");
  const userDataFile = path.join(userDataPath, "personality_definitions.json");

  // Skip if file already exists (never overwrite user modifications)
  if (fs.existsSync(userDataFile)) {
    return;
  }

  const bundleSourceFile = path.join(
    process.resourcesPath,
    "personality_definitions.json",
  );

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
