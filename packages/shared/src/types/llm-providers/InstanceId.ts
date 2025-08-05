/**
 * Branded type for type-safe instance IDs.
 *
 * Prevents accidentally mixing instance IDs with other string types.
 *
 * @example
 * ```typescript
 * const id: InstanceId = createInstanceId("llm-123456");
 * ```
 */
export type InstanceId = string & { __brand: "InstanceId" };
