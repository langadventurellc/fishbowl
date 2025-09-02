---
id: T-fix-llm-setup-e2e-test
title: Fix LLM Setup E2E Test Failures After Agent Modal Refactoring
status: done
priority: high
prerequisites: []
affectedFiles:
  tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts:
    Updated modal selectors from '[role="dialog"].llm-config-modal' to
    content-based '[role="dialog"]:has([name="customName"], [name="apiKey"])'
    for reliable targeting. Updated button text selectors from '/Save|Update/'
    to '/Add Configuration|Update Configuration/' to match actual button text.
  tests/desktop/helpers/settings/createMockAgentData.ts: Added required
    llmConfigId property with value 'test-llm-config-id' to fix TypeScript
    compilation errors
  tests/desktop/helpers/settings/createMockAnalystAgent.ts: Added required
    llmConfigId property with value 'test-llm-config-id' to fix TypeScript
    compilation errors
  tests/desktop/helpers/settings/createMockTechnicalAgent.ts: Added required
    llmConfigId property with value 'test-llm-config-id' to fix TypeScript
    compilation errors
  tests/desktop/helpers/settings/createMockWriterAgent.ts: Added required
    llmConfigId property with value 'test-llm-config-id' to fix TypeScript
    compilation errors
log:
  - Successfully fixed all failing E2E tests in edit-configuration.spec.ts by
    implementing content-based modal selectors and updating button text
    patterns. All 6 test cases now pass consistently. Also fixed pre-existing
    type errors in mock agent helper files by adding required llmConfigId
    property.
schema: v1.0
childrenIds: []
created: 2025-09-01T18:10:14.010Z
updated: 2025-09-01T18:10:14.010Z
---

## Context

Recent refactoring of agent modals has broken E2E tests for LLM setup functionality. The tests are failing because selectors no longer match the current component structure. This task focuses specifically on fixing the `edit-configuration.spec.ts` test file to work with the current implementation.

## Problem Analysis

The main issues identified:

1. **Modal selector mismatch**: Tests expect `[role="dialog"].llm-config-modal` but the modal doesn't have the `.llm-config-modal` class
2. **Button text selector issues**: Tests use outdated button text patterns that don't match current implementation
3. **General selector brittleness**: Some selectors may need updating to match current DOM structure

## Implementation Requirements

### Phase 1: Fix Modal Selectors (Required)

Update modal selectors in `tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts`:

**Current problematic selector:**

```javascript
const modal = window.locator('[role="dialog"].llm-config-modal');
```

**Fix options (try in order):**

1. Remove class requirement: `window.locator('[role="dialog"]')`
2. Use content-based selection: `window.locator('[role="dialog"]:has([name="customName"], [name="apiKey"])')`
3. Use button text to identify: `window.locator('[role="dialog"]:has(button:text("Add Configuration"))')`

**Locations to update:** Lines 30, 55, 114, 130, 184, 202, 272, 332, 381 (all modal selector references)

### Phase 2: Fix Button Text Selectors (Required)

Update save/update button selectors to handle both valid button texts:

**Current problematic selector:**

```javascript
.filter({ hasText: /Save|Update/ })
```

**Required fix:**

```javascript
.filter({ hasText: /Add Configuration|Update Configuration/ })
```

**Locations to update:** Lines 78, 143, 211, 288, 335 (all save/update button references)

### Phase 3: Optional Data Attributes (Only if Phase 1 fails)

If the above selector changes don't work reliably, add general-purpose data attributes:

1. **Add to `SettingsFormModal.tsx`:**

   ```typescript
   <DialogContent
     data-testid={dataTestId}
     // ... existing props
   />
   ```

2. **Add to `LlmConfigModal.tsx`:**

   ```typescript
   <SettingsFormModal
     dataTestId="llm-config-modal"
     // ... existing props
   />
   ```

3. **Update test selectors:**
   ```javascript
   const modal = window.locator(
     '[role="dialog"][data-testid="llm-config-modal"]',
   );
   ```

## Technical Approach

1. **Start with test-only fixes** - Modify selectors to match current DOM structure
2. **Test incremental changes** - Run the specific test file after each selector update
3. **Add data attributes only if needed** - Implementation changes should be minimal
4. **Validate all test scenarios** - Ensure all 6 test cases in the file pass

## Files to Modify

**Primary (test fixes):**

- `tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts`

**Secondary (only if Phase 3 needed):**

- `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`
- `apps/desktop/src/components/settings/common/SettingsFormModal.tsx`

## Acceptance Criteria

- [ ] All 6 test cases in `edit-configuration.spec.ts` pass successfully
- [ ] Test command runs without timeout: `pnpm test:e2e:desktop -- tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts`
- [ ] No implementation logic changed - only selectors updated or minimal data attributes added
- [ ] Tests work reliably without flakiness
- [ ] Changes follow the principle of fixing tests, not implementation code

## Test Command

```bash
pnpm test:e2e:desktop -- tests/desktop/features/settings/llm-setup/edit-configuration.spec.ts
```

## Dependencies

None - this is a standalone test fix task.

## Out of Scope

- Refactoring the modal implementation
- Adding LLM-specific props to general-purpose components
- Fixing other E2E test files (separate tasks)
- Performance optimizations or feature enhancements
