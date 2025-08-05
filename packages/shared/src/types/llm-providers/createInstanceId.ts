import type { InstanceId } from "./InstanceId";

/**
 * Creates a type-safe InstanceId from a string.
 *
 * @param id - The instance ID string
 * @returns A branded InstanceId
 *
 * @example
 * ```typescript
 * const instanceId = createInstanceId("llm-123456");
 * ```
 */
export const createInstanceId = (id: string): InstanceId => id as InstanceId;
