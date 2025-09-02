import { DiscreteValue } from "../utils/discreteValues";
import { PersonalityDefinitions } from "../types/personality/PersonalityDefinitions";
import { PersonalitySectionDef } from "../types/personality/PersonalitySectionDef";

/**
 * Service interface for loading and accessing personality definitions.
 * Platform-specific implementations handle file system operations and caching.
 *
 * This interface follows the Platform Abstraction Pattern - no file system
 * operations are included in the shared package.
 */
export interface PersonalityDefinitionsService {
  /**
   * Load personality definitions from the configured source.
   * Results are typically cached in memory for subsequent calls.
   *
   * @returns Promise resolving to complete personality definitions
   * @throws PersonalityError and subclasses for various failure modes
   */
  loadDefinitions(): Promise<PersonalityDefinitions>;

  /**
   * Get all personality sections after definitions have been loaded.
   * Returns cached results if available, otherwise loads definitions first.
   *
   * @returns Promise resolving to array of personality sections
   * @throws PersonalityError if definitions cannot be loaded
   */
  getSections(): Promise<PersonalitySectionDef[]>;

  /**
   * Get the short description for a specific trait value.
   * Useful for displaying current slider values in the UI.
   *
   * @param traitId - The trait identifier (e.g., "openness", "formality")
   * @param value - The discrete value (0, 20, 40, 60, 80, 100)
   * @returns Promise resolving to short description or undefined if not found
   * @throws PersonalityError if definitions cannot be loaded
   */
  getShortDescription(
    traitId: string,
    value: DiscreteValue,
  ): Promise<string | undefined>;

  /**
   * Get the prompt text for a specific trait value.
   * Used for configuring AI behavior based on personality settings.
   *
   * @param traitId - The trait identifier (e.g., "openness", "formality")
   * @param value - The discrete value (0, 20, 40, 60, 80, 100)
   * @returns Promise resolving to prompt text or undefined if not found
   * @throws PersonalityError if definitions cannot be loaded
   */
  getPromptText(
    traitId: string,
    value: DiscreteValue,
  ): Promise<string | undefined>;

  /**
   * Clear any cached definitions and force reload on next access.
   * Useful for development or when definitions are updated at runtime.
   */
  clearCache(): void;

  /**
   * Check if definitions are currently loaded and cached.
   * @returns true if definitions are cached, false if they need to be loaded
   */
  isLoaded(): boolean;
}
