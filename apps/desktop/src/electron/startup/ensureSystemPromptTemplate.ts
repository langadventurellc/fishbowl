import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { shouldCopy } from "./shouldCopyFile.js";

const logger = createLoggerSync({
  config: { name: "ensureSystemPromptTemplate", level: "info" },
});

/**
 * Resolve the source file path based on environment.
 */
function resolveSourcePath(): string {
  if (app.isPackaged) {
    // Packaged app: file included via electron-builder extraResources
    return path.join(process.resourcesPath, "system-prompt.txt");
  }

  // Development or E2E test: locate file from project root resources
  const appPath = app.getAppPath();
  const isTest = process.env.NODE_ENV === "test";
  // E2E tests need to go up 4 levels, development only needs 2
  const projectRoot = isTest
    ? path.resolve(appPath, "..", "..", "..", "..")
    : path.resolve(appPath, "..", "..");
  return path.join(projectRoot, "resources", "system-prompt.txt");
}

/**
 * Validate that the source file exists and log appropriate errors.
 */
function validateSourceFile(bundleSourceFile: string): void {
  if (!fs.existsSync(bundleSourceFile)) {
    const error = new Error(`Source file not found: ${bundleSourceFile}`);
    logger.error("System prompt template source file missing", error, {
      bundleSourceFile,
      isPackaged: app.isPackaged,
      nodeEnv: process.env.NODE_ENV,
    });
    throw error;
  }
}

/**
 * Copy the file from source to destination with error handling.
 */
function copyFile(
  bundleSourceFile: string,
  userDataFile: string,
  systemPromptsDir: string,
): void {
  try {
    // Ensure destination directory exists
    fs.mkdirSync(systemPromptsDir, { recursive: true });

    // Copy from bundle to userData
    fs.copyFileSync(bundleSourceFile, userDataFile);

    logger.info("System prompt template copied successfully", {
      from: bundleSourceFile,
      to: userDataFile,
    });
  } catch (error) {
    // Log error but don't crash the app
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to copy system prompt template", errorObj, {
      bundleSourceFile,
      userDataFile,
    });

    // Re-throw specific errors for debugging
    if (error instanceof Error) {
      const nodeError = error as { code?: string };
      if (nodeError.code === "ENOENT") {
        logger.error("Source file not found during copy", error, {
          bundleSourceFile,
        });
      } else if (nodeError.code === "EACCES") {
        logger.error("Permission denied accessing destination", error, {
          userDataPath: systemPromptsDir,
        });
      }
    }

    throw error;
  }
}

/**
 * Ensure system prompt template file is copied to userData on startup.
 *
 * - Packaged: copy from process.resourcesPath
 * - Dev/E2E: copy from projectRoot/resources (mirrors personality definitions logic)
 *
 * Copies if destination is missing or if source file is newer than destination.
 */
export async function ensureSystemPromptTemplate(): Promise<void> {
  const userDataPath = app.getPath("userData");
  const systemPromptsDir = path.join(userDataPath, "system-prompts");
  const userDataFile = path.join(systemPromptsDir, "system-prompt.txt");

  // Determine source file based on environment
  const bundleSourceFile = resolveSourcePath();

  // Validate source file exists
  try {
    validateSourceFile(bundleSourceFile);
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to validate source file", errorObj, {
      bundleSourceFile,
    });
    throw error;
  }

  // Check if we need to copy the file
  if (!shouldCopy(bundleSourceFile, userDataFile)) {
    logger.debug("System prompt template is up to date", {
      userDataFile,
      bundleSourceFile,
    });
    return;
  }

  // Copy the file
  copyFile(bundleSourceFile, userDataFile, systemPromptsDir);
}
