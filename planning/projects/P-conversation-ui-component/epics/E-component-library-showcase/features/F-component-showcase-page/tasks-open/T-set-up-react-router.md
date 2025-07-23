---
kind: task
id: T-set-up-react-router
title: Set up React Router configuration in main App.tsx
status: open
priority: high
prerequisites: []
created: "2025-07-23T17:10:42.522048"
updated: "2025-07-23T17:10:42.522048"
schema_version: "1.1"
parent: F-component-showcase-page
---

# Set up React Router Configuration

## Context

The current App.tsx uses simple state-based navigation (`useState<"home" | "prototype">`) but needs React Router DOM 7.7.0 (already in dependencies) to support the new showcase routes.

## Technical Approach

Replace the existing state-based view switching with React Router using HashRouter for Electron compatibility:

1. **Remove existing navigation state**: Replace `useState<"home" | "prototype">` with router-based navigation
2. **Configure HashRouter structure**: Set up hash-based routes for `#/`, `#/prototype`, `#/showcase/components`, `#/showcase/layout`
3. **Maintain existing functionality**: Preserve the current home and prototype page access
4. **Add showcase routes**: Create placeholder routes for the new showcase pages

## Implementation Requirements

### File to Modify

- `apps/desktop/src/App.tsx`

### Route Structure to Implement

```typescript
- "#/" (Home page - current Hello World landing)
- "#/prototype" (Existing DesignPrototype page)
- "#/showcase/components" (Individual component showcase)
- "#/showcase/layout" (Layout component showcase)
```

### Code Changes

1. Import React Router components: `HashRouter`, `Routes`, `Route`, `Navigate`
2. Wrap the app with `HashRouter` (not BrowserRouter - required for Electron)
3. Replace conditional view rendering with `Routes` and `Route` components
4. Create navigation components or update existing navigation to use `Link` or `useNavigate`

## Acceptance Criteria

- ✅ App.tsx successfully loads with HashRouter configuration
- ✅ All existing functionality works (home page and prototype page)
- ✅ Hash routes are accessible: `#/`, `#/prototype`, `#/showcase/components`, `#/showcase/layout`
- ✅ Navigation preserves existing user experience
- ✅ Hot reload works correctly with new routing structure
- ✅ TypeScript compilation succeeds without routing-related errors
- ✅ Electron app loads without console errors related to routing
- ✅ Hash-based routing works correctly within Electron context

## Dependencies

- React Router DOM 7.7.0 (already installed)
- Maintain compatibility with existing Electron app setup

## Testing Requirements

- Manual testing of all routes loads correctly
- Verify existing home → prototype navigation still works
- Test browser back/forward buttons work with new routing
- Verify deep linking to routes works within Electron context

## Security Considerations

- Ensure no external routing or navigation outside Electron app context
- Validate route parameters if any are added in future

### Log
