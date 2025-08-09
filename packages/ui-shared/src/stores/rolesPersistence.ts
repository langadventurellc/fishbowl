/**
 * Persistence layer for roles data.
 *
 * Handles saving/loading roles to/from localStorage with error recovery,
 * data migration, and version compatibility.
 *
 * @module stores/rolesPersistence
 */

import { RoleViewModel } from "../types/settings/RoleViewModel";
import { createLoggerSync } from "@fishbowl-ai/shared";

const STORAGE_KEY = "fishbowl-roles";
const STORAGE_VERSION = "1.0";

// Lazy logger creation to avoid process access in browser context
let logger: ReturnType<typeof createLoggerSync> | null = null;
const getLogger = () => {
  if (!logger) {
    try {
      logger = createLoggerSync({
        context: { metadata: { component: "rolesPersistence" } },
      });
    } catch {
      // Fallback to console in browser contexts where logger creation fails
      logger = {
        error: console.error.bind(console),
        warn: console.warn.bind(console),
      } as ReturnType<typeof createLoggerSync>;
    }
  }
  return logger;
};

interface StorageData {
  version: string;
  roles: RoleViewModel[];
  lastModified: string;
}

export const rolesPersistence = {
  async save(roles: RoleViewModel[]): Promise<void> {
    try {
      const storageData: StorageData = {
        version: STORAGE_VERSION,
        roles,
        lastModified: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      getLogger().error("Failed to save roles", error as Error);
      throw new Error("Unable to save roles to storage");
    }
  },

  async load(): Promise<RoleViewModel[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsedData = JSON.parse(stored) as StorageData;

      // Handle version migration if needed
      if (parsedData.version !== STORAGE_VERSION) {
        getLogger().warn(
          `Roles data version mismatch. Expected ${STORAGE_VERSION}, got ${parsedData.version}`,
        );
        // Perform migration logic here if needed in the future
      }

      // Validate data structure
      if (!Array.isArray(parsedData.roles)) {
        throw new Error("Invalid roles data structure");
      }

      return parsedData.roles;
    } catch (error) {
      getLogger().error("Failed to load roles", error as Error);

      // Return empty array on error but don't throw to prevent app crashes
      return [];
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      getLogger().error("Failed to clear roles", error as Error);
      throw new Error("Unable to clear roles storage");
    }
  },
};
