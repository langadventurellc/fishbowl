---
kind: task
id: T-update-accessibility-and-test
title: Update accessibility and test references
status: open
priority: low
prerequisites:
  - T-update-settingscontent-component
created: "2025-08-04T11:15:47.694354"
updated: "2025-08-04T11:15:47.694354"
schema_version: "1.1"
parent: F-code-migration-and-setup
---

## Context

This task updates all remaining references to "api-keys" throughout the application, including accessibility descriptions, test files, and any other string references that were found in the codebase search.

**Related Feature**: F-code-migration-and-setup
**Files to Update**:

- `apps/desktop/src/utils/getAccessibleDescription.ts`
- `apps/desktop/src/utils/__tests__/accessibility.test.ts`
- `apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.tsx`
- `apps/desktop/src/hooks/__tests__/useNavigationKeyboard.test.ts`

## Implementation Requirements

Update all "api-keys" string references to "llm-setup" in:

1. Accessibility descriptions
2. Test data IDs and selectors
3. Test assertions and expectations
4. Any other hardcoded string references

## Technical Approach

For each file, locate and replace "api-keys" with "llm-setup":

1. `utils/getAccessibleDescription.ts` (line 11): Update the description key
2. `utils/__tests__/accessibility.test.ts` (line 163): Update test case
3. `components/settings/__tests__/SettingsModal.keyboard.test.tsx` (line 36): Update test ID
4. `hooks/__tests__/useNavigationKeyboard.test.ts` (lines 20, 62, 111, 152): Update test data and assertions

## Detailed Acceptance Criteria

### getAccessibleDescription.ts

- ✓ Key changed from "api-keys" to "llm-setup"
- ✓ Description text updated to reference LLM Setup instead of API Keys
- ✓ Function still works correctly for all section types

### accessibility.test.ts

- ✓ Test case updated to use "llm-setup"
- ✓ Test still validates accessibility descriptions
- ✓ All tests pass

### SettingsModal.keyboard.test.tsx

- ✓ Test ID updated from "nav-api-keys" to "nav-llm-setup"
- ✓ Button text updated from "API Keys" to "LLM Setup"
- ✓ Keyboard navigation tests still pass

### useNavigationKeyboard.test.ts

- ✓ Test data updated to use "llm-setup" and "LLM Setup"
- ✓ All test assertions updated to reference new section ID
- ✓ Navigation behavior tests still pass

## Code Changes

### getAccessibleDescription.ts (line 11)

```typescript
// Before
"api-keys": "Manage API keys for AI model providers and external services",

// After
"llm-setup": "Configure and manage LLM provider connections and API settings",
```

### accessibility.test.ts (line 163)

```typescript
// Before
"api-keys":

// After
"llm-setup":
```

### SettingsModal.keyboard.test.tsx (line 36)

```typescript
// Before
<button data-testid="nav-api-keys">API Keys</button>

// After
<button data-testid="nav-llm-setup">LLM Setup</button>
```

### useNavigationKeyboard.test.ts (lines 20, 62, 111, 152)

```typescript
// Before
{ id: "api-keys" as SettingsSection, label: "API Keys", hasSubTabs: false },
id: "api-keys",
expect(result.current.isItemFocused("api-keys", "section")).toBe(false);
expect(mockOnSectionChange).toHaveBeenCalledWith("api-keys");

// After
{ id: "llm-setup" as SettingsSection, label: "LLM Setup", hasSubTabs: false },
id: "llm-setup",
expect(result.current.isItemFocused("llm-setup", "section")).toBe(false);
expect(mockOnSectionChange).toHaveBeenCalledWith("llm-setup");
```

## Testing Requirements

After making these changes:

1. Run `pnpm test` to ensure all tests pass
2. Run `pnpm lint` to ensure code quality
3. Manually verify accessibility descriptions are appropriate
4. Test keyboard navigation in the settings modal

## Dependencies

**Prerequisites**: T-update-settingscontent-component (all component integration must be complete)

## Migration Impact

This task completes the basic migration by ensuring:

- Tests continue to pass with updated references
- Accessibility features work correctly
- No hardcoded strings remain from the old naming

## Security Considerations

No security implications - these are test and accessibility updates only.

### Log
