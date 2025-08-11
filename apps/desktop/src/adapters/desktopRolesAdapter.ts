import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import {
  RolesPersistenceAdapter,
  RolesPersistenceError,
} from "@fishbowl-ai/ui-shared";

export class DesktopRolesAdapter implements RolesPersistenceAdapter {
  async save(roles: PersistedRolesSettingsData): Promise<void> {
    try {
      await window.electronAPI.roles.save(roles);
    } catch (error) {
      if (error instanceof RolesPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to save roles";
      throw new RolesPersistenceError(message, "save", error);
    }
  }

  async load(): Promise<PersistedRolesSettingsData | null> {
    try {
      const data = await window.electronAPI.roles.load();
      return data;
    } catch (error) {
      // Check if this is a "no roles found" case and return null
      if (
        error instanceof Error &&
        error.message.includes("Failed to load roles")
      ) {
        return null;
      }
      if (error instanceof RolesPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to load roles";
      throw new RolesPersistenceError(message, "load", error);
    }
  }

  async reset(): Promise<void> {
    try {
      // Call reset but ignore the returned data since interface expects void
      await window.electronAPI.roles.reset();
    } catch (error) {
      if (error instanceof RolesPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to reset roles";
      throw new RolesPersistenceError(message, "reset", error);
    }
  }
}

export const desktopRolesAdapter = new DesktopRolesAdapter();
