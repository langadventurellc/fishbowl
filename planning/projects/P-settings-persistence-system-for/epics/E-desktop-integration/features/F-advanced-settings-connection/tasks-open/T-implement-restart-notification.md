---
kind: task
id: T-implement-restart-notification
title: Implement restart notification for experimental features toggle
status: open
priority: normal
prerequisites:
  - T-refactor-advancedsettings
created: "2025-08-03T23:06:15.589794"
updated: "2025-08-03T23:06:15.589794"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Implement Restart Notification for Experimental Features Toggle

## Context

Some advanced settings, particularly experimental features, may require an app restart to take effect properly. The component needs to track when these settings change and notify the user that a restart is required.

## Implementation Requirements

### 1. Add State for Restart Tracking

In `apps/desktop/src/components/settings/AdvancedSettings.tsx`, add state management:

```typescript
const [requiresRestart, setRequiresRestart] = useState(false);
```

### 2. Watch for Settings That Require Restart

Add useEffect to track experimental features changes:

```typescript
// Track settings that require restart
const experimentalFeatures = form.watch("experimentalFeatures");
const settingsRef = useRef(settings?.advanced);

useEffect(() => {
  // Only set restart required if the value actually changed from saved settings
  if (
    settingsRef.current?.experimentalFeatures !== undefined &&
    experimentalFeatures !== settingsRef.current?.experimentalFeatures
  ) {
    setRequiresRestart(true);
  }
}, [experimentalFeatures]);

// Update ref when settings change
useEffect(() => {
  settingsRef.current = settings?.advanced;
}, [settings?.advanced]);
```

### 3. Display Restart Notification

Add a notification component when restart is required:

```typescript
{requiresRestart && (
  <div
    role="alert"
    className="flex items-center gap-2 p-3 mt-4 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 rounded-lg border border-amber-200 dark:border-amber-800"
  >
    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
    <span>Some changes require an app restart to take effect.</span>
  </div>
)}
```

### 4. Reset Notification After Save

The notification should be cleared when settings are successfully saved. This requires coordination with the parent component's save handler.

### 5. Consider Future Enhancement

For a future enhancement, consider adding a "Restart Now" button that could trigger an app restart via Electron API:

```typescript
// Future enhancement example
const handleRestartNow = () => {
  window.electronAPI?.restartApp?.();
};
```

## Technical Approach

1. Track original settings values using useRef
2. Compare current form values with original values
3. Show notification only when values differ from saved state
4. Clear notification after successful save
5. Use accessible alert role for screen readers

## Acceptance Criteria

- ✓ Restart notification appears when experimental features toggle changes
- ✓ Notification only shows for unsaved changes
- ✓ Notification is accessible to screen readers
- ✓ Notification has appropriate warning styling
- ✓ Notification placement doesn't disrupt form layout
- ✓ Clear indication of which settings require restart

## Testing Requirements

- Write unit tests for restart detection logic
- Test notification appears/disappears correctly
- Verify accessibility with screen readers
- Test edge cases (rapid toggling, etc.)
- Integration test with save flow

### Log
