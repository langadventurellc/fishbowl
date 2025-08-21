import { unlink } from "fs/promises";

export const cleanupAgentsStorage = async (configPath: string) => {
  // Delete agents.json file with retries
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
          `Failed to delete agents config file after 3 attempts: ${message}`,
        );
      } else {
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
};
