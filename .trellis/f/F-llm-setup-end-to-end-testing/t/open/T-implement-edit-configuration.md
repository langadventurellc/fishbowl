---
id: T-implement-edit-configuration
title: Implement edit configuration tests with data persistence verification
status: open
priority: medium
parent: F-llm-setup-end-to-end-testing
prerequisites:
  - T-test-openai-configuration
  - T-test-anthropic-configuration
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-08T05:26:14.174Z
updated: 2025-08-08T05:26:14.174Z
---

# Implement Edit Configuration Tests

## Context

Test the ability to edit existing LLM configurations, ensuring that changes are properly persisted and the UI updates correctly. This includes testing both metadata updates and API key changes.

## Implementation Requirements

### Basic Edit Flow Test

```typescript
test("edits existing configuration successfully", async () => {
  // Create initial configuration
  // Click edit button on configuration card
  // Verify modal opens in edit mode
  // Verify existing data is populated (except API key)
  // Modify custom name
  // Save changes
  // Verify card updates with new name
  // Verify changes persist in storage
});
```

### Edit Mode Verification Tests

1. **Modal Title in Edit Mode**

   ```typescript
   test("shows correct title when editing", async () => {
     // Create OpenAI config
     // Click edit → verify "Edit OpenAI Configuration"
     // Create Anthropic config
     // Click edit → verify "Edit Anthropic Configuration"
   });
   ```

2. **API Key Field Behavior**
   ```typescript
   test("handles API key field correctly in edit mode", async () => {
     // Create config with API key
     // Open edit modal
     // Verify API key field shows placeholder, not actual key
     // Leave field empty → existing key should remain
     // Enter new key → should update on save
   });
   ```

### Field Update Tests

1. **Update Custom Name**

   ```typescript
   test("updates custom name successfully", async () => {
     // Edit configuration
     // Change custom name from "Config A" to "Config B"
     // Save and verify UI update
     // Reload and verify persistence
   });
   ```

2. **Update Base URL**

   ```typescript
   test("updates base URL for custom endpoints", async () => {
     // Edit configuration
     // Change base URL to custom endpoint
     // Save and verify storage update
     // Verify API calls would use new endpoint
   });
   ```

3. **Update API Key**
   ```typescript
   test("updates API key in secure storage", async () => {
     // Edit configuration
     // Enter new API key
     // Save changes
     // Verify old key is replaced (not duplicated)
     // Verify new key works (if testable)
   });
   ```

### Validation During Edit

```typescript
test("validates fields during edit", async () => {
  // Edit configuration
  // Clear required custom name → can't save
  // Enter invalid Base URL → shows error
  // Fix validation errors → can save
});
```

### Cancel Edit Operation

```typescript
test("cancels edit without saving changes", async () => {
  // Create configuration with "Name A"
  // Open edit modal
  // Change to "Name B"
  // Click Cancel or close modal
  // Verify card still shows "Name A"
  // Verify storage unchanged
});
```

### Multiple Edits Test

```typescript
test("handles multiple sequential edits", async () => {
  // Create configuration
  // Edit and save (change 1)
  // Edit and save again (change 2)
  // Verify both changes are reflected
  // Verify no data corruption
});
```

## Storage Verification

- After each edit, verify `llm_config.json` reflects changes
- Confirm secure storage updates for API key changes
- Ensure no orphaned data in either storage location
- Verify `updatedAt` timestamp updates

## Technical Approach

1. Create configuration first, then test editing
2. Use helper functions to verify storage state
3. Test both save and cancel paths
4. Ensure proper cleanup between edit tests

## Acceptance Criteria

- [ ] Edit modal opens with existing data populated
- [ ] API key field shows placeholder in edit mode
- [ ] All fields can be updated successfully
- [ ] Changes persist in both storage locations
- [ ] Cancel operation discards changes
- [ ] Validation works during edit
- [ ] Multiple edits don't cause data corruption
- [ ] UI immediately reflects saved changes

## Component References

- LlmConfigModal edit mode logic
- Storage update methods in main process

## Edge Cases

- Editing when another user/process modified the file
- Editing with invalid data in storage
- Rapid successive edits
- Edit after delete in another window

## Dependencies

- T-test-openai-configuration (need configs to edit)
- T-test-anthropic-configuration (test both provider types)
