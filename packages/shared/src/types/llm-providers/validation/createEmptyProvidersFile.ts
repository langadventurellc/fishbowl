/**
 * Creates an empty providers file with current schema version.
 *
 * @fileoverview Utility function for creating empty providers file
 * @module types/llm-providers/validation/createEmptyProvidersFile
 */

import { LLM_PROVIDERS_SCHEMA_VERSION } from "./file.schema";

/**
 * Creates an empty providers file with current schema version.
 * Used for initializing new configuration files.
 *
 * @returns Empty providers file structure
 *
 * @example
 * ```typescript
 * const emptyFile = createEmptyProvidersFile();
 * // { version: "1.0.0", providers: [] }
 * ```
 */
export function createEmptyProvidersFile() {
  return {
    version: LLM_PROVIDERS_SCHEMA_VERSION,
    providers: [],
  };
}
