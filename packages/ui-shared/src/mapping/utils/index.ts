// Generic mapping helpers
export * from "./defaults";

// Value transformation functions
export * from "./transformers";

// Nested object utilities
export * from "./objects";

// Error handling utilities
export * from "./errors";

// Import types for local use
import type { MappingResult } from "./errors/MappingResult";

// Re-export commonly used types
export type { MappingResult } from "./errors/MappingResult";
export type { MappingError } from "./errors/MappingError";
export type { TimeUnit } from "./transformers/TimeUnit";

// Define common mapper types
export type Mapper<T, U> = (input: T) => U;
export type SafeMapper<T, U> = (input: T) => MappingResult<U>;
