---
id: T-fix-agent-settings-e2e-test
title: Fix Agent Settings E2E Test Failures After Modal Refactoring
status: in-progress
priority: high
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T23:07:13.277Z
updated: 2025-09-01T23:07:13.277Z
---

## Context

Recent refactoring of settings modals has broken 22 E2E tests across all agent settings functionality (creation, editing, deletion). The tests are failing because selectors no longer match the current component structure after the transition to the unified `SettingsFormModal` component.

This task implements the same fix pattern that was successfully used for LLM setup tests in commit `29bb03da45f8aade5d01ee72f23af7f70eb5069a`.

## Problem Analysis

Based on comprehensive analysis of test failures and component structure, the main issues are:

1. **Form field selector mismatches**: Helper function uses outdated selectors like `#agent-name` instead of proper form field selectors
2. **Button text selector issues**: Tests expect `/create.*agent/i` but actual button text is "Create Agent" or "Save Changes"
3. **Modal targeting**: Current content-based selectors work but could be enhanced with data-testid for reliability
4. **Timing issues**: Tests may need better waits for form state updates

## Current Component Structure

**Agent Modal Architecture:**

- Uses `SettingsFormModal` wrapper (same pattern as LLM setup)
- Has `[role="dialog"]` with `data-form-modal="true"`
- Form contains fields with names: `name`, `role`, `personality`, `systemPrompt`, `model`
- Button text: "Create Agent" (create mode) or "Save Changes" (edit mode)

**Current Test Helper Issues:**

- `waitForAgentModal()` uses correct content-based selector: `[role="dialog"]:has([name="role"], [name="personality"])`
- `fillAgentForm()` uses outdated selectors that don't match current DOM structure

## Technical Approach

Follow the proven 3-phase approach from the LLM setup fix:

### Phase 1: Fix Form Field Selectors (Critical)

Update `fillAgentForm.ts` to use proper form field selectors:

- Change `#agent-name` to `input[name="name"]`
- Verify combobox selectors work with current structure
- Fix textarea selector to use `textarea[name="systemPrompt"]`

### Phase 2: Fix Button Text Selectors (Critical)

Update all agent test files to use correct button text patterns:

- Change `/create.*agent/i` to `/Create Agent|Save Changes/`
- Update any other button text mismatches found during testing
- Ensure consistency across creation, editing, and deletion tests

## Implementation Requirements

### Files to Modify

**Primary (test fixes):**

1. `tests/desktop/helpers/settings/fillAgentForm.ts`
2. `tests/desktop/features/settings/agents/agent-creation.spec.ts`
3. `tests/desktop/features/settings/agents/agent-editing.spec.ts`
4. `tests/desktop/features/settings/agents/agent-deletion.spec.ts`

### Specific Changes Required

**In `fillAgentForm.ts`:**

```typescript
// OLD: const nameInput = window.locator("#agent-name");
// NEW: const nameInput = window.locator('input[name="name"]');

// Verify textarea selector:
const systemPromptTextarea = window.locator('textarea[name="systemPrompt"]');
```

**In test spec files:**

```typescript
// OLD: .filter({ hasText: /create.*agent/i })
// NEW: .filter({ hasText: /Create Agent|Save Changes/ })
```

## Acceptance Criteria

- [ ] All 22 failing agent E2E tests pass successfully
- [ ] Test command runs without timeout: `pnpm test:e2e:desktop -- tests/desktop/features/settings/agents`
- [ ] Form field selectors match current DOM structure exactly
- [ ] Button text selectors match actual button text in all modes
- [ ] Tests work reliably without flakiness across multiple runs
- [ ] Changes follow the principle of fixing tests, not implementation code
- [ ] Pattern consistency with successful LLM setup test fix

## Test Commands

**Full agent test suite:**

```bash
pnpm test:e2e:desktop -- tests/desktop/features/settings/agents
```

**Individual test files for incremental verification:**

```bash
pnpm test:e2e:desktop -- tests/desktop/features/settings/agents/agent-creation.spec.ts
pnpm test:e2e:desktop -- tests/desktop/features/settings/agents/agent-editing.spec.ts
pnpm test:e2e:desktop -- tests/desktop/features/settings/agents/agent-deletion.spec.ts
```

## Dependencies

None - this is a standalone test fix task following the established pattern from the LLM setup fix.

## Security Considerations

No security implications - this task only updates test selectors to match current DOM structure.

## Out of Scope

- Refactoring the modal implementation
- Adding agent-specific props to general-purpose components
- Performance optimizations or feature enhancements
- Changes to business logic or component behavior

## References

- Previous fix: Task T-fix-llm-setup-e2e-test (completed successfully)
- Commit reference: `29bb03da45f8aade5d01ee72f23af7f70eb5069a`
- Test failures: 22 tests across agent-creation.spec.ts, agent-editing.spec.ts, agent-deletion.spec.ts
