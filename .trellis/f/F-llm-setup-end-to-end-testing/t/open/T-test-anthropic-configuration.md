---
id: T-test-anthropic-configuration
title: Test Anthropic configuration creation flow with provider-specific fields
status: open
priority: high
parent: F-llm-setup-end-to-end-testing
prerequisites:
  - T-create-test-file-structure
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-08T05:25:44.080Z
updated: 2025-08-08T05:25:44.080Z
---

# Test Anthropic Configuration Creation Flow

## Context

Implement tests for creating Anthropic LLM configurations, ensuring provider-specific fields and defaults are handled correctly. This validates that the system properly supports multiple provider types.

## Implementation Requirements

### Main Test Scenario

```typescript
test("creates Anthropic configuration successfully", async () => {
  // Start from empty state
  // Select Anthropic provider
  // Click setup button
  // Verify modal shows "Add Anthropic Configuration"
  // Fill Anthropic-specific fields
  // Save configuration
  // Verify Anthropic card appears with correct branding
});
```

### Provider-Specific Field Tests

1. **Anthropic Default Values**

   ```typescript
   test("populates Anthropic-specific defaults", async () => {
     // Open Anthropic configuration modal
     // Verify Base URL defaults to "https://api.anthropic.com"
     // Verify any Anthropic-specific field defaults
   });
   ```

2. **Field Validation for Anthropic**
   ```typescript
   test("validates Anthropic configuration fields", async () => {
     // Open Anthropic modal
     // Test required field validation
     // Verify API key format if applicable
     // Test custom header functionality if different
   });
   ```

### Multiple Provider Coexistence Test

```typescript
test("supports both OpenAI and Anthropic configs simultaneously", async () => {
  // Create OpenAI configuration first
  // Click "Add Another Provider"
  // Create Anthropic configuration
  // Verify both cards display correctly
  // Verify each has independent edit/delete actions
});
```

### Provider Branding Verification

- Anthropic card shows correct provider logo/icon
- Provider name displays correctly
- Card styling matches provider theme if applicable
- Custom name overrides display name appropriately

### Storage Verification for Anthropic

```typescript
// Verify Anthropic config in llm_config.json
const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
const anthropicConfig = config.configurations.find(
  (c) => c.provider === "anthropic",
);
expect(anthropicConfig).toBeDefined();
expect(anthropicConfig.baseUrl).toBe("https://api.anthropic.com");
```

## Technical Approach

1. Reuse test helpers from OpenAI tests where applicable
2. Focus on provider-specific differences
3. Ensure proper cleanup between provider tests
4. Test interaction between multiple providers

## Acceptance Criteria

- [ ] Anthropic configuration can be created successfully
- [ ] Anthropic-specific defaults are properly set
- [ ] Provider branding displays correctly
- [ ] Multiple providers can coexist
- [ ] Storage correctly differentiates providers
- [ ] Edit/delete work independently per provider
- [ ] Field validation is provider-appropriate

## Component References

- AnthropicProviderFields: `apps/desktop/src/components/settings/llm-setup/AnthropicProviderFields.tsx`
- Provider type definitions in shared package

## Test Data

```typescript
const mockAnthropicConfig = {
  customName: "Test Anthropic Config",
  apiKey: "ant-test-key-1234567890",
  baseUrl: "https://api.anthropic.com",
  customHeaders: {},
};
```

## Dependencies

- T-create-test-file-structure (test infrastructure must be ready)
