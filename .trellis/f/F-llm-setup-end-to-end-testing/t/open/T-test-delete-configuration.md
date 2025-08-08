---
id: T-test-delete-configuration
title: Test delete configuration flow with confirmation dialog
status: open
priority: medium
parent: F-llm-setup-end-to-end-testing
prerequisites:
  - T-test-openai-configuration
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-08T05:26:42.931Z
updated: 2025-08-08T05:26:42.931Z
---

# Test Delete Configuration Flow with Confirmation

## Context

Implement tests for deleting LLM configurations, including confirmation dialog handling and verification that data is properly removed from both storage locations.

## Implementation Requirements

### Basic Delete Flow Test

```typescript
test("deletes configuration with confirmation", async () => {
  // Create configuration
  // Click delete button on card
  // Verify confirmation dialog appears
  // Verify dialog title: "Delete API Configuration?"
  // Verify warning message: "This action cannot be undone"
  // Click "Yes" to confirm
  // Verify card disappears
  // Verify configuration removed from storage
});
```

### Confirmation Dialog Tests

1. **Cancel Delete Operation**

   ```typescript
   test("cancels delete when No is clicked", async () => {
     // Create configuration
     // Click delete button
     // Click "No" in confirmation dialog
     // Verify dialog closes
     // Verify configuration still exists
     // Verify storage unchanged
   });
   ```

2. **Dialog Content Verification**
   ```typescript
   test("shows proper delete confirmation dialog", async () => {
     // Click delete button
     // Verify dialog title is correct
     // Verify warning message is present
     // Verify "Yes" and "No" buttons exist
     // Verify clicking outside doesn't dismiss (if modal)
   });
   ```

### Storage Cleanup Verification

```typescript
test("removes data from both storage locations", async () => {
  // Create configuration with known ID
  const configId = "test-config-123";

  // Delete configuration

  // Verify JSON file updated
  const jsonConfig = JSON.parse(await fs.readFile(llmConfigPath, "utf-8"));
  expect(jsonConfig.configurations).not.toContainEqual(
    expect.objectContaining({ id: configId }),
  );

  // Verify secure storage cleared (API key removed)
  // May need to attempt read to verify it's gone
});
```

### Multiple Configuration Deletion

```typescript
test("handles deletion with multiple configs", async () => {
  // Create 3 configurations
  // Delete the middle one
  // Verify only target config removed
  // Verify other configs remain intact
  // Verify UI shows remaining configs correctly
});
```

### Delete All Configurations Test

```typescript
test("returns to empty state after deleting all configs", async () => {
  // Create 2 configurations
  // Delete first configuration
  // Delete second configuration
  // Verify empty state component appears
  // Verify provider dropdown is available again
});
```

### Rapid Delete Operations

```typescript
test("handles rapid delete operations", async () => {
  // Create multiple configurations
  // Quickly delete them in succession
  // Verify no race conditions
  // Verify all deletions complete properly
});
```

### Delete Error Handling

```typescript
test("handles delete errors gracefully", async () => {
  // Create configuration
  // Simulate storage error (if possible)
  // Attempt delete
  // Verify error message displays
  // Verify configuration remains in UI
});
```

## UI State Management

- Card removal animation (if any)
- List reordering after deletion
- Empty state transition when last config deleted
- "Add Another Provider" button visibility

## Technical Approach

1. Use dialog/modal handling patterns from other tests
2. Implement storage verification helpers
3. Test both confirm and cancel paths
4. Ensure atomic deletion (both storages or neither)

## Acceptance Criteria

- [ ] Delete button triggers confirmation dialog
- [ ] Confirmation dialog has correct content
- [ ] "Yes" completes deletion successfully
- [ ] "No" cancels deletion operation
- [ ] Configuration removed from JSON file
- [ ] API key removed from secure storage
- [ ] UI updates immediately after deletion
- [ ] Empty state appears when last config deleted
- [ ] Multiple configs can be deleted independently
- [ ] No data corruption during deletion

## Component References

- Delete button in LlmProviderCard
- Confirmation dialog component
- IPC delete handlers

## Error Scenarios

- Storage write failure during deletion
- Concurrent deletion attempts
- Deletion of non-existent configuration
- Permission errors on file system

## Dependencies

- T-test-openai-configuration (need configs to delete)
