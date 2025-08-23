---
id: T-add-migrationservice-to
title: Add MigrationService to MainProcessServices
status: open
priority: high
parent: F-application-startup-migration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T16:34:25.567Z
updated: 2025-08-23T16:34:25.567Z
---

# Add MigrationService to MainProcessServices

## Context

This task integrates the MigrationService into the MainProcessServices class, providing a centralized way to run migrations during application startup. This follows the established service injection pattern used throughout the application.

**Related Feature**: F-application-startup-migration - Application Startup Migration Integration
**Dependencies**: Requires MigrationService from F-migration-service-core
**Pattern Reference**: Follow patterns from existing services in `apps/desktop/src/main/services/MainProcessServices.ts`

## Specific Implementation Requirements

### 1. Add MigrationService Property

- Add private migrationService property to MainProcessServices
- Initialize in constructor with NodeDatabaseBridge and migrations path
- Follow existing service initialization patterns
- Add proper TypeScript types and imports

### 2. Implement runDatabaseMigrations Method

- Public async method for migration execution
- Proper error handling and logging
- Clear success/failure reporting
- Follow existing method patterns in the class

### 3. Path Resolution Logic

- Implement getMigrationsPath() helper method
- Support both development and production environments
- Handle packaged app scenarios (electron-builder)
- Validate path exists before passing to MigrationService

## Technical Approach

### MainProcessServices Integration

```typescript
// Add to imports
import { MigrationService } from '@fishbowl-ai/shared';

// Add property
private migrationService: MigrationService;

// In constructor
constructor() {
  // ... existing initialization
  this.migrationService = new MigrationService(
    this.databaseBridge,
    this.getMigrationsPath()
  );
}

// Public method
async runDatabaseMigrations(): Promise<void> {
  try {
    await this.migrationService.runMigrations();
    this.logger.info('Database migrations completed successfully');
  } catch (error) {
    this.logger.error('Migration failed', error);
    throw error;
  }
}

// Helper method
private getMigrationsPath(): string {
  // Path resolution logic
}
```

### Path Resolution Strategy

- Development: Use project root + 'migrations'
- Production: Use app.getAppPath() + 'migrations'
- Validate directory exists
- Log resolved path for debugging

## Detailed Acceptance Criteria

### Service Integration

- [ ] MigrationService property added to MainProcessServices class
- [ ] Proper import from @fishbowl-ai/shared package
- [ ] Service initialized in constructor with correct dependencies
- [ ] Service initialization follows existing patterns in the class

### Migration Execution Method

- [ ] runDatabaseMigrations() method implemented as public async
- [ ] Method calls migrationService.runMigrations()
- [ ] Success logged with appropriate level and message
- [ ] Failures logged with error details and re-thrown
- [ ] Method follows existing error handling patterns

### Path Resolution

- [ ] getMigrationsPath() private method implemented
- [ ] Correctly resolves path in development environment
- [ ] Correctly resolves path in packaged production app
- [ ] Validates directory exists before returning path
- [ ] Logs resolved path for debugging

### Error Handling

- [ ] Migration failures properly logged with context
- [ ] Errors re-thrown to caller for handling
- [ ] Error messages provide clear context
- [ ] Follows existing error handling patterns in class

### Unit Tests

- [ ] Mock MigrationService constructor and methods
- [ ] Test successful migration execution flow
- [ ] Test migration failure handling and error propagation
- [ ] Test path resolution in different environments
- [ ] Test service initialization in constructor
- [ ] Verify logger calls for success and failure cases

## Dependencies

- F-migration-service-core (provides MigrationService class)

## Security Considerations

- Migration service runs in main process only
- No user input in migration execution
- Path resolution validates directory existence
- Error messages don't expose sensitive paths

## Performance Requirements

- Service initialization adds <10ms to startup
- Path resolution completes in <5ms
- Method call overhead minimal (<1ms)

## Files to Modify

- `apps/desktop/src/main/services/MainProcessServices.ts`
- `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts`

## Integration Notes

- Service will be called during electron app startup
- Must complete before window creation
- Errors will prevent application from starting
- Success enables normal application functionality
