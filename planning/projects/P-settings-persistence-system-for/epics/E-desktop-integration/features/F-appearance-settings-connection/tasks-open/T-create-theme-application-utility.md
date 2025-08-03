---
kind: task
id: T-create-theme-application-utility
title: Create theme application utility with immediate DOM updates and unit tests
status: open
priority: high
prerequisites: []
created: "2025-08-03T14:53:34.646055"
updated: "2025-08-03T14:53:34.646055"
schema_version: "1.1"
parent: F-appearance-settings-connection
---

# Create theme application utility with immediate DOM updates and unit tests

## Context

The appearance settings need a utility function to apply theme changes immediately to the DOM. This is critical for real-time theme switching UX. Follow the pattern used in the existing codebase for utilities.

## Implementation Requirements

### Create Theme Utility Module

- **Location**: `apps/desktop/src/utils/applyTheme.ts`
- **Purpose**: Apply theme changes to the document element
- **Pattern**: Follow existing utility patterns in the codebase

### Implementation Details

```typescript
export function applyTheme(theme: "light" | "dark" | "system"): void {
  const root = document.documentElement;

  // Determine effective theme
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const effectiveTheme = theme === "system" ? systemTheme : theme;

  // Apply theme class
  root.classList.remove("light", "dark");
  root.classList.add(effectiveTheme);

  // Store theme preference for consistency
  root.setAttribute("data-theme", theme);
}
```

### Unit Tests

Write comprehensive unit tests in `apps/desktop/src/utils/__tests__/applyTheme.test.ts`:

- Test light theme application
- Test dark theme application
- Test system theme detection
- Test class removal/addition
- Test data attribute setting
- Mock window.matchMedia for system theme tests

### Export from Utils Index

Add export to `apps/desktop/src/utils/index.ts`:

```typescript
export { applyTheme } from "./applyTheme";
```

## Acceptance Criteria

- ✓ Theme utility function created and exported
- ✓ Correctly applies light/dark classes to document root
- ✓ Handles system theme preference detection
- ✓ All theme transitions work smoothly
- ✓ Unit tests achieve 100% coverage
- ✓ Follows existing utility patterns

## Technical Approach

1. Create the utility function following project conventions
2. Handle all three theme options (light, dark, system)
3. Use window.matchMedia for system preference detection
4. Write comprehensive unit tests with mocked browser APIs
5. Export from utils index for easy importing

## Testing Requirements

- Unit tests for all theme options
- Mock window.matchMedia for different system preferences
- Test DOM manipulation (classList and setAttribute)
- Verify previous theme classes are removed
- Test edge cases (invalid themes, missing DOM elements)

### Log
