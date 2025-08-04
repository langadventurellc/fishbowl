---
kind: task
id: T-update-settingssection-type-to
title: Update SettingsSection type to llm-setup
status: open
priority: high
prerequisites: []
created: "2025-08-04T11:13:13.889069"
updated: "2025-08-04T11:13:13.889069"
schema_version: "1.1"
parent: F-code-migration-and-setup
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
