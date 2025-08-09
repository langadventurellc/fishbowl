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

Implement tests for deleting LLM configurations, including confirmation dialog handling and verification that data is properly removed from both storage locations. This should be implemented in the refactored test structure.

## Implementation Location

Create a new test file: `tests/desktop/features/settings/llm-setup/delete-configuration.spec.ts`

This follows the refactored test structure where each scenario has its own dedicated test file.

## Implementation Requirements

### Test Structure Setup

```typescript
import { expect, test } from "@playwright/test";
import { readFile } from "fs/promises";
import {
  setupLlmTestSuite,
  openLlmSetupSection,
  waitForEmptyState,
  waitForConfigurationList,
  createMockOpenAiConfig,
  type StoredLlmConfig,
} from "./index";

test.describe("Feature: LLM Setup Configuration - Delete Configuration", () => {
  const testSuite = setupLlmTestSuite();

  // Tests go here...
});
```

### Basic Delete Flow Test

```typescript
test("deletes configuration with confirmation", async () => {
  const window = testSuite.getWindow();

  // Create configuration using shared helpers
  await openLlmSetupSection(window);
  await waitForEmptyState(window);

  // Use createMockOpenAiConfig for consistent test data
  const mockConfig = createMockOpenAiConfig();

  // Create config through UI...
  // Click delete button on card
  // Verify confirmation dialog appears
  // Verify dialog title: "Delete API Configuration?"
  // Verify warning message: "This action cannot be undone"
  // Click "Yes" to confirm
  // Verify card disappears
  // Verify configuration removed from storage using testSuite.getLlmConfigPath()
});
```

### Confirmation Dialog Tests

1. **Cancel Delete Operation**

   ```typescript
   test("cancels delete when No is clicked", async () => {
     const window = testSuite.getWindow();
     const llmConfigPath = testSuite.getLlmConfigPath();

     // Create configuration using shared flow
     // Click delete button
     // Click "No" in confirmation dialog
     // Verify dialog closes
     // Verify configuration still exists
     // Verify storage unchanged using readFile(llmConfigPath)
   });
   ```

2. **Dialog Content Verification**
   ```typescript
   test("shows proper delete confirmation dialog", async () => {
     // Use testSuite.getWindow() for window access
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
  const window = testSuite.getWindow();
  const llmConfigPath = testSuite.getLlmConfigPath();
  const secureKeysPath = testSuite.getSecureKeysPath();

  // Create configuration with known data using createMockOpenAiConfig
  const mockConfig = createMockOpenAiConfig();

  // Delete configuration through UI

  // Verify JSON file updated
  const configContent = await readFile(llmConfigPath, "utf-8");
  const configs: StoredLlmConfig[] = JSON.parse(configContent);
  expect(
    configs.find((c) => c.customName === mockConfig.customName),
  ).toBeUndefined();

  // Verify secure storage cleared (API key removed)
  try {
    const keysContent = await readFile(secureKeysPath, "utf-8");
    const keys = JSON.parse(keysContent);
    // Verify API key for this config is removed
  } catch (error) {
    console.log("Secure storage verification:", error);
  }
});
```

### Multiple Configuration Deletion

```typescript
test("handles deletion with multiple configs", async () => {
  // Use shared helper pattern: setupLlmTestSuite()
  // Create 3 configurations using createMockOpenAiConfig
  // Delete the middle one
  // Verify only target config removed
  // Verify other configs remain intact
  // Verify UI shows remaining configs correctly
});
```

### Delete All Configurations Test

```typescript
test("returns to empty state after deleting all configs", async () => {
  // Use waitForConfigurationList and waitForEmptyState helpers
  // Create 2 configurations
  // Delete first configuration
  // Delete second configuration
  // Use waitForEmptyState to verify empty state component appears
  // Verify provider dropdown is available again
});
```

### Rapid Delete Operations

```typescript
test("handles rapid delete operations", async () => {
  // Create multiple configurations using shared mock functions
  // Quickly delete them in succession
  // Verify no race conditions
  // Verify all deletions complete properly
});
```

### Delete Error Handling

```typescript
test("handles delete errors gracefully", async () => {
  // Create configuration using shared setup
  // Simulate storage error (if possible)
  // Attempt delete
  // Verify error message displays
  // Verify configuration remains in UI
});
```

## Updated Technical Approach

1. **Use Refactored Test Structure**:
   - Utilize `setupLlmTestSuite()` for consistent test setup
   - Import shared helpers from `./index`
   - Follow established patterns from other test files

2. **Leverage Shared Utilities**:
   - Use `createMockOpenAiConfig()` and `createMockAnthropicConfig()` for test data
   - Use `waitForEmptyState()` and `waitForConfigurationList()` for state management
   - Use `testSuite.getLlmConfigPath()` and `testSuite.getSecureKeysPath()` for file paths

3. **Storage Verification**:
   - Use the established patterns from other test files
   - Import `readFile` from "fs/promises" at the top level
   - Use the `StoredLlmConfig` type for type safety

4. **Test Organization**:
   - Create as separate file following naming convention: `delete-configuration.spec.ts`
   - Include proper feature description in test.describe()
   - Maintain consistency with other test files in the suite

## Acceptance Criteria

- [ ] New test file created in `/tests/desktop/features/settings/llm-setup/` directory
- [ ] Uses `setupLlmTestSuite()` pattern consistently
- [ ] Imports shared helpers from `./index`
- [ ] Delete button triggers confirmation dialog
- [ ] Confirmation dialog has correct content
- [ ] "Yes" completes deletion successfully
- [ ] "No" cancels deletion operation
- [ ] Configuration removed from JSON file using `testSuite.getLlmConfigPath()`
- [ ] API key removed from secure storage using `testSuite.getSecureKeysPath()`
- [ ] UI updates immediately after deletion
- [ ] Uses `waitForEmptyState()` when last config deleted
- [ ] Multiple configs can be deleted independently
- [ ] No data corruption during deletion

## File Structure Context

This task should create:

```
tests/desktop/features/settings/llm-setup/
├── delete-configuration.spec.ts  (NEW - this task)
├── empty-state-interaction.spec.ts
├── openai-configuration-creation.spec.ts
├── anthropic-configuration-creation.spec.ts
├── multiple-provider-management.spec.ts
├── edit-configuration.spec.ts
├── form-validation-error-handling.spec.ts
├── multiple-same-provider.spec.ts
├── add-another-provider-button.spec.ts
├── configuration-list-ordering.spec.ts
├── handling-many-configurations.spec.ts
├── provider-selection-after-creation.spec.ts
└── index.ts (imports all shared utilities)
```

## Dependencies

- All shared test utilities are available in the `./index` barrel file
- `setupLlmTestSuite()` provides consistent test setup
- Mock data factories are available for creating test configurations
- Storage path helpers are available through the test suite return object
