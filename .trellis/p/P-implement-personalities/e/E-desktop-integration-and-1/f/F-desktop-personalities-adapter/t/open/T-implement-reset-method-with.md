---
id: T-implement-reset-method-with
title: Implement reset method with error handling and unit tests
status: open
priority: medium
parent: F-desktop-personalities-adapter
prerequisites:
  - T-implement-load-method-with
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T02:15:13.521Z
updated: 2025-08-17T02:15:13.521Z
---

# Implement Reset Method with Error Handling and Unit Tests

## Context and Purpose

Implement the `reset()` method of the `DesktopPersonalitiesAdapter` class with comprehensive error handling and proper integration with backup systems. This method clears personality data and restores defaults through Electron IPC, following the exact pattern from `DesktopRolesAdapter` while ensuring data safety through backup operations.

## Detailed Requirements

### Method Implementation

- Replace the stub `reset()` method with full implementation
- Call `window.electronAPI.personalities.reset()` for IPC communication
- Return `Promise<void>` as specified by interface
- Ignore any return data from IPC call since interface expects void
- Follow the exact error handling pattern from `DesktopRolesAdapter.reset()`

### Reset Operation Behavior

- Clear all existing personality data from storage
- Trigger creation of default personalities in the main process
- Ensure atomic operation (backup then reset) for data safety
- Handle reset operation regardless of current file state (exists or not)

### Error Handling Implementation

- Catch all errors from the IPC call
- Preserve existing `PersonalitiesPersistenceError` instances without rewrapping
- Convert generic errors to `PersonalitiesPersistenceError` with "reset" operation
- Provide clear error messages for backup or reset failures
- Ensure no partial reset states that could corrupt data

## Implementation Guidance

### Code Pattern to Follow

```typescript
async reset(): Promise<void> {
  try {
    // Call reset but ignore the returned data since interface expects void
    await window.electronAPI.personalities.reset();
  } catch (error) {
    if (error instanceof PersonalitiesPersistenceError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Failed to reset personalities";
    throw new PersonalitiesPersistenceError(message, "reset", error);
  }
}
```

### Error Context Considerations

- Backup operation failures should be clearly distinguished from reset failures
- File permission errors should include guidance for user resolution
- Disk space errors should be handled gracefully with appropriate messages
- Network/IPC timeout errors should be retryable

## Unit Test Implementation

### Additional Test Cases for Reset Method

- **Successful reset operation**: Test normal reset flow
- **IPC call verification**: Verify correct call to IPC without parameters
- **Void return validation**: Confirm method returns void regardless of IPC response
- **Error preservation**: Test that `PersonalitiesPersistenceError` instances are not rewrapped
- **Generic error handling**: Test conversion of generic errors to `PersonalitiesPersistenceError`
- **Backup failure handling**: Test behavior when backup creation fails
- **Permission error handling**: Test handling of file permission issues
- **Disk space error handling**: Test behavior when insufficient disk space

### Test Structure Extension

```typescript
describe("reset", () => {
  it("should call IPC reset and return void", async () => {
    mockElectronAPI.personalities.reset.mockResolvedValue(undefined);

    const result = await adapter.reset();

    expect(result).toBeUndefined();
    expect(mockElectronAPI.personalities.reset).toHaveBeenCalledWith();
  });

  it("should ignore IPC return data and return void", async () => {
    // Even if IPC returns data, method should return void
    mockElectronAPI.personalities.reset.mockResolvedValue({ some: "data" });

    const result = await adapter.reset();

    expect(result).toBeUndefined();
  });

  it("should convert generic errors to PersonalitiesPersistenceError", async () => {
    const genericError = new Error("Backup failed");
    mockElectronAPI.personalities.reset.mockRejectedValue(genericError);

    await expect(adapter.reset()).rejects.toThrow(
      PersonalitiesPersistenceError,
    );

    const thrownError = await adapter.reset().catch((e) => e);
    expect(thrownError.operation).toBe("reset");
    expect(thrownError.cause).toBe(genericError);
  });

  it("should preserve PersonalitiesPersistenceError instances", async () => {
    const persistenceError = new PersonalitiesPersistenceError(
      "Reset failed",
      "reset",
    );
    mockElectronAPI.personalities.reset.mockRejectedValue(persistenceError);

    await expect(adapter.reset()).rejects.toThrow(persistenceError);
  });
});
```

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] `reset()` method calls `window.electronAPI.personalities.reset()` correctly
- [ ] Method completes successfully when IPC call succeeds
- [ ] Method returns `Promise<void>` as specified by interface
- [ ] Return value is always `undefined` regardless of IPC response data
- [ ] Reset operation clears existing personalities and restores defaults

