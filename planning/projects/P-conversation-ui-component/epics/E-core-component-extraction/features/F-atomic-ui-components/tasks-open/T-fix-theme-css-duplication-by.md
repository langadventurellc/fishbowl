---
kind: task
id: T-fix-theme-css-duplication-by
title: Fix theme CSS duplication by using ui-theme package
status: open
priority: normal
prerequisites: []
created: "2025-07-24T07:13:02.757003"
updated: "2025-07-24T07:13:02.757003"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Fix Theme CSS Duplication

## Context

Currently, the desktop app has CSS variables defined in two places:

1. `packages/ui-theme/src/claymorphism-theme.css` (not being used)
2. `apps/desktop/index.html` (actually being used - lines 28-92)

This creates maintenance overhead and potential inconsistencies. The app should use the shared theme package instead of duplicating CSS variables in the HTML file.

## Current Problem

- **Duplication**: Same CSS variables defined in two locations
- **Maintenance**: Changes must be made in multiple places
- **Inconsistency Risk**: Variables could drift out of sync
- **Package Not Used**: ui-theme package dependency is unused

## Implementation Requirements

### 1. Import Theme CSS

Add CSS import to the main entry point:

**Option A: Import in main.tsx**

```typescript
// apps/desktop/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fishbowl-ai/ui-theme/claymorphism-theme.css"; // Add this line
```

**Option B: Import in App.tsx**

```typescript
// apps/desktop/src/App.tsx
import "@fishbowl-ai/ui-theme/claymorphism-theme.css"; // Add this line
import { HashRouter, Routes, Route } from "react-router-dom";
```

### 2. Remove Duplicate CSS from HTML

Remove the CSS variables from `apps/desktop/index.html`:

**Remove lines 28-92** (the entire `<style>` block with CSS variables)

**Keep only essential HTML/body styling:**

```html
<style>
  body,
  html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
  #root {
    height: 100vh;
  }
</style>
```

### 3. Verify Theme Package Completeness

Compare variables in both files to ensure `claymorphism-theme.css` has all variables used in `index.html`:

**Check for missing variables:**

- All color variables (--background, --primary, etc.)
- Font variables (--font-sans, --font-serif, --font-mono)
- Shadow variables (--shadow-sm, --shadow-lg, etc.)
- Spacing and radius variables

**Add any missing variables** to `packages/ui-theme/src/claymorphism-theme.css`

### 4. Test Theme Switching

Verify that theme switching still works correctly:

- DesignPrototype page theme toggle functions
- ComponentShowcase page displays correctly in both themes
- All CSS variables resolve properly
- No console errors about missing CSS variables

### 5. Update Related Files

Update any references to the old CSS location:

- Check for CSS imports or references in other files
- Update documentation if needed
- Ensure Vite correctly processes the CSS import

## Acceptance Criteria

- ✅ Desktop app imports CSS from `@fishbowl-ai/ui-theme` package
- ✅ CSS variables removed from `apps/desktop/index.html`
- ✅ All CSS variables available and consistent
- ✅ Theme switching works correctly (light/dark)
- ✅ ComponentShowcase displays properly in both themes
- ✅ DesignPrototype theme toggle functions
- ✅ No console errors about missing CSS variables
- ✅ No visual regressions in existing components
- ✅ Package dependency `@fishbowl-ai/ui-theme` is now utilized

## Dependencies

- None (can be done independently of atomic components)

## Testing Requirements

- Test theme switching in DesignPrototype page
- Test ComponentShowcase in both light and dark themes
- Verify no CSS variable resolution errors in browser console
- Check that all existing styling appears unchanged
- Ensure hot reload still works during development

## Benefits

- ✅ **Single source of truth** for theme variables
- ✅ **Easier maintenance** - update colors in one place
- ✅ **Consistency** - eliminates drift between definitions
- ✅ **Package utilization** - ui-theme dependency now used
- ✅ **Future-proof** - easier to add new themes or modify existing ones

### Log
