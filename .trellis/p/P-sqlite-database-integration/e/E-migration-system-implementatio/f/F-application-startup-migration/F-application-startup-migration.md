---
id: F-application-startup-migration
title: Application Startup Migration Integration
status: done
priority: medium
parent: E-migration-system-implementatio
prerequisites:
  - F-migration-service-core
  - F-initial-database-schema
affectedFiles:
  packages/shared/src/services/index.ts: Added export for migrations module to make MigrationService available
  packages/shared/src/services/migrations/MigrationService.ts:
    Fixed import statements to use TypeScript module resolution without .js
    extensions for Jest compatibility
  apps/desktop/src/main/services/MainProcessServices.ts: Added MigrationService
    import, property, initialization in constructor, runDatabaseMigrations()
    method, and getMigrationsPath() helper method with proper error handling and
    logging
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added comprehensive unit tests for MigrationService integration including
    mocks, initialization tests, and all migration execution scenarios
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
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-migrationservice-to
  - T-integrate-migration-execution
created: 2025-08-23T16:29:41.428Z
updated: 2025-08-23T16:29:41.428Z
---

# Application Startup Migration Integration

## Purpose and Functionality

Integrate the migration system into the application startup flow, ensuring migrations run automatically when the desktop app launches. This feature connects the MigrationService to the MainProcessServices and electron main process initialization.

## Key Components to Implement

### 1. MainProcessServices Integration

- Add MigrationService property to MainProcessServices
- Initialize MigrationService with NodeDatabaseBridge
- Create runMigrations method for startup execution
- Handle migration errors gracefully

### 2. Electron Main Process Integration

- Call migration runner after database initialization
- Before window creation to ensure schema is ready
- Proper error handling with user notifications
- Prevent app startup on critical failures

### 3. Migration Path Configuration

- Resolve migrations directory path correctly
- Support both development and production paths
- Handle packaged app resource paths
- Validate migrations directory exists

## Detailed Acceptance Criteria

### MainProcessServices Enhancement

- [ ] MigrationService property added to MainProcessServices class
- [ ] MigrationService initialized in constructor with dependencies
- [ ] `runDatabaseMigrations()` method implemented
- [ ] Proper error handling and logging
- [ ] Unit tests for service initialization and method

### Electron Integration

- [ ] Migration execution added to app.whenReady() flow
- [ ] Runs after database init, before window creation
- [ ] Error dialog shown for migration failures
- [ ] App exits gracefully on critical errors
- [ ] Unit tests for startup flow integration

### Path Resolution

- [ ] Migrations path resolved from app root
- [ ] Works in development environment
- [ ] Works in packaged production app
- [ ] Falls back gracefully if directory missing
- [ ] Unit tests for path resolution logic

### Error Handling

- [ ] User-friendly error messages for migration failures
- [ ] Detailed logging for debugging
- [ ] Prevents app startup on critical failures
- [ ] Recovery instructions provided
- [ ] Unit tests for error scenarios

## Technical Requirements

### MainProcessServices Changes

```typescript
// In MainProcessServices
private migrationService: MigrationService;

constructor() {
  // ... existing initialization
  this.migrationService = new MigrationService(
    this.databaseBridge,
    this.getMigrationsPath()
  );
}

async runDatabaseMigrations(): Promise<void> {
  try {
    await this.migrationService.runMigrations();
    this.logger.info('Database migrations completed successfully');
  } catch (error) {
    this.logger.error('Migration failed', error);
    throw error;
  }
}

private getMigrationsPath(): string {
  // Resolve path based on environment
}
```

### Electron Main Integration

```typescript
// In main.ts
app.whenReady().then(async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Run migrations
    await services.runDatabaseMigrations();

    // Create window
    createWindow();
  } catch (error) {
    dialog.showErrorBox("Migration Error", "Failed to run database migrations");
    app.quit();
  }
});
```

## Implementation Guidance

### Startup Flow Order

1. Database connection established
2. Migration service initialized
3. Migrations executed in order
4. Application window created
5. IPC handlers registered

### Path Resolution Strategy

- Development: Use project root + '/migrations'
- Production: Use app.getAppPath() + '/migrations'
- Support electron-builder resource handling
- Validate directory exists before running

### Error Recovery

- Provide clear error messages
- Log full error details for debugging
- Suggest manual migration steps if needed
- Allow app to start in read-only mode (future)

## Testing Requirements

### Unit Test Coverage

- Mock MigrationService in MainProcessServices tests
- Test successful migration flow
- Test migration failure handling
- Test path resolution in different environments
- Verify startup sequence order
- Mock electron dialog for error display

### Integration Points

- Verify MigrationService receives correct dependencies
- Test database bridge is initialized before migrations
- Confirm migrations complete before window creation
- Validate error propagation through layers

## Security Considerations

- Migrations run in main process only
- No user input in migration execution
- Validate migration directory path
- Prevent arbitrary file execution

## Performance Requirements

- Migration check adds <100ms to startup
- First-run migrations complete in <2 seconds
- Subsequent starts with no pending migrations <50ms
- Non-blocking UI during migration execution
