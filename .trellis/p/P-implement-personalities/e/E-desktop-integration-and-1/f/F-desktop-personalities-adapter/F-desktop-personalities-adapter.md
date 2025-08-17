---
id: F-desktop-personalities-adapter
title: Desktop Personalities Adapter Implementation
status: in-progress
priority: medium
parent: E-desktop-integration-and-1
prerequisites: []
affectedFiles:
  apps/desktop/src/adapters/desktopPersonalitiesAdapter.ts: Created new adapter
    class implementing PersonalitiesPersistenceAdapter interface with save(),
    load(), and reset() stub methods. Includes proper TypeScript types, JSDoc
    documentation, and exported instance following established patterns.
log: []
schema: v1.0
childrenIds:
  - T-create-comprehensive
  - T-create-desktoppersonalitiesada
  - T-implement-load-method-with
  - T-implement-reset-method-with
  - T-implement-save-method-with
created: 2025-08-17T02:06:43.065Z
updated: 2025-08-17T02:06:43.065Z
---

# Desktop Personalities Adapter Implementation

## Purpose and Functionality

Implement the `DesktopPersonalitiesAdapter` class that serves as the bridge between the UI store and Electron IPC for personalities file operations. This adapter provides the concrete implementation of the `PersonalitiesPersistenceAdapter` interface for the desktop platform.

## Key Components to Implement

- `DesktopPersonalitiesAdapter` class in `apps/desktop/src/adapters/`
- Implementation of save, load, and reset methods
- Integration with Electron IPC API through `window.electronAPI`
- Proper error handling and type conversion between domains

## Detailed Acceptance Criteria

### Functional Behavior

- **Save Operation**: `save()` method accepts `PersistedPersonalitiesSettingsData` and calls `window.electronAPI.personalities.save()` with proper error handling
- **Load Operation**: `load()` method returns `PersistedPersonalitiesSettingsData | null` by calling `window.electronAPI.personalities.load()`
- **Reset Operation**: `reset()` method calls `window.electronAPI.personalities.reset()` to restore default personalities
- **Error Propagation**: All IPC errors are properly caught and re-thrown with meaningful messages

### Data Validation and Error Handling

- Input validation ensures data structure matches expected schema before IPC calls
- Network/IPC timeouts handled gracefully with appropriate error messages
- Return values properly typed and validated before returning to calling code
- Null values handled correctly for empty/missing files

### Integration Requirements

- Adapter implements `PersonalitiesPersistenceAdapter` interface exactly
- Works seamlessly with existing `usePersonalitiesStore` from ui-shared package
- Compatible with Electron's contextIsolation and sandboxing requirements
- No direct file system access - all operations through IPC

### Performance Requirements

- Save operations complete within 200ms for typical personality data
- Load operations complete within 100ms
- No blocking of UI thread during file operations
- Efficient memory usage with no data caching in adapter layer

## Implementation Guidance

### Technical Approach

```typescript
export class DesktopPersonalitiesAdapter
  implements PersonalitiesPersistenceAdapter
{
  async save(personalities: PersistedPersonalitiesSettingsData): Promise<void> {
    try {
      await window.electronAPI.personalities.save(personalities);
    } catch (error) {
      throw new Error(`Failed to save personalities: ${error.message}`);
    }
  }

  async load(): Promise<PersistedPersonalitiesSettingsData | null> {
    try {
      return await window.electronAPI.personalities.load();
    } catch (error) {
      throw new Error(`Failed to load personalities: ${error.message}`);
    }
  }

  async reset(): Promise<void> {
    try {
      await window.electronAPI.personalities.reset();
    } catch (error) {
      throw new Error(`Failed to reset personalities: ${error.message}`);
    }
  }
}
```

### File Structure

- Create `apps/desktop/src/adapters/desktopPersonalitiesAdapter.ts`
- Export adapter instance for use by context provider
- Follow naming conventions from existing roles adapter

### Dependencies

- Requires `PersonalitiesPersistenceAdapter` interface from ui-shared
- Requires Electron IPC API types and implementation
- Requires `PersistedPersonalitiesSettingsData` type from shared package

## Testing Requirements

### Unit Tests (Required)

- Test successful save operation with valid data
- Test successful load operation returning expected data structure
- Test successful reset operation
- Test error handling for each method when IPC fails
- Test null return handling for load when no file exists
- Verify interface implementation completeness

### Test Coverage Requirements

- 100% code coverage for adapter methods
- All error paths tested with simulated IPC failures
- Mock `window.electronAPI` for isolated testing

**IMPORTANT**: Do not create integration or performance tests for this feature.

## Security Considerations

### Input Validation

- Validate data structure before passing to IPC layer
- Ensure no sensitive data logging in error messages
- Sanitize error messages to prevent information disclosure

### IPC Security

- Rely on Electron's contextIsolation for security boundary
- No direct access to Node.js APIs from renderer process
- All file operations through secure IPC channels only

## Dependencies

- **Prerequisites**: Requires `PersonalitiesPersistenceAdapter` interface from persistence layer epic
- **Dependent Features**: Context provider will depend on this adapter implementation
- **Integration Points**: Works with Electron IPC handlers (separate feature)

## Implementation Notes

- Follow the exact pattern established by the existing roles adapter
- Keep adapter stateless - no caching or local state management
- Error messages should be user-friendly while preserving technical details for debugging
- Use TypeScript strict mode for maximum type safety
