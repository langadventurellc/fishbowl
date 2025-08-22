---
id: T-implement-query-method-with
title: Implement query method with type-safe SELECT operations
status: open
priority: high
parent: F-nodedatabasebridge-implementat
prerequisites:
  - T-create-nodedatabasebridge
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-22T23:12:32.994Z
updated: 2025-08-22T23:12:32.994Z
---

# Implement query method with type-safe SELECT operations

## Context

Implement the query<T> method of NodeDatabaseBridge that executes SELECT statements using better-sqlite3 and returns typed results. This method must handle prepared statements, parameter binding, and proper error conversion.

## Implementation Requirements

- Implement `query<T>(sql: string, params?: unknown[]): Promise<T[]>`
- Use better-sqlite3's prepared statement API for performance and security
- Handle parameter binding safely to prevent SQL injection
- Convert SQLite errors to appropriate DatabaseError types
- Return properly typed results that match the interface contract

## Technical Approach

1. Create prepared statement from SQL using db.prepare()
2. Handle optional parameter binding with proper type checking
3. Execute query using statement.all() for SELECT operations
4. Convert synchronous result to Promise for interface compliance
5. Map SQLite-specific errors to shared DatabaseError types
6. Include comprehensive logging for debugging

## Method Implementation Template

```typescript
async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  try {
    // Validate connection state
    // Create prepared statement
    // Execute with parameter binding
    // Return typed results
  } catch (error) {
    // Convert SQLite errors to DatabaseError types
    // Log error context (SQL, params, error details)
    // Rethrow as appropriate DatabaseError
  }
}
```

## Error Handling Requirements

- Map sqlite3 error codes to DatabaseError types from shared package
- Include original SQL and parameters in error context
- Handle connection state errors appropriately
- Log all query errors with sufficient context for debugging

## Acceptance Criteria

- [ ] query<T> method implemented following interface signature
- [ ] Uses better-sqlite3 prepared statements for security
- [ ] Handles optional parameter binding correctly
- [ ] Returns Promise<T[]> with proper generic typing
- [ ] Converts SQLite errors to DatabaseError types from shared package
- [ ] Validates connection state before executing queries
- [ ] Logs query execution details for debugging
- [ ] Follows existing error handling patterns in codebase

## Testing Requirements

- [ ] Unit tests for successful SELECT queries with typed results
- [ ] Unit tests for parameterized queries with various data types
- [ ] Unit tests for invalid SQL syntax error handling
- [ ] Unit tests for connection state validation
- [ ] Unit tests for parameter binding edge cases (null, undefined, arrays)
- [ ] Mock better-sqlite3 Database for isolated testing
- [ ] Test generic type inference with different result types

## Security Considerations

- Use only prepared statements, never string concatenation
- Validate parameter types before binding
- Sanitize error messages to avoid information disclosure
- Ensure no SQL injection vulnerabilities through parameter handling

## Performance Requirements

- Query execution completes in <50ms for simple SELECT statements
- Prepared statement creation and caching is efficient
- Memory usage scales appropriately with result set size
- Logging overhead is minimal in production

## Dependencies

- T-create-nodedatabasebridge (NodeDatabaseBridge class exists)
- DatabaseError types from shared package
- better-sqlite3 Database and Statement APIs
- Existing logger utility for error reporting

## Implementation Notes

- Use statement.all() for SELECT operations (returns all rows)
- Handle empty result sets appropriately (return empty array)
- Consider prepared statement caching for frequently used queries
- Follow existing async/await patterns in codebase
- Include JSDoc with usage examples
