import type {
  PersonalityDefinitions,
  PersonalityTraitDef,
  DiscreteValue,
} from "@fishbowl-ai/shared";

/**
 * Renderer process personality definitions client.
 *
 * Provides a thin proxy service that calls the main process IPC handler
 * and caches the results in memory for the session. This provides a clean
 * interface for UI components to access personality definitions.
 */
export class PersonalityDefinitionsClient {
  private cachedDefinitions: PersonalityDefinitions | null = null;
  private isLoading = false;
  private loadPromise: Promise<PersonalityDefinitions> | null = null;

  /**
   * Get personality definitions, loading from main process if not cached.
   * Uses session-level memory caching to avoid redundant IPC calls.
   *
   * @returns Promise resolving to personality definitions
   * @throws Error if IPC communication fails or definitions are invalid
   */
  async getDefinitions(): Promise<PersonalityDefinitions> {
    // Return cached version if available
    if (this.cachedDefinitions) {
      return this.cachedDefinitions;
    }

    // Return existing promise if already loading
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading process
    this.isLoading = true;
    this.loadPromise = this.loadDefinitions();

    try {
      const definitions = await this.loadPromise;
      this.cachedDefinitions = definitions;
      return definitions;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Get short description for a specific trait value.
   * Convenience method for looking up trait value metadata.
   *
   * @param traitId - ID of the trait
   * @param value - Discrete value (0, 20, 40, 60, 80, 100)
   * @returns Short description or undefined if not found
   */
  async getShort(
    traitId: string,
    value: DiscreteValue,
  ): Promise<string | undefined> {
    const definitions = await this.getDefinitions();

    for (const section of definitions.sections) {
      const trait = section.values.find(
        (t: PersonalityTraitDef) => t.id === traitId,
      );
      if (trait) {
        return trait.values[String(value) as keyof typeof trait.values]?.short;
      }
    }

    return undefined;
  }

  /**
   * Get prompt text for a specific trait value.
   * Convenience method for looking up trait value prompt text.
   *
   * @param traitId - ID of the trait
   * @param value - Discrete value (0, 20, 40, 60, 80, 100)
   * @returns Prompt text or undefined if not found
   */
  async getPrompt(
    traitId: string,
    value: DiscreteValue,
  ): Promise<string | undefined> {
    const definitions = await this.getDefinitions();

    for (const section of definitions.sections) {
      const trait = section.values.find(
        (t: PersonalityTraitDef) => t.id === traitId,
      );
      if (trait) {
        return trait.values[String(value) as keyof typeof trait.values]?.prompt;
      }
    }

    return undefined;
  }

  /**
   * Get all sections from personality definitions.
   * Convenience method after definitions are loaded.
   *
   * @returns Promise resolving to sections array
   */
  async getSections() {
    const definitions = await this.getDefinitions();
    return definitions.sections;
  }

  /**
   * Find a trait by ID across all sections.
   * Convenience method for trait lookup.
   *
   * @param traitId - ID of the trait to find
   * @returns Promise resolving to trait definition or undefined
   */
  async findTrait(traitId: string): Promise<PersonalityTraitDef | undefined> {
    const definitions = await this.getDefinitions();

    for (const section of definitions.sections) {
      const trait = section.values.find(
        (t: PersonalityTraitDef) => t.id === traitId,
      );
      if (trait) {
        return trait;
      }
    }

    return undefined;
  }

  /**
   * Invalidate cache and force reload on next request.
   * Useful for development/testing scenarios.
   */
  invalidateCache(): void {
    this.cachedDefinitions = null;
    this.isLoading = false;
    this.loadPromise = null;
  }

  /**
   * Load definitions from main process via IPC.
   * Private method that handles the actual IPC communication.
   *
   * @returns Promise resolving to personality definitions
   * @throws Error if IPC communication fails
   */
  private async loadDefinitions(): Promise<PersonalityDefinitions> {
    try {
      if (!window.electronAPI?.personalityDefinitions) {
        throw new Error(
          "Electron API not available - running outside renderer process",
        );
      }

      const definitions =
        await window.electronAPI.personalityDefinitions.getDefinitions();

      // Basic validation of loaded definitions
      if (
        !definitions ||
        !definitions.sections ||
        !Array.isArray(definitions.sections)
      ) {
        throw new Error(
          "Invalid personality definitions structure received from main process",
        );
      }

      return definitions;
    } catch (error) {
      // Re-throw with context for better debugging
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load personality definitions: ${message}`);
    }
  }
}
