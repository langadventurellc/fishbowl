---
kind: task
id: T-update-navigation-to-llm-setup
title: Update navigation to LLM Setup
status: open
priority: normal
prerequisites:
  - T-update-settingssection-type-to
created: "2025-08-04T11:13:40.220338"
updated: "2025-08-04T11:13:40.220338"
schema_version: "1.1"
parent: F-code-migration-and-setup
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
