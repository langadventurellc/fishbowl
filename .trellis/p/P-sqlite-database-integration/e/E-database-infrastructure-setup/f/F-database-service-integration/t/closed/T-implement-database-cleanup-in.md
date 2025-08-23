---
id: T-implement-database-cleanup-in
title: Implement database cleanup in app shutdown lifecycle
status: done
priority: medium
parent: F-database-service-integration
prerequisites:
  - T-integrate-database-initializat
affectedFiles:
  apps/desktop/src/electron/main.ts: Enhanced database cleanup in before-quit
    event handler with Promise.race() timeout mechanism, added comprehensive
    timeout vs general error logging, implemented 2-second shutdown limit as
    required by performance specifications
log:
  - Successfully implemented database cleanup with timeout handling in app
    shutdown lifecycle. Added Promise.race() with 2-second timeout to ensure
    graceful shutdown completes within performance requirements. Enhanced error
    logging with appropriate distinction between timeout and other database
    errors. The implementation prevents hanging during shutdown while
    maintaining proper resource cleanup. All quality checks pass and the
    solution follows existing codebase patterns.
schema: v1.0
childrenIds: []
created: 2025-08-23T01:02:53.234Z
updated: 2025-08-23T01:02:53.234Z
---

# Implement database cleanup in app shutdown lifecycle

## Context

The application lifecycle includes proper cleanup hooks (`before-quit` event), and the database service needs graceful shutdown to ensure data integrity and proper resource cleanup. The NodeDatabaseBridge.close() method is already implemented and needs to be integrated into the shutdown sequence.

## Implementation Requirements

### Shutdown Integration

- Add database cleanup to existing `app.on('before-quit')` event handler in `main.ts`
- Ensure database close() is called before application exit
- Handle both graceful and forced shutdown scenarios
- Add appropriate logging for shutdown sequence

### Error Handling During Shutdown

- Catch and log errors during database close operation
- Prevent shutdown errors from blocking application exit
- Add timeout handling for long-running shutdown operations
- Ensure cleanup completes within reasonable time (2 seconds per requirement)

### Resource Cleanup

- Verify all database connections are properly closed
- Ensure pending transactions are handled appropriately
- Clean up any database-related resources
- Log cleanup completion for debugging

### Shutdown Timing

- Integrate database cleanup with existing cleanup operations
- Ensure proper order of shutdown operations
- Add performance monitoring for shutdown duration
- Handle concurrent shutdown requests appropriately

## Technical Approach

### Integration with Existing Cleanup

Extend the existing `before-quit` handler:

```typescript
app.on("before-quit", async () => {
  // Existing cleanup (global shortcuts, etc.)
  globalShortcut.unregisterAll();

  // Add database cleanup
  try {
    if (mainProcessServices?.databaseBridge) {
      await mainProcessServices.databaseBridge.close();
      logger.info("Database closed successfully during shutdown");
    }
  } catch (error) {
    logger.error("Error closing database during shutdown", error);
    // Don't prevent shutdown on database close errors
  }

  mainWindow = null;
});
```

### Shutdown Timeout Handling

- Add timeout mechanism to prevent hanging on database close
- Use Promise.race() with timeout for cleanup operations
- Ensure application exits even if database close fails

### Error Isolation

- Isolate database cleanup errors from other shutdown operations
- Log errors but don't prevent application exit
- Handle both sync and async cleanup operations

## Acceptance Criteria

- [ ] Database close() called in app 'before-quit' event handler
- [ ] Shutdown completes within 2 seconds per performance requirement
- [ ] Error handling prevents database issues from blocking app exit
- [ ] Comprehensive logging of shutdown operations and errors
- [ ] Graceful handling of both normal and forced shutdown scenarios
- [ ] Integration with existing cleanup operations (global shortcuts, window cleanup)
- [ ] Pending transactions handled appropriately during shutdown
- [ ] Resource cleanup verified through logging

## Files to Modify

- `apps/desktop/src/electron/main.ts` - Add database cleanup to shutdown handler

## Dependencies

- T-integrate-database-initializat (Database initialization in startup)
- NodeDatabaseBridge.close() method (already implemented)
- Existing shutdown lifecycle hooks

## Testing Requirements

- Manual testing of graceful application shutdown
- Testing of forced shutdown scenarios
- Verification that database files are properly closed
- Performance testing of shutdown timing (< 2 seconds)
- Error scenario testing (database already closed, connection issues)

## Performance Requirements

- Database cleanup completes within 2 seconds per feature specification
- No hanging or blocking during shutdown sequence
- Efficient resource cleanup with minimal overhead

## Error Scenarios to Handle

- Database connection already closed
- Database close() operation fails
- Timeout during cleanup operation
- Multiple shutdown requests
- Forced application termination
