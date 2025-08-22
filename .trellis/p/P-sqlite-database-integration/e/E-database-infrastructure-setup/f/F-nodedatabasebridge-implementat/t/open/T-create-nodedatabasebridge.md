---
id: T-create-nodedatabasebridge
title: Create NodeDatabaseBridge class with constructor and connection management
status: open
priority: high
parent: F-nodedatabasebridge-implementat
prerequisites:
  - T-install-better-sqlite3
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-22T23:12:13.075Z
updated: 2025-08-22T23:12:13.075Z
---

# Create NodeDatabaseBridge class with constructor and connection management

## Context

Create the main NodeDatabaseBridge class that implements the DatabaseBridge interface using better-sqlite3. This class will live in the desktop main process and handle SQLite database connections with proper lifecycle management.

## Implementation Requirements

- Create `apps/desktop/src/main/services/NodeDatabaseBridge.ts`
- Implement DatabaseBridge interface from `@fishbowl-ai/shared`
- Accept database path as constructor parameter for flexibility
- Configure SQLite with appropriate pragmas for desktop performance
- Include proper connection state tracking and cleanup

## Technical Approach

1. Create class file following existing bridge patterns (see NodeFileSystemBridge)
2. Import Database from 'better-sqlite3' and DatabaseBridge interface
3. Accept databasePath: string in constructor
4. Configure SQLite pragmas in private method: journal_mode=WAL, synchronous=NORMAL, foreign_keys=ON
5. Track connection state with private isConnected flag
6. Implement basic error handling and logging integration

## File Location

```
apps/desktop/src/main/services/NodeDatabaseBridge.ts
```

## Class Structure Template

```typescript
import Database from "better-sqlite3";
import { DatabaseBridge } from "@fishbowl-ai/shared";

export class NodeDatabaseBridge implements DatabaseBridge {
  private db: Database;
  private connected: boolean = false;

  constructor(databasePath: string) {
    // Initialize database connection
    // Configure pragmas
    // Set connected state
  }

  private configurePragmas(): void {
    // Set WAL mode, foreign keys, synchronous level
  }

  // Stub implementations for interface methods (to be implemented in separate tasks)
}
```

## Acceptance Criteria

- [ ] NodeDatabaseBridge class created in correct location
- [ ] Implements DatabaseBridge interface (stub methods only)
- [ ] Constructor accepts string database path parameter
- [ ] Database connection established in constructor using better-sqlite3
- [ ] SQLite pragmas configured appropriately for desktop use
- [ ] Connection state tracked with private boolean flag
- [ ] Basic error handling for database creation failures
- [ ] Follows existing codebase patterns and TypeScript conventions

## Testing Requirements

- [ ] Unit tests for constructor with valid database path
- [ ] Unit tests for constructor with invalid database path
- [ ] Unit tests for pragma configuration
- [ ] Test connection state tracking
- [ ] Mock better-sqlite3 Database for isolated testing
- [ ] Verify interface compliance (TypeScript compilation)

## Security Considerations

- Validate database path to prevent directory traversal attacks
- Use restricted file permissions for database file (600)
- Ensure database runs only in main process context
- Log database connection attempts for security monitoring

## Performance Requirements

- Database connection establishment completes in <100ms
- Pragma configuration overhead is minimal
- Memory footprint appropriate for single connection

## Dependencies

- T-install-better-sqlite3 (better-sqlite3 package available)
- DatabaseBridge interface from shared package
- Existing logger utility for error handling

## Implementation Notes

- Follow existing NodeFileSystemBridge pattern for consistency
- Use synchronous better-sqlite3 API wrapped in Promise.resolve() for interface compliance
- Include comprehensive JSDoc documentation for all public methods
