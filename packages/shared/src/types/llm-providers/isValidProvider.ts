import type { LlmProviderDefinition } from "./LlmProviderDefinition";

/**
 * Type guard to check if an unknown value is a valid LlmProviderDefinition.
 *
 * @param provider - The value to check
 * @returns True if the value is a valid LlmProviderDefinition
 *
 * @example
 * ```typescript
 * if (isValidProvider(data)) {
 *   // data is now typed as LlmProviderDefinition
 *   console.log(data.name);
 * }
 * ```
 */
export const isValidProvider = (
  provider: unknown,
): provider is LlmProviderDefinition => {
  return (
    typeof provider === "object" &&
    provider !== null &&
    "id" in provider &&
    "name" in provider &&
    "models" in provider &&
    "configuration" in provider
  );
};
