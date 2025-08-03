---
kind: task
id: T-implement-theme-loading-on
parent: F-appearance-settings-connection
status: done
title: Implement theme loading on application startup with unit tests
priority: high
prerequisites:
  - T-create-theme-application-utility
created: "2025-08-03T14:54:19.751782"
updated: "2025-08-03T15:43:39.454909"
schema_version: "1.1"
worktree: null
---

# Implement theme loading on application startup with unit tests

## Context

The saved theme preference needs to be applied immediately when the application starts, before the first render. This ensures users see their preferred theme without any flicker or flash of incorrect theme.

## Implementation Requirements

### Add Theme Initialization to App Component

**Location**: `apps/desktop/src/App.tsx`

### Implementation Details

1. **Import required dependencies**:

```typescript
import { applyTheme } from "./utils";
import { useDesktopSettingsPersistence } from "./adapters";
```

2. **Add theme initialization effect**:

```typescript
// Inside App component, after existing hooks
useEffect(() => {
  const loadInitialTheme = async () => {
    try {
      // Direct access to electron API for immediate theme application
      const settings = await window.electronAPI.settings.load();
      if (settings?.appearance?.theme) {
        applyTheme(settings.appearance.theme);
      } else {
        // Apply default theme if no saved preference
        applyTheme("system");
      }
    } catch (error) {
      // Fallback to system theme on error
      console.error("Failed to load theme preference:", error);
      applyTheme("system");
    }
  };

  loadInitialTheme();
}, []); // Run once on mount
```

3. **Consider adding to main.tsx for earlier application**:
   If theme flicker is still visible, consider adding theme application to `main.tsx` before React renders:

```typescript
// In main.tsx, before ReactDOM.createRoot
(async () => {
  try {
    const settings = await window.electronAPI.settings.load();
    if (settings?.appearance?.theme) {
      document.documentElement.classList.add(
        settings.appearance.theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : settings.appearance.theme,
      );
    }
  } catch (error) {
    // Silent fail - theme will be applied by App component
  }
})();
```

### Unit Tests

Create tests in `apps/desktop/src/__tests__/App.theme.test.tsx`:

- Test theme loads and applies on mount
- Test fallback to system theme on error
- Test handling of missing settings
- Mock electronAPI.settings.load
- Verify applyTheme is called with correct value

## Acceptance Criteria

- ✓ Theme loads immediately on app startup
- ✓ No theme flicker or flash of wrong theme
- ✓ Handles missing settings gracefully
- ✓ Falls back to system theme on error
- ✓ Works with all theme options (light, dark, system)
- ✓ Unit tests cover all scenarios
- ✓ Console errors are logged appropriately

## Technical Approach

1. Use useEffect with empty dependency array for mount-only execution
2. Access electron API directly for fastest loading
3. Apply theme before any UI renders if possible
4. Handle all error cases gracefully
5. Provide appropriate fallbacks

## Testing Requirements

- Unit test theme loading on mount
- Test error handling scenarios
- Mock electron API calls
- Verify theme application timing
- Test with various saved theme values
- Test missing settings scenario

### Log

**2025-08-03T20:56:09.702313Z** - Implemented theme loading on application startup with comprehensive unit tests. Added useEffect to App.tsx that loads saved theme settings on mount and applies them immediately via the applyTheme utility. The implementation includes proper error handling that gracefully falls back to default CSS theme if loading fails. Created 15 unit tests covering all scenarios including theme application for light/dark/system themes, handling of missing settings, error conditions, and settings changes. Also added TextEncoder polyfill to test setup for Node.js compatibility. All quality checks pass and the theme loads correctly on app startup without flicker.

- filesChanged: ["apps/desktop/src/App.tsx", "apps/desktop/src/App.test.tsx", "apps/desktop/src/setupTests.ts"]
