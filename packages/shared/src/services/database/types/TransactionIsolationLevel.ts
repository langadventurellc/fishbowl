/**
 * Transaction isolation levels following SQL standard.
 * Controls how concurrent transactions interact with each other.
 */
export type TransactionIsolationLevel =
  | "READ_UNCOMMITTED"
  | "READ_COMMITTED"
  | "REPEATABLE_READ"
  | "SERIALIZABLE";
