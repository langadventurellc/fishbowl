---
id: T-implement-empty-state
title: Implement empty state interaction tests with provider dropdown
status: open
priority: medium
parent: F-llm-setup-end-to-end-testing
prerequisites:
  - T-create-test-file-structure
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-08T05:24:54.357Z
updated: 2025-08-08T05:24:54.357Z
---

# Implement Empty State Interaction Tests

## Context

Test the empty state behavior when no LLM configurations exist, including provider selection dropdown and setup button interactions. This covers the initial user experience when first accessing LLM setup.

## Implementation Requirements

### Test Scenarios

1. **Empty State Display Test**

   ```typescript
   test("displays empty state when no configurations exist", async () => {
     // Navigate to LLM Setup tab
     // Verify EmptyLlmState component is visible
     // Check for provider dropdown presence
     // Verify setup button exists
   });
   ```

2. **Provider Dropdown Functionality Test**

   ```typescript
   test("provider dropdown shows available options", async () => {
     // Click provider dropdown
     // Verify OpenAI option is present
     // Verify Anthropic option is present
     // Select each option and verify selection updates
   });
   ```

3. **Setup Button Dynamic Text Test**

   ```typescript
   test("setup button text changes based on selected provider", async () => {
     // Select OpenAI → verify button shows "Set up OpenAI"
     // Select Anthropic → verify button shows "Set up Anthropic"
   });
   ```

4. **Modal Opening from Empty State Test**
   ```typescript
   test("opens configuration modal when setup button clicked", async () => {
     // Select provider (OpenAI)
     // Click setup button
     // Verify modal opens with correct title
     // Verify form fields are appropriate for provider
   });
   ```

### Component Selectors

- Empty state container: `[data-testid="empty-llm-state"]` or similar
- Provider dropdown: Identify by label or role
- Setup button: Identify by text content or data-testid
- Modal elements: Use existing modal selectors from other tests

### Verification Points

- Component visibility checks using `toBeVisible()`
- Text content verification for dynamic elements
- Dropdown option availability
- Modal state transitions

## Technical Approach

1. Use `window.locator()` for element selection
2. Implement `waitFor()` for async state changes
3. Use `expect().toBeVisible()` for visibility assertions
4. Handle dropdown interactions with click and selection

## Acceptance Criteria

- [ ] Empty state displays when no configurations exist
- [ ] Provider dropdown contains OpenAI and Anthropic options
- [ ] Setup button text updates based on selected provider
- [ ] Modal opens correctly for each provider selection
- [ ] Tests handle async operations without flakiness
- [ ] All assertions use appropriate Playwright matchers

## Component References

- EmptyLlmState: `apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx`
- LlmSetupSection: `apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx`

## Dependencies

- T-create-test-file-structure (test infrastructure must be ready)
