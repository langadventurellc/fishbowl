---
kind: task
id: T-integrate-1
title: Integrate useDesktopSettingsPersistence hook in AdvancedSettings component
status: open
priority: high
prerequisites: []
created: "2025-08-03T17:33:12.215505"
updated: "2025-08-03T17:33:12.215505"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Integrate useDesktopSettingsPersistence hook in AdvancedSettings component

## Context

The AdvancedSettings component currently uses local state for debug logging and experimental features. Following the pattern established in General and Appearance settings, we need to integrate it with the settings persistence system using the `useDesktopSettingsPersistence` hook.

## Implementation Requirements

### 1. Import Required Dependencies

Add to `apps/desktop/src/components/settings/AdvancedSettings.tsx`:

- Import `useDesktopSettingsPersistence` from `@fishbowl-ai/ui-shared`
- Import `useEffect` from React
- Import `advancedSettingsSchema` from `@fishbowl-ai/ui-shared`
- Import `defaultAdvancedSettings` from `@fishbowl-ai/ui-shared`
- Import `useForm` from `react-hook-form`
- Import `zodResolver` from `@hookform/resolvers/zod`
- Import `AdvancedSettingsFormData` type from `@fishbowl-ai/ui-shared`

### 2. Remove Local State Management

Remove the existing local state:

```typescript
const [debugLogging, setDebugMode] = useState(false);
const [experimentalFeatures, setExperimentalFeatures] = useState(false);
```

### 3. Integrate Persistence Hook

Add the persistence hook near the top of the component:

```typescript
const { settings, saveSettings, isLoading } = useDesktopSettingsPersistence();
```

### 4. Set Up React Hook Form

Initialize the form with validation and default values:

```typescript
const form = useForm<AdvancedSettingsFormData>({
  resolver: zodResolver(advancedSettingsSchema),
  defaultValues: settings?.advanced || defaultAdvancedSettings,
  mode: "onChange",
});
```

### 5. Add Effect to Reset Form When Settings Load

```typescript
useEffect(() => {
  if (settings?.advanced) {
    form.reset(settings.advanced);
  }
}, [settings, form]);
```

### 6. Create Loading Component

Create a simple loading state UI:

```typescript
if (isLoading) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-primary mb-[20px]">Advanced Settings</h1>
        <p className="text-muted-foreground text-sm mb-6">Loading settings...</p>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-muted rounded-lg"></div>
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    </div>
  );
}
```

## Acceptance Criteria

- ✓ AdvancedSettings component imports and uses useDesktopSettingsPersistence hook
- ✓ Local state management is replaced with React Hook Form
- ✓ Form initializes with saved settings or defaults
- ✓ Form resets when settings are loaded asynchronously
- ✓ Loading state is displayed during initial settings load
- ✓ Component follows the same pattern as General and Appearance settings
- ✓ No TypeScript errors or warnings
- ✓ Unit tests verify hook integration

## Testing Requirements

Write unit tests to verify:

- Hook is integrated correctly
- Form initializes with default values
- Form updates when settings load
- Loading state renders correctly
- Component handles undefined settings gracefully

## File Locations

- Component to modify: `apps/desktop/src/components/settings/AdvancedSettings.tsx`
- Hook from: `@fishbowl-ai/ui-shared`
- Types and schemas from: `@fishbowl-ai/ui-shared`

### Log
