import { unlink } from "fs/promises";

export const cleanupLlmStorage = async (
  configPath: string,
  keysPath: string,
) => {
  // Delete JSON config file with retries
  for (let i = 0; i < 3; i++) {
    try {
      await unlink(configPath);
      break;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        // File doesn't exist, that's fine
        break;
      }
      if (i === 2) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(
          `Failed to delete config file after 3 attempts: ${message}`,
        );
      } else {
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  // Delete secure keys file with retries
  for (let i = 0; i < 3; i++) {
    try {
      await unlink(keysPath);
      break;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        // File doesn't exist, that's fine
        break;
      }
      if (i === 2) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(`Failed to delete keys file after 3 attempts: ${message}`);
      } else {
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
};
