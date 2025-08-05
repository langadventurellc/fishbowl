/**
 * Branded type for type-safe provider IDs.
 *
 * Prevents accidentally mixing provider IDs with other string types.
 *
 * @example
 * ```typescript
 * const id: ProviderId = createProviderId("openai");
 * ```
 */
export type ProviderId = string & { __brand: "ProviderId" };