### Data Safety Requirements

- [ ] Backup is created before reset operation (handled by IPC layer)
- [ ] Reset operation is atomic (no partial reset states)
- [ ] Data corruption is prevented through proper error handling
- [ ] Failed reset operations leave existing data intact

### Error Handling Requirements

- [ ] Existing `PersonalitiesPersistenceError` instances passed through unchanged
- [ ] Generic errors converted to `PersonalitiesPersistenceError` with "reset" operation
- [ ] Original error preserved as `cause` property for debugging
- [ ] Error messages distinguish between backup and reset failures
- [ ] Clear user guidance provided for permission and disk space errors

### Performance Requirements

- [ ] Method completes within 500ms for typical operations
- [ ] No memory leaks during error conditions
- [ ] Efficient IPC communication without unnecessary data transfer
- [ ] No blocking of UI thread during reset operations

### Testing Requirements

- [ ] 100% code coverage for reset method implementation
- [ ] All error paths tested with simulated failures
- [ ] Mock verification ensures correct IPC calls
- [ ] Edge cases covered (permission denied, disk full, etc.)
- [ ] Void return behavior verified regardless of IPC response

## Dependencies

### Prerequisites

- Requires completed load method implementation from previous task
- Requires `PersonalitiesPersistenceError` class from ui-shared package
- Requires test infrastructure setup from previous method tasks

### Integration Points

- Depends on Electron IPC channel `personalities:reset` (implemented in separate feature)
- Works with backup system for data safety (handled by main process)
- Integrates with default personalities creation logic
- Supports UI reset confirmation workflows

## Security Considerations

### Data Protection Security

- Ensure backup creation before destructive operations
- Validate reset completion before confirming success
- Handle file permission errors gracefully
- Prevent data loss through proper error handling

### IPC Security

- Rely on Electron's contextIsolation for security boundary
- No direct file system access from renderer process
- All operations through secure IPC channels only
- Follow established security patterns from existing adapters

## Testing Strategy

### Unit Test Coverage

- Test successful reset operations with complete flow
- Test error handling for backup and reset failures
- Test void return behavior with various IPC responses
- Verify mock interactions and parameter passing
- Test edge cases and boundary conditions

### Error Simulation

- Mock backup failures to test error handling paths
- Simulate file permission and disk space errors
- Test behavior with IPC timeouts and failures
- Verify proper error message generation and categorization

### Data Safety Tests

- Verify no partial reset states during error conditions
- Test that failed operations don't corrupt existing data
- Confirm backup creation before destructive operations
- Validate atomic operation behavior

## Implementation Notes

### Code Quality

- Follow TypeScript strict mode requirements
- Use consistent error handling patterns
- Include comprehensive JSDoc documentation
- Follow project linting and formatting standards

### Integration Considerations

- Design to work with UI confirmation dialogs
- Support rollback scenarios if reset fails
- Consider integration with undo/redo functionality
- Ensure compatibility with store synchronization

### Future Extensibility

- Plan for custom default personalities support
- Consider selective reset options (partial data clearing)
- Design error handling to support retry mechanisms
- Ensure compatibility with cloud backup integration

This task implements the reset functionality that enables users to restore default personalities safely while maintaining data integrity through proper backup and error handling mechanisms.
