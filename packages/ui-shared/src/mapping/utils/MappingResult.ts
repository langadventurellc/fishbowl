import { MappingError } from "./MappingError";

/**
 * Result type for mapping operations
 */
export type MappingResult<T> =
  | { success: true; data: T }
  | { success: false; error: MappingError };
