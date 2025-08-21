import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";
import {
  AgentsPersistenceAdapter,
  AgentsPersistenceError,
} from "@fishbowl-ai/ui-shared";

class DesktopAgentsAdapter implements AgentsPersistenceAdapter {
  async save(agents: PersistedAgentsSettingsData): Promise<void> {
    try {
      await window.electronAPI.agents.save(agents);
    } catch (error) {
      if (error instanceof AgentsPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to save agents";
      throw new AgentsPersistenceError(message, "save", error);
    }
  }

  async load(): Promise<PersistedAgentsSettingsData | null> {
    try {
      const data = await window.electronAPI.agents.load();
      return data;
    } catch (error) {
      // Check if this is a "no agents found" case and return null
      if (
        error instanceof Error &&
        error.message.includes("Failed to load agents")
      ) {
        return null;
      }
      if (error instanceof AgentsPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to load agents";
      throw new AgentsPersistenceError(message, "load", error);
    }
  }

  async reset(): Promise<void> {
    try {
      // Call reset but ignore the returned data since interface expects void
      await window.electronAPI.agents.reset();
    } catch (error) {
      if (error instanceof AgentsPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to reset agents";
      throw new AgentsPersistenceError(message, "reset", error);
    }
  }
}

export const desktopAgentsAdapter = new DesktopAgentsAdapter();
