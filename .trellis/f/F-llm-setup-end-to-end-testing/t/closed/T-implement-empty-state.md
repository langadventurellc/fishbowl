---
id: T-implement-empty-state
title: Implement empty state interaction tests with provider dropdown
status: done
priority: medium
parent: F-llm-setup-end-to-end-testing
prerequisites:
  - T-create-test-file-structure
affectedFiles:
  tests/desktop/features/llm-setup.spec.ts: Added comprehensive empty state
    interaction test suite with 4 test scenarios covering empty state display,
    provider dropdown functionality, setup button dynamic text updates, and
    modal opening behavior. Tests use reliable Playwright selectors and proper
    async handling for robust E2E testing of the LLM setup empty state user
    journey.
log:
  - >-
    Successfully implemented comprehensive end-to-end tests for the empty state
    interaction of the LLM setup functionality. The implementation includes four
    test scenarios that cover all required empty state behaviors:


    1. Empty state display validation - Verifies EmptyLlmState component
    displays correctly with key icon, descriptive text, provider dropdown, and
    setup button when no LLM configurations exist

    2. Provider dropdown functionality - Tests dropdown interaction, verifies
    OpenAI and Anthropic options are available, and validates selection state
    updates  

    3. Setup button dynamic text - Confirms button text changes correctly
    between "Set up OpenAI" and "Set up Anthropic" based on selected provider

    4. Modal opening from empty state - Validates that clicking setup button
    opens the LLM configuration modal with correct title for both OpenAI and
    Anthropic providers


    All tests pass successfully with proper async handling, reliable selectors
    using aria-labels and role attributes, and appropriate wait conditions. The
    implementation follows existing test patterns from the codebase and
    maintains clean test isolation with proper setup/teardown procedures.
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
