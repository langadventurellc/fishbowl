import type { ProviderId } from "./ProviderId";

/**
 * Creates a type-safe ProviderId from a string.
 *
 * @param id - The provider ID string
 * @returns A branded ProviderId
 *
 * @example
 * ```typescript
 * const providerId = createProviderId("openai");
 * ```
 */
export const createProviderId = (id: string): ProviderId => id as ProviderId;
