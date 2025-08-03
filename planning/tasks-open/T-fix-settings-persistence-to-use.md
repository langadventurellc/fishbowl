---
kind: task
id: T-fix-settings-persistence-to-use
title:
  Fix settings persistence to use Electron userData directory instead of working
  directory
status: open
priority: normal
prerequisites: []
created: "2025-08-03T00:35:34.731787"
updated: "2025-08-03T00:35:34.731787"
schema_version: "1.1"
---

## Problem

Currently, the desktop application saves user preferences to `preferences.json` in the application's working directory (`/apps/desktop/preferences.json`). This is incorrect behavior for an Electron application - preferences should be saved in the user's application data directory using `app.getPath("userData")`.

This causes issues with:

- File permissions in production builds
- Settings not persisting correctly across app updates
- Potential conflicts with source code directory
- Non-standard application behavior

## Implementation Requirements

### 1. Modify Settings Repository Initialization

**File**: `/apps/desktop/src/electron/getSettingsRepository.ts`

Update the `getSettingsRepository()` function to:

- Import `app` from `electron`
- Get the userData directory using `app.getPath("userData")`
- Pass this path to the `FileStorageService` constructor

```typescript
import { app } from "electron";

export function getSettingsRepository(): SettingsRepository {
  const userDataPath = app.getPath("userData");
  const fileStorageService = new FileStorageService(userDataPath);
  return new SettingsRepository(fileStorageService);
}
```

### 2. Verify FileStorageService Constructor

**File**: `/packages/shared/src/services/storage/FileStorageService.ts`

Ensure the `FileStorageService` constructor properly accepts and uses a base directory path parameter. If it doesn't currently support this, modify it to:

- Accept an optional `baseDirectory` parameter in the constructor
- Use this base directory for all file operations
- Default to current working directory if no base directory provided

### 3. Update Any Related Configuration

Check and update any other files that might reference the settings file path:

- Verify the `SettingsRepository` in `/packages/shared/src/repositories/settings/SettingsRepository.ts` works with custom base paths
- Check if any other Electron main process code references the settings file directly

## Testing Requirements

### Unit Tests

- Add unit tests for `getSettingsRepository()` to verify it uses the userData directory
- Test that `FileStorageService` respects the base directory parameter
- Verify that settings save and load correctly with the new path

### Manual Testing

- Test that preferences persist across app restarts
- Verify settings are saved to the correct userData location
- Test on both development and production builds

## Acceptance Criteria

✅ **Correct File Location**: Settings are saved to `{userData}/preferences.json` instead of `{workingDir}/preferences.json`

✅ **Path Resolution**: The `getSettingsRepository()` function uses `app.getPath("userData")` to determine the base directory

✅ **Backward Compatibility**: Existing settings are preserved (consider migration if needed)

✅ **Cross-Platform**: Works correctly on macOS, Windows, and Linux

✅ **Production Ready**: Works in both development and production builds

✅ **Unit Tests**: All changes are covered by unit tests with >90% coverage

## Security Considerations

- Ensure the userData directory has appropriate file permissions
- Validate that the preferences file is created with secure permissions (readable only by the user)
- Consider file locking to prevent corruption during concurrent access

## Dependencies

None - this is a standalone bug fix.

## Important Notes

⚠️ **CRITICAL**: This change will break the existing E2E tests because they currently expect `preferences.json` to be in the desktop working directory. After implementing this fix, the E2E tests in `/tests/desktop/features/general-settings.spec.ts` must be updated to look for the settings file in the correct userData directory location.

The test currently uses:

```typescript
const projectRoot = path.resolve(__dirname, "../../..");
actualSettingsPath = path.join(projectRoot, "apps/desktop/preferences.json");
```

This will need to be changed to use the Electron app's userData directory path instead.

## Technical Approach

1. **Research Current Implementation**: Examine how `FileStorageService` and `SettingsRepository` currently work
2. **Modify Repository Factory**: Update `getSettingsRepository.ts` to use userData directory
3. **Test FileStorageService**: Ensure it accepts base directory parameter
4. **Add Unit Tests**: Test the new behavior thoroughly
5. **Manual Verification**: Test settings persistence with new location
6. **Document Breaking Change**: Note that E2E tests need updating

## Files to Modify

- `/apps/desktop/src/electron/getSettingsRepository.ts` (primary change)
- `/packages/shared/src/services/storage/FileStorageService.ts` (if constructor needs updating)
- Add/update unit tests for the modified components

## Estimated Time

1-2 hours for implementation and testing.

### Log
