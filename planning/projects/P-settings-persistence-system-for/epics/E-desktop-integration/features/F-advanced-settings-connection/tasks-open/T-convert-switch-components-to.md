---
kind: task
id: T-convert-switch-components-to
title: Convert Switch components to form fields with real-time application and tests
status: open
priority: normal
prerequisites:
  - T-integrate-1
  - T-create-runtime-settings
created: "2025-08-03T17:34:37.246516"
updated: "2025-08-03T17:34:37.246516"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Convert Switch components to form fields with real-time application and tests

## Context

Following the pattern from appearance settings where theme changes apply immediately, we need to convert the Switch components in AdvancedSettings to use React Hook Form fields and apply debug logging changes in real-time while tracking which settings require restart.

## Implementation Requirements

### 1. Import Form Components and Utilities

Add to imports in `apps/desktop/src/components/settings/AdvancedSettings.tsx`:

```typescript
import { Controller } from "react-hook-form";
import { applyAdvancedSettings, requiresRestart } from "@/utils";
import { useUnsavedChanges } from "@/components/contexts/UnsavedChangesContext";
```

### 2. Add Unsaved Changes Tracking

```typescript
const { setUnsavedChanges } = useUnsavedChanges();
const [restartRequired, setRestartRequired] = useState(false);
```

### 3. Watch Form Values for Real-time Application

```typescript
// Watch all form values
const watchedValues = form.watch();

// Apply settings in real-time
useEffect(() => {
  if (watchedValues) {
    applyAdvancedSettings(watchedValues);
  }
}, [watchedValues]);

// Track if restart is required
useEffect(() => {
  if (settings?.advanced && watchedValues) {
    const needsRestart = requiresRestart(settings.advanced, watchedValues);
    setRestartRequired(needsRestart);
  }
}, [settings, watchedValues]);

// Track unsaved changes
useEffect(() => {
  const subscription = form.watch(() => {
    setUnsavedChanges(true);
  });
  return () => subscription.unsubscribe();
}, [form, setUnsavedChanges]);
```

### 4. Convert Debug Logging Switch to Form Field

Replace the existing Switch for debug logging:

```typescript
<Controller
  name="debugLogging"
  control={form.control}
  render={({ field }) => (
    <Switch
      id="debug-mode"
      checked={field.value}
      onCheckedChange={field.onChange}
      aria-describedby="debug-help"
      aria-label="Toggle debug logging on or off"
    />
  )}
/>
```

### 5. Convert Experimental Features Switch to Form Field

Replace the existing Switch for experimental features:

```typescript
<Controller
  name="experimentalFeatures"
  control={form.control}
  render={({ field }) => (
    <Switch
      id="experimental-features"
      checked={field.value}
      onCheckedChange={field.onChange}
      aria-describedby="experimental-help experimental-warning"
      aria-label="Toggle experimental features with instability risk"
    />
  )}
/>
```

### 6. Add Restart Required Notification

Add a notification when restart is required:

```typescript
{restartRequired && (
  <div role="alert" className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <span className="text-amber-900 dark:text-amber-100">
        Some changes require a restart to take effect
      </span>
    </div>
  </div>
)}
```

### 7. Update Component Tests

Update `apps/desktop/src/components/settings/__tests__/AdvancedSettings.test.tsx`:

```typescript
// Add mock for applyAdvancedSettings
jest.mock("@/utils", () => ({
  ...jest.requireActual("@/utils"),
  applyAdvancedSettings: jest.fn(),
  requiresRestart: jest.fn(),
}));

describe("AdvancedSettings real-time application", () => {
  it("should apply debug logging changes immediately", async () => {
    render(<AdvancedSettings />);

    const debugSwitch = screen.getByRole("switch", {
      name: /toggle debug logging/i,
    });

    await userEvent.click(debugSwitch);

    expect(applyAdvancedSettings).toHaveBeenCalledWith(
      expect.objectContaining({ debugLogging: true })
    );
  });

  it("should show restart notification when experimental features change", async () => {
    requiresRestart.mockReturnValue(true);

    render(<AdvancedSettings />);

    const experimentalSwitch = screen.getByRole("switch", {
      name: /toggle experimental features/i,
    });

    await userEvent.click(experimentalSwitch);

    expect(screen.getByText(/changes require a restart/i)).toBeInTheDocument();
  });
});
```

## Acceptance Criteria

- ✓ Switch components are converted to use React Hook Form Controller
- ✓ Debug logging changes apply immediately via applyAdvancedSettings
- ✓ Experimental features toggle shows restart required notification
- ✓ Form tracks unsaved changes when any setting is modified
- ✓ Real-time application works without save button click
- ✓ All accessibility attributes are preserved
- ✓ Unit tests verify real-time application behavior
- ✓ Unit tests verify restart notification appears correctly

## Testing Requirements

Write unit tests to verify:

- Form field controllers work correctly
- Debug logging applies immediately on change
- Experimental features show restart notification
- Unsaved changes are tracked properly
- Accessibility attributes remain functional
- Real-time application doesn't cause performance issues

## File Locations

- Component to modify: `apps/desktop/src/components/settings/AdvancedSettings.tsx`
- Tests to update: `apps/desktop/src/components/settings/__tests__/AdvancedSettings.test.tsx`
- Utilities from: `apps/desktop/src/utils/applyAdvancedSettings.ts`

### Log
