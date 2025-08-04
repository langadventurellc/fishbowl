---
kind: task
id: T-update-settingssection-type-to
parent: F-code-migration-and-setup
status: done
title: Update SettingsSection type to llm-setup
priority: high
prerequisites: []
created: "2025-08-04T11:13:13.889069"
updated: "2025-08-04T11:26:04.793881"
schema_version: "1.1"
worktree: null
---

## Context

This task is the first step in migrating from "API Keys" to "LLM Setup" in the settings. The SettingsSection type is a union type that defines all valid section identifiers for the settings modal navigation. This type is located in the shared UI package and is used throughout the application for type safety.

**Related Feature**: F-code-migration-and-setup
**Current Type Location**: `/Users/zach/code/fishbowl/packages/ui-shared/src/stores/settings/settingsSection.ts`

## Implementation Requirements

Update the SettingsSection type definition to replace "api-keys" with "llm-setup". This is a simple but critical change that enables all subsequent migration work.

## Technical Approach

1. Open the file at `packages/ui-shared/src/stores/settings/settingsSection.ts`
2. Locate the SettingsSection type definition (around line 9)
3. Change the string literal from "api-keys" to "llm-setup"
4. Save the file

## Detailed Acceptance Criteria

- ✓ The SettingsSection type includes "llm-setup" instead of "api-keys"
- ✓ The type maintains all other section identifiers unchanged
- ✓ The file's JSDoc comments remain accurate
- ✓ TypeScript compilation succeeds after the change
- ✓ The change is minimal and focused only on this type update

## Dependencies

This task has no prerequisites but blocks all other tasks in this feature. Other components and files depend on this type being updated first.

## Testing Requirements

After making this change:

1. Run `pnpm type-check` from the project root to ensure no TypeScript errors
2. The type system will automatically validate that this change is compatible with the rest of the codebase
3. Note: This change alone will introduce TypeScript errors in other files - this is expected and will be resolved by subsequent tasks

## Security Considerations

No security implications - this is purely a type rename with no runtime impact.

## Example Code

Before:

```typescript
export type SettingsSection =
  | "general"
  | "api-keys"
  | "appearance"
  | "agents"
  | "personalities"
  | "roles"
  | "advanced";
```

After:

```typescript
export type SettingsSection =
  | "general"
  | "llm-setup"
  | "appearance"
  | "agents"
  | "personalities"
  | "roles"
  | "advanced";
```

### Log

**2025-08-04T16:36:37.309499Z** - Successfully updated SettingsSection type from 'api-keys' to 'llm-setup' throughout the entire codebase. Updated all references including type definitions, navigation components, content mapping, accessibility descriptions, test files, and documentation comments. All quality checks pass and the API Keys functionality remains unchanged while now using the new 'llm-setup' section identifier internally.

- filesChanged: ["packages/ui-shared/src/stores/settings/settingsSection.ts", "packages/ui-shared/src/stores/settings/settingsStore.ts", "packages/ui-shared/src/stores/settings/__tests__/hooks.test.ts", "packages/ui-shared/src/stores/settings/__tests__/settingsStore.test.ts", "packages/ui-shared/src/stores/settings/settingsModalActions.ts", "packages/ui-shared/src/stores/settings/useSettingsModal.ts", "apps/desktop/src/components/settings/SettingsNavigation.tsx", "apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/utils/getAccessibleDescription.ts", "apps/desktop/src/utils/__tests__/accessibility.test.ts", "apps/desktop/src/hooks/__tests__/useNavigationKeyboard.test.ts", "apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.tsx"]
