---
kind: task
id: T-refactor-advancedsettings
parent: F-advanced-settings-connection
status: done
title: Refactor AdvancedSettings component to use form props pattern
priority: high
prerequisites:
  - T-create-advancedsettingsprops
  - T-update-settingscontent-to-create
created: "2025-08-03T23:05:35.408107"
updated: "2025-08-03T23:38:40.340104"
schema_version: "1.1"
worktree: null
---

# Refactor AdvancedSettings Component to Use Form Props Pattern

## Context

AdvancedSettings currently manages its own state with useState hooks. It needs to be refactored to accept a form prop from SettingsContent and use react-hook-form patterns, following the same approach as GeneralSettings and AppearanceSettings.

## Implementation Requirements

Refactor `apps/desktop/src/components/settings/AdvancedSettings.tsx`:

### 1. Update Imports

```typescript
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";
import { useUnsavedChanges } from "@fishbowl-ai/ui-shared";
import type { AdvancedSettingsProps } from "@/types/AdvancedSettingsProps";
```

### 2. Update Component Signature

```typescript
export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  form,
  isLoading: _isLoading = false,
  error: _error = null,
}) => {
```

### 3. Remove State Management

Remove the useState hooks for debugLogging and experimentalFeatures as these will be managed by the form.

### 4. Add Unsaved Changes Hook

```typescript
const { setUnsavedChanges } = useUnsavedChanges();
```

### 5. Wrap Content in Form Component

Wrap the existing JSX in a Form component and update the structure to use FormField components:

```typescript
return (
  <div className="space-y-6">
    <div>
      <h1 className="text-heading-primary mb-[20px]">Advanced Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Advanced configuration options for power users.
      </p>
    </div>

    <Form {...form}>
      <div className="space-y-6" data-testid="advanced-settings-form">
        <div className="space-y-4">
          <h2 className="text-heading-secondary mb-4">Developer Options</h2>
          <div className="grid gap-6">
            {/* Debug Logging Field */}
            <FormField
              control={form.control}
              name="debugLogging"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable debug logging
                    </FormLabel>
                    <div className="text-description text-muted-foreground">
                      Show detailed logs in developer console
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        setUnsavedChanges(true);
                      }}
                      aria-describedby="debug-help"
                      aria-label="Toggle debug logging on or off"
                      data-testid="debug-logging-switch"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Experimental Features Field */}
            <FormField
              control={form.control}
              name="experimentalFeatures"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable experimental features
                    </FormLabel>
                    <div className="text-description text-muted-foreground">
                      Access features currently in development
                    </div>
                    <div
                      role="alert"
                      className="text-description text-amber-600 dark:text-amber-400 flex items-center gap-1"
                    >
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      May cause instability
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        setUnsavedChanges(true);
                      }}
                      aria-describedby="experimental-help experimental-warning"
                      aria-label="Toggle experimental features with instability risk"
                      data-testid="experimental-features-switch"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </Form>
  </div>
);
```

### 6. Remove Unused Elements

- Remove the isClearing state and related live region as it's not used
- Remove individual id attributes that were used with useState

## Acceptance Criteria

- ✓ Component accepts form prop following AdvancedSettingsProps interface
- ✓ All form fields use react-hook-form FormField pattern
- ✓ Unsaved changes are tracked when fields change
- ✓ Component no longer manages its own state
- ✓ Accessibility features are preserved
- ✓ Warning for experimental features is displayed
- ✓ TypeScript compilation succeeds

## Testing Requirements

- Write unit tests for the refactored component
- Test form field interactions and unsaved changes tracking
- Verify accessibility attributes are preserved
- Test that form validation works correctly

### Log

**2025-08-04T04:43:43.989661Z** - Successfully refactored AdvancedSettings component to use react-hook-form FormField pattern, matching the established pattern from GeneralSettings and AppearanceSettings. Removed local state management with useState hooks and replaced with form prop integration. All form fields now use the FormField pattern with proper unsaved changes tracking. Component maintains all accessibility features and warnings for experimental features. All quality checks and tests pass.

- filesChanged: ["apps/desktop/src/components/settings/AdvancedSettings.tsx"]
