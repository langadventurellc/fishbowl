import { QueryMetadata } from "./QueryMetadata";

/**
 * Result type for SELECT queries.
 * Generic type allows proper typing of returned rows.
 *
 * @template T The type of objects representing each row in the result set
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const result: QueryResult<User> = await db.query<User>(
 *   'SELECT id, name, email FROM users WHERE active = ?',
 *   [true]
 * );
 *
 * // result.rows is properly typed as User[]
 * result.rows.forEach(user => {
 *   console.log(user.name); // TypeScript knows this is a string
 * });
 * ```
 */
export interface QueryResult<T = unknown> {
  /**
   * Array of rows returned by the query.
   * Each row is of type T, allowing for proper type safety.
   * Empty array if no rows match the query conditions.
   */
  rows: T[];

  /**
   * Optional metadata about the query execution.
   * May not be available on all database implementations.
   */
  metadata?: QueryMetadata;
}
