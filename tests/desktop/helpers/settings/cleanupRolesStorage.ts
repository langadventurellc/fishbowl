import { unlink } from "fs/promises";

/**
 * Cleans up roles storage by deleting the configuration file.
 * Includes retry logic to handle file locks and timing issues.
 *
 * @param rolesConfigPath Path to the roles.json configuration file
 */
export const cleanupRolesStorage = async (rolesConfigPath: string) => {
  // Delete JSON config file with retries
  for (let i = 0; i < 3; i++) {
    try {
      await unlink(rolesConfigPath);
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
          `Failed to delete roles config file after 3 attempts: ${message}`,
        );
      } else {
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
};
