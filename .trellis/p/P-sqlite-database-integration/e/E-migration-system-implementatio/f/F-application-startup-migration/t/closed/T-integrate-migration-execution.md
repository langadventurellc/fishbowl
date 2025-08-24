---
id: T-integrate-migration-execution
title: Integrate migration execution into Electron main process startup
status: done
priority: high
parent: F-application-startup-migration
prerequisites:
  - T-add-migrationservice-to
affectedFiles:
  apps/desktop/src/electron/main.ts:
    Added migration execution to app.whenReady()
    flow after database initialization, with proper error handling,
    user-friendly error dialog, and graceful app exit on failures. Maintains
    existing startup sequence and performance characteristics.
  apps/desktop/src/electron/__tests__/main.test.ts: Created comprehensive unit
    test suite covering migration integration scenarios including successful
    startup flow, migration failures, error dialog display, app exit behavior,
    and startup sequence validation. All 6 tests pass successfully.
log:
  - Successfully integrated database migration execution into the Electron main
    process startup flow. The implementation adds migration execution after
    database initialization but before window creation, ensuring proper startup
    sequence. Includes comprehensive error handling with user-friendly dialogs
    and graceful app exit on migration failures. All unit tests pass with
    complete coverage of success and failure scenarios.
schema: v1.0
childrenIds: []
created: 2025-08-23T16:34:49.196Z
updated: 2025-08-23T16:34:49.196Z
---

# Integrate migration execution into Electron main process startup

## Context

This task integrates migration execution into the Electron main process startup flow, ensuring migrations run automatically after database initialization but before window creation. This establishes the proper startup sequence for database schema management.

**Related Feature**: F-application-startup-migration - Application Startup Migration Integration
**Dependencies**: T-add-migrationservice-to (provides runDatabaseMigrations method)
**Pattern Reference**: Follow existing patterns in `apps/desktop/src/electron/main.ts` for startup sequence and error handling

## Specific Implementation Requirements

### 1. Modify Electron Startup Sequence

- Add migration execution to app.whenReady() flow
- Run migrations after database initialization
- Run migrations before window creation
- Maintain proper async/await flow

### 2. Error Handling Integration

- Show user-friendly error dialog for migration failures
- Log detailed error information for debugging
- Gracefully exit application on critical migration errors
- Prevent window creation if migrations fail

### 3. Startup Flow Optimization

- Ensure proper startup order (database → migrations → window)
- Handle both first-run and subsequent startup scenarios
- Maintain existing performance characteristics
- Preserve existing error handling patterns

## Technical Approach

### Electron Main Integration

```typescript
// In main.ts app.whenReady() handler
app.whenReady().then(async () => {
  try {
    // Existing database initialization
    await initializeDatabase();

    // NEW: Run database migrations
    await services.runDatabaseMigrations();

    // Existing window creation
    createWindow();

    // Existing IPC handler registration
    registerIpcHandlers();
  } catch (error) {
    // Enhanced error handling for migrations
    if (error instanceof MigrationError) {
      dialog.showErrorBox(
        "Database Migration Failed",
        "The application could not update its database schema. Please contact support.",
      );
    } else {
      // Existing error handling
      handleStartupError(error);
    }
    app.quit();
  }
});
```

### Error Dialog Enhancement

- Migration-specific error messages
- Clear user guidance for resolution
- Technical details logged separately
- Graceful application exit

## Detailed Acceptance Criteria

### Startup Sequence Integration

- [ ] Migration execution added to app.whenReady() flow
- [ ] Runs after initializeDatabase() call
- [ ] Runs before createWindow() call
- [ ] Maintains proper async/await chain
- [ ] Preserves existing startup performance

### Migration Execution

- [ ] Calls services.runDatabaseMigrations() correctly
- [ ] Awaits migration completion before proceeding
- [ ] Handles successful migration execution
- [ ] Integration maintains existing startup flow for other components

### Error Handling

- [ ] Migration failures trigger error dialog display
- [ ] Error dialog shows user-friendly message
- [ ] Technical error details logged for debugging
- [ ] Application exits gracefully on migration failure
- [ ] Existing error handling preserved for other startup failures

### User Experience

- [ ] First-run migrations complete transparently
- [ ] Subsequent startups with no pending migrations are fast
- [ ] Migration failures provide clear error messages
- [ ] No window creation if migrations fail
- [ ] Proper application shutdown on critical errors

### Unit Tests

- [ ] Mock services.runDatabaseMigrations() for testing
- [ ] Test successful startup flow with migrations
- [ ] Test migration failure handling and error dialog
- [ ] Test startup sequence order (database → migrations → window)
- [ ] Mock dialog.showErrorBox for error scenarios
- [ ] Verify app.quit() called on migration failures

## Dependencies

- T-add-migrationservice-to (provides runDatabaseMigrations method in services)

## Security Considerations

- Migrations run before any user interaction
- No user input affects migration execution
- Error messages don't expose sensitive system details
- Application exits safely on migration failures

## Performance Requirements

- Migration execution adds <100ms to normal startup
- First-run migrations complete in <2 seconds
- No impact on subsequent startup performance
- Existing startup timing characteristics preserved

## Files to Modify

- `apps/desktop/src/electron/main.ts`
- `apps/desktop/src/electron/__tests__/main.test.ts` (if exists) or create test file

## Integration Notes

- Critical path for application startup
- Prevents application from running with outdated schema
- Establishes database readiness before UI creation
- Enables reliable conversation storage functionality
- Supports future migration additions seamlessly
