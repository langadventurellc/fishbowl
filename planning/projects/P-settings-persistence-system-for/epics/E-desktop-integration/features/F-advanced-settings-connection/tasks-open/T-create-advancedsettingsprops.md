---
kind: task
id: T-create-advancedsettingsprops
title: Create AdvancedSettingsProps type definition
status: open
priority: high
prerequisites: []
created: "2025-08-03T23:04:45.173321"
updated: "2025-08-03T23:04:45.173321"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Create AdvancedSettingsProps Type Definition

## Context

The settings system has been refactored to use a centralized form management pattern where SettingsContent creates form instances and passes them to child components. GeneralSettings and AppearanceSettings already follow this pattern with their respective Props types. AdvancedSettings needs a similar type definition.

## Implementation Requirements

Create a new type definition file at `apps/desktop/src/types/AdvancedSettingsProps.ts` that follows the established pattern:

```typescript
import type { UseFormReturn } from "react-hook-form";
import type { AdvancedSettingsFormData } from "@fishbowl-ai/ui-shared";

/**
 * Props for the AdvancedSettings component.
 *
 * Receives form instance from parent component to enable
 * centralized form management and unified settings saving.
 */
export interface AdvancedSettingsProps {
  /** Form instance managed by parent component */
  form: UseFormReturn<AdvancedSettingsFormData>;

  /** Loading state from parent's settings persistence */
  isLoading?: boolean;

  /** Error state from parent's settings persistence */
  error?: Error | null;
}
```

## Acceptance Criteria

- ✓ Type definition created at correct location
- ✓ Uses UseFormReturn from react-hook-form
- ✓ References AdvancedSettingsFormData from ui-shared package
- ✓ Includes optional isLoading and error props
- ✓ Follows same structure as GeneralSettingsProps and AppearanceSettingsProps
- ✓ Has proper JSDoc comments

## Testing Requirements

- Write unit tests to verify the type exports correctly
- Ensure TypeScript compilation succeeds with the new type

### Log
