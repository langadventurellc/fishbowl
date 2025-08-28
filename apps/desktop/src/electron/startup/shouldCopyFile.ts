import fs from "node:fs";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "shouldCopyFile", level: "info" },
});

/**
 * Check if source file should be copied to destination based on modification time.
 * Extracted for unit testing.
 *
 * @param sourcePath - Path to the source file
 * @param destPath - Path to the destination file
 * @returns true if the file should be copied (missing dest or source is newer)
 */
export function shouldCopy(sourcePath: string, destPath: string): boolean {
  // Copy if destination doesn't exist
  if (!fs.existsSync(destPath)) {
    return true;
  }

  try {
    const sourceStats = fs.statSync(sourcePath);
    const destStats = fs.statSync(destPath);

    // Copy if source is newer than destination
    return sourceStats.mtime > destStats.mtime;
  } catch (error) {
    logger.warn("Failed to compare file modification times, will copy", {
      error: error instanceof Error ? error.message : String(error),
      sourcePath,
      destPath,
    });
    // If we can't compare, err on the side of copying
    return true;
  }
}
