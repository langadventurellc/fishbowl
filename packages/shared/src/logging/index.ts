// Main factory functions
export { createLogger } from "./createLogger";
export { createLoggerSync } from "./createLoggerSync";
export type { CreateLoggerOptions } from "./CreateLoggerOptions";

// Re-export all types
export * from "./types";
export * from "./formatters";
export * from "./transports";
export * from "./utils";
export * from "./config";
export { StructuredLogger } from "./StructuredLogger";
