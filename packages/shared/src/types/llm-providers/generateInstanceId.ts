import { createInstanceId } from "./createInstanceId";
import type { InstanceId } from "./InstanceId";

/**
 * Generates a unique instance ID for a new provider configuration.
 *
 * @returns A new unique InstanceId
 *
 * @example
 * ```typescript
 * const newId = generateInstanceId();
 * ```
 */
export const generateInstanceId = (): InstanceId => {
  return createInstanceId(
    `llm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
};
