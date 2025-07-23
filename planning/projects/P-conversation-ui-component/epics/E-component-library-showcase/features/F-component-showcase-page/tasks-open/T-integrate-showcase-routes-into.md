---
kind: task
id: T-integrate-showcase-routes-into
title: Integrate showcase routes into main App.tsx routing
status: open
priority: normal
prerequisites:
  - T-set-up-react-router
  - T-create-componentshowcase-page
  - T-create-layoutshowcase-page-for
created: "2025-07-23T17:18:52.358560"
updated: "2025-07-23T17:18:52.358560"
schema_version: "1.1"
parent: F-component-showcase-page
---

# Integrate Showcase Routes into Main App.tsx

## Context

Connect the ComponentShowcase and LayoutShowcase pages to the main application routing in App.tsx, wrapping them with the ShowcaseLayout component for consistent navigation and theme functionality.

## Technical Approach

Update the main App.tsx routing configuration to include the new showcase routes:

1. **Import showcase components**: Import ShowcaseLayout, ComponentShowcase, and LayoutShowcase
2. **Add showcase routes**: Configure hash routes for the showcase pages
3. **Wrap with layout**: Ensure showcase pages are wrapped with ShowcaseLayout
4. **Maintain existing routes**: Preserve home and prototype page functionality

## Implementation Requirements

### File to Modify

- `apps/desktop/src/App.tsx`

### Route Configuration

Add these routes to the existing HashRouter setup:

```typescript
<Routes>
  {/* Existing routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/prototype" element={<DesignPrototype />} />

  {/* New showcase routes */}
  <Route path="/showcase/components" element={
    <ShowcaseLayout>
      <ComponentShowcase />
    </ShowcaseLayout>
  } />
  <Route path="/showcase/layout" element={
    <ShowcaseLayout>
      <LayoutShowcase />
    </ShowcaseLayout>
  } />
</Routes>
```

### Import Requirements

```typescript
// Add these imports to App.tsx
import { ShowcaseLayout } from "./components/showcase/ShowcaseLayout";
import { ComponentShowcase } from "./pages/showcase/ComponentShowcase";
import { LayoutShowcase } from "./pages/showcase/LayoutShowcase";
```

## Acceptance Criteria

- ✅ App.tsx successfully imports all showcase components without errors
- ✅ All showcase routes are accessible via hash navigation
- ✅ ShowcaseLayout wraps both showcase pages correctly
- ✅ Navigation between showcase pages works through ShowcaseLayout
- ✅ Theme toggle functionality works across both showcase routes
- ✅ Existing home and prototype routes continue to work
- ✅ TypeScript compilation succeeds without import or routing errors
- ✅ Hot reload works correctly with all new routes

## Route Structure Verification

After implementation, these routes should be functional:

- `#/` - Home page (existing)
- `#/prototype` - DesignPrototype page (existing)
- `#/showcase/components` - ComponentShowcase wrapped in ShowcaseLayout
- `#/showcase/layout` - LayoutShowcase wrapped in ShowcaseLayout

## Layout Integration Requirements

1. **Consistent wrapping**: Both showcase pages use the same ShowcaseLayout wrapper
2. **Theme state sharing**: Theme toggle state persists across showcase navigation
3. **Navigation functionality**: ShowcaseLayout navigation tabs work correctly
4. **No layout conflicts**: ShowcaseLayout doesn't interfere with existing app routing

## Testing Requirements

- Manual testing of all routes loading correctly
- Verify theme toggle works on both showcase pages
- Test navigation between component and layout showcase views
- Verify existing app functionality remains unaffected
- Test hot reload works with new routing structure
- Verify deep linking to showcase routes works in Electron

## Dependencies

- Requires HashRouter setup to be completed
- ShowcaseLayout component must be implemented
- ComponentShowcase page must be implemented
- LayoutShowcase page must be implemented

## Security Considerations

- Ensure no external routing outside Electron app context
- Validate that showcase routes don't expose sensitive functionality
- No dynamic route generation or external navigation

## Error Handling

- Handle missing showcase components gracefully
- Provide fallback routes if showcase pages fail to load
- Maintain app stability if showcase functionality has issues

### Log
