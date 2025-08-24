// Error code enum
export { DatabaseErrorCode } from "./DatabaseErrorCode";

// Base error class
export { DatabaseError } from "./DatabaseError";

// Specific error classes
export { ConnectionError } from "./ConnectionError";
export { QueryError } from "./QueryError";
export { TransactionError } from "./TransactionError";
export { PermissionError } from "./PermissionError";
export { ConstraintViolationError } from "./ConstraintViolationError";

// Database result types
export type { DatabaseResult } from "./DatabaseResult";
export type { QueryMetadata } from "./QueryMetadata";
export type { QueryResult } from "./QueryResult";
export type { ExecutionResult } from "./ExecutionResult";

// Configuration option types
export type { QueryOptions } from "./QueryOptions";
export type { TransactionOptions } from "./TransactionOptions";
export type { ConnectionOptions } from "./ConnectionOptions";
export type { TransactionIsolationLevel } from "./TransactionIsolationLevel";
