---
kind: task
id: T-update-navigation-to-llm-setup
parent: F-code-migration-and-setup
status: done
title: Update navigation to LLM Setup
priority: normal
prerequisites:
  - T-update-settingssection-type-to
created: "2025-08-04T11:13:40.220338"
updated: "2025-08-04T11:42:49.099052"
schema_version: "1.1"
worktree: null
---

## Context

This task updates the settings navigation to display "LLM Setup" instead of "API Keys". The navigation is defined in SettingsNavigation.tsx and is responsible for rendering the sidebar menu in the settings modal.

**Related Feature**: F-code-migration-and-setup
**Current File Location**: `/Users/zach/code/fishbowl/apps/desktop/src/components/settings/SettingsNavigation.tsx`
**Depends On**: T-update-settingssection-type-to (SettingsSection type must be updated first)

## Implementation Requirements

Update the navigation configuration to:

1. Change the section ID from "api-keys" to "llm-setup"
2. Change the label from "API Keys" to "LLM Setup"
3. Maintain all other navigation properties unchanged

## Technical Approach

1. Open `apps/desktop/src/components/settings/SettingsNavigation.tsx`
2. Locate the navigation items array (around line 28)
3. Find the entry with `id: "api-keys"`
4. Update both the ID and label as specified
5. Ensure TypeScript const assertion remains in place

## Detailed Acceptance Criteria

- ✓ Navigation item ID changed from "api-keys" to "llm-setup"
- ✓ Navigation label changed from "API Keys" to "LLM Setup"
- ✓ The `hasSubTabs: false` property remains unchanged
- ✓ TypeScript const assertion (`as const`) is preserved
- ✓ No other navigation items are modified
- ✓ The navigation renders correctly with the new label
- ✓ Clicking the item still navigates to the correct section

## Code Changes

Current code (line ~28):

```typescript
{ id: "api-keys" as const, label: "API Keys", hasSubTabs: false },
```

Updated code:

```typescript
{ id: "llm-setup" as const, label: "LLM Setup", hasSubTabs: false },
```

## Testing Requirements

After making this change:

1. Run `pnpm quality` to ensure code quality checks pass
2. Open the application and navigate to Settings
3. Verify "LLM Setup" appears in the navigation sidebar
4. Click on "LLM Setup" and verify it highlights correctly
5. Ensure no console errors appear

## Dependencies

**Prerequisites**: T-update-settingssection-type-to must be completed first to avoid TypeScript errors

**Files that depend on this**: The navigation system will now emit "llm-setup" as the active section when clicked

## Security Considerations

No security implications - this is a UI label change only.

### Log

**2025-08-04T16:49:46.930174Z** - Successfully updated navigation label from "API Keys" to "LLM Setup" in settings navigation. Updated the navigation configuration to display the new user-friendly label while maintaining the correct "llm-setup" ID that was updated in the prerequisite task. All test files were updated to match the new label, ensuring continued test coverage. All quality checks pass including linting, formatting, and TypeScript compilation. All unit tests pass (1200+ tests across all packages). The navigation now correctly displays "LLM Setup" in the settings sidebar, maintaining all existing functionality while improving user experience clarity.

- filesChanged: ["apps/desktop/src/components/settings/SettingsNavigation.tsx", "apps/desktop/src/hooks/__tests__/useNavigationKeyboard.test.ts", "apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.tsx"]
