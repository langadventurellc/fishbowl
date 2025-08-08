---
id: T-test-openai-configuration
title: Test OpenAI configuration creation flow with storage verification
status: open
priority: high
parent: F-llm-setup-end-to-end-testing
prerequisites:
  - T-create-test-file-structure
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-08T05:25:20.958Z
updated: 2025-08-08T05:25:20.958Z
---

# Test OpenAI Configuration Creation Flow

## Context

Implement comprehensive tests for creating OpenAI LLM configurations, including form validation, storage verification, and UI updates. This tests the complete flow from empty state to saved configuration.

## Implementation Requirements

### Main Test Scenario

```typescript
test("creates OpenAI configuration successfully", async () => {
  // Start from empty state
  // Select OpenAI provider
  // Click setup button
  // Fill in configuration form
  // Save configuration
  // Verify configuration appears in UI
  // Verify storage contains correct data
});
```

### Form Interaction Tests

1. **Required Field Validation**

   ```typescript
   test("validates required fields for OpenAI", async () => {
     // Open modal for OpenAI
     // Try to save without filling fields
     // Verify validation errors appear
     // Fill Custom Name only → still can't save
     // Fill API Key → save button enables
   });
   ```

2. **Default Values Test**

   ```typescript
   test("populates default Base URL for OpenAI", async () => {
     // Open OpenAI configuration modal
     // Verify Base URL field contains "https://api.openai.com/v1"
     // Verify Auth Header toggle state (if applicable)
   });
   ```

3. **Optional Fields Test**
   ```typescript
   test("handles optional Base URL override", async () => {
     // Fill required fields
     // Clear and modify Base URL
     // Save configuration
     // Verify custom Base URL is persisted
   });
   ```

### Storage Verification

1. **JSON File Verification**

   ```typescript
   // After save, read llm_config.json
   const configPath = path.join(userDataPath, "llm_config.json");
   const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
   // Verify config contains metadata (no API key)
   expect(config.configurations[0].provider).toBe("openai");
   expect(config.configurations[0].apiKey).toBeUndefined();
   ```

2. **Secure Storage Verification**
   ```typescript
   // Verify API key exists in secure storage (via IPC if testable)
   // May need to use configuration read API to confirm
   ```

### UI State Updates

- Configuration card appears after save
- Card shows correct provider branding (OpenAI)
- Custom name displays correctly
- Edit and delete buttons are functional
- "Add Another Provider" button becomes visible

## Technical Approach

1. Use data-testid attributes for reliable element selection
2. Implement proper wait strategies for async operations
3. Mock API key with deterministic test value
4. Verify both UI state and storage state

## Acceptance Criteria

- [ ] OpenAI configuration can be created from empty state
- [ ] Form validation prevents invalid submissions
- [ ] Default Base URL is correctly populated
- [ ] Configuration saves to both storage locations
- [ ] UI updates immediately after successful save
- [ ] Configuration card displays correct information
- [ ] Optional fields work when provided
- [ ] Required fields are properly enforced

## Component References

- OpenAiProviderFields: `apps/desktop/src/components/settings/llm-setup/OpenAiProviderFields.tsx`
- LlmConfigModal: `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`
- LlmProviderCard: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`

## Test Data

```typescript
const mockOpenAiConfig = {
  customName: "Test OpenAI Config",
  apiKey: "sk-test-1234567890abcdef",
  baseUrl: "https://api.openai.com/v1",
  customHeaders: {},
};
```

## Dependencies

- T-create-test-file-structure (test infrastructure must be ready)
