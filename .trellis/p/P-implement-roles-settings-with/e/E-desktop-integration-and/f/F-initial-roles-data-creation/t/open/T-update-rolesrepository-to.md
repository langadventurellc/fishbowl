---
id: T-update-rolesrepository-to
title: Update RolesRepository to create default roles on first run
status: open
priority: high
parent: F-initial-roles-data-creation
prerequisites:
  - T-update-createdefaultrolessetti
  - T-configure-typescript-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T04:18:21.474Z
updated: 2025-08-12T04:18:21.474Z
---

# Update RolesRepository for Default Roles Creation

## Context

Modify `RolesRepository.loadRoles()` to create and save default roles when roles.json doesn't exist, instead of returning null. This follows the same pattern used by SettingsRepository and provides immediate value to new users.

## Implementation Requirements

### Target File

Modify: `apps/desktop/src/data/repositories/RolesRepository.ts`

### Current Implementation (lines 44-69)

```typescript
async loadRoles(): Promise<PersistedRolesSettingsData | null> {
  try {
    // ... existing load logic
  } catch (error) {
    // Handle file not found by returning null (not an error condition)
    if (error instanceof FileStorageError && error.operation === "read") {
      this.logger.debug("Roles file not found, returning null");
      return null;
    }
    // ... error handling
  }
}
```

### Required Changes

**Update the file-not-found error handling:**

```typescript
catch (error) {
  // Handle file not found by creating defaults
  if (error instanceof FileStorageError && error.operation === "read") {
    this.logger.debug("Roles file not found, creating with defaults");

    // Import createDefaultRolesSettings
    const { createDefaultRolesSettings } = await import(
      "@fishbowl-ai/shared"
    );

    const defaultRoles = createDefaultRolesSettings();

    // Save defaults to file for future loads
    try {
      await this.saveRoles(defaultRoles);
      this.logger.debug("Default roles saved successfully", {
        roleCount: defaultRoles.roles?.length || 0,
      });
    } catch (saveError) {
      // Log but don't throw - return defaults even if save fails
      this.logger.warn("Failed to save default roles", saveError as Error);
    }

    return defaultRoles;
  }

  this.logger.error("Failed to load roles", error as Error);
  throw this.mapError(error, "load");
}
```

## Acceptance Criteria

- [ ] When roles.json doesn't exist, creates default roles instead of returning null
- [ ] Default roles are saved to roles.json for subsequent loads
- [ ] Uses `createDefaultRolesSettings()` from shared package
- [ ] Maintains same error handling for other error types
- [ ] Logs appropriate debug/warning messages
- [ ] Returns default roles even if saving fails (graceful degradation)
- [ ] No breaking changes to the method signature or public API

## Technical Considerations

### Error Handling Strategy

- **Save success**: Default roles saved and returned
- **Save failure**: Log warning but still return defaults (don't block user)
- **Other errors**: Continue existing error handling (throw mapped errors)

### Logging Strategy

- Debug log when roles file not found
- Debug log when defaults saved successfully
- Warning log if saving defaults fails
- Include role count in success logs for debugging

### Import Strategy

- Use dynamic import to avoid circular dependencies
- Import from "@fishbowl-ai/shared" package (already established pattern)
- Await the import to handle the Promise

## Testing Requirements

### Unit Tests

- Test that default roles are created when file doesn't exist
- Test that default roles are saved to file after creation
- Test graceful handling when save fails (still returns defaults)
- Test that other error types continue to throw (preserve existing behavior)
- Mock the file storage service and createDefaultRolesSettings function

### Integration Tests

- Test first-run scenario with empty userData directory
- Verify roles.json is created with correct content
- Test that subsequent loads read from the saved file
- Test with write permission issues (should still return defaults)

## Dependencies

- Depends on: T-update-createdefaultrolessetti (function must be updated first)
- Depends on: T-configure-typescript-and (JSON imports must work)
- Uses: `createDefaultRolesSettings` from shared package
- Uses: Existing `saveRoles` method for persistence
- Uses: Existing `FileStorageError` for error detection

## Backwards Compatibility

- Existing users with roles.json files are unaffected
- Method signature remains the same
- Return type remains the same (null is replaced with default data)
- Error handling for non-file-not-found errors unchanged
