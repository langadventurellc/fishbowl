/**
 * Persistence layer for custom roles data.
 *
 * Handles saving/loading custom roles to/from localStorage with error recovery,
 * data migration, and version compatibility.
 *
 * @module stores/customRolesPersistence
 */

import type { CustomRoleViewModel } from "../types/ui/settings";

const STORAGE_KEY = "fishbowl-custom-roles";
const STORAGE_VERSION = "1.0";

interface StorageData {
  version: string;
  roles: CustomRoleViewModel[];
  lastModified: string;
}

export const customRolesPersistence = {
  async save(roles: CustomRoleViewModel[]): Promise<void> {
    try {
      const storageData: StorageData = {
        version: STORAGE_VERSION,
        roles,
        lastModified: new Date().toISOString(),
      };

      // eslint-disable-next-line no-undef
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Failed to save custom roles:", error);
      throw new Error("Unable to save custom roles to storage");
    }
  },

  async load(): Promise<CustomRoleViewModel[]> {
    try {
      // eslint-disable-next-line no-undef
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsedData = JSON.parse(stored) as StorageData;

      // Handle version migration if needed
      if (parsedData.version !== STORAGE_VERSION) {
        console.warn(
          `Custom roles data version mismatch. Expected ${STORAGE_VERSION}, got ${parsedData.version}`,
        );
        // Perform migration logic here if needed in the future
      }

      // Validate data structure
      if (!Array.isArray(parsedData.roles)) {
        throw new Error("Invalid roles data structure");
      }

      return parsedData.roles;
    } catch (error) {
      console.error("Failed to load custom roles:", error);

      // Return empty array on error but don't throw to prevent app crashes
      return [];
    }
  },

  async clear(): Promise<void> {
    try {
      // eslint-disable-next-line no-undef
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear custom roles:", error);
      throw new Error("Unable to clear custom roles storage");
    }
  },
};
