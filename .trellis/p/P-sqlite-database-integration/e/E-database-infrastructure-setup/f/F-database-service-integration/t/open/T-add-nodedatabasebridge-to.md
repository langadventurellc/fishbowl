---
id: T-add-nodedatabasebridge-to
title: Add NodeDatabaseBridge to MainProcessServices with dependency injection
status: open
priority: high
parent: F-database-service-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T01:02:08.627Z
updated: 2025-08-23T01:02:08.627Z
---

# Add NodeDatabaseBridge to MainProcessServices with dependency injection

## Context

The NodeDatabaseBridge implementation is complete and needs to be integrated into the MainProcessServices class following the existing dependency injection pattern used by other services like FileSystemBridge and CryptoUtils.

## Implementation Requirements

### Service Registration

- Add `databaseBridge: NodeDatabaseBridge` as a readonly property to MainProcessServices
- Instantiate NodeDatabaseBridge in the constructor following the existing pattern
- Create database path using Electron's `app.getPath("userData")` and path utilities
- Add proper error handling and logging during instantiation

### Database Path Configuration

- Use `app.getPath("userData")` to get the user data directory
- Combine with "fishbowl.db" filename using Node.js `path.join()`
- Ensure database file path is properly configured for cross-platform compatibility
- Add logging of the database path for debugging

### Unit Tests

- Add unit tests to MainProcessServices test suite verifying database service initialization
- Test error scenarios during NodeDatabaseBridge construction
- Verify proper service registration and accessibility
- Mock NodeDatabaseBridge constructor for isolated testing

## Technical Approach

### Constructor Pattern

Follow the existing pattern used by other services:

```typescript
// In MainProcessServices constructor
this.databaseBridge = new NodeDatabaseBridge(this.getDatabasePath());
```

### Path Helper Method

Add private method following existing patterns:

```typescript
private getDatabasePath(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "fishbowl.db");
}
```

### Import Requirements

- Import NodeDatabaseBridge from `../NodeDatabaseBridge`
- Import path utilities from Node.js
- Import Electron app module for userData path

## Acceptance Criteria

- [ ] NodeDatabaseBridge property added to MainProcessServices class
- [ ] Database service instantiated in constructor with proper path
- [ ] Database path uses userData directory with "fishbowl.db" filename
- [ ] Constructor includes error handling for database initialization failures
- [ ] Unit tests verify service registration and error scenarios
- [ ] All existing MainProcessServices tests continue to pass
- [ ] Type checking passes without errors

## Files to Modify

- `apps/desktop/src/main/services/MainProcessServices.ts` - Add database service
- `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts` - Add tests

## Dependencies

- NodeDatabaseBridge implementation is complete (prerequisite satisfied)
- Electron app module for userData path
- Node.js path module for cross-platform paths

## Testing Requirements

- Unit tests for service initialization success case
- Unit tests for constructor error handling
- Integration with existing test suite
- Mock database bridge for isolated service testing
