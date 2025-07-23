---
kind: task
id: T-create-shared-layout-component
title: Create shared layout component with navigation and theme toggle
status: open
priority: high
prerequisites:
  - T-set-up-react-router
created: "2025-07-23T17:11:06.370441"
updated: "2025-07-23T17:11:06.370441"
schema_version: "1.1"
parent: F-component-showcase-page
---

# Create Shared Showcase Layout Component

## Context

Create a shared layout component that wraps both showcase pages, providing navigation between component and layout showcases, plus theme toggle functionality extracted from DesignPrototype.tsx.

## Technical Approach

Build a reusable layout component following the existing codebase patterns:

1. **Extract theme toggle logic**: Adapt the theme toggle from DesignPrototype.tsx (lines with `isDark` state and `.dark` class application)
2. **Create navigation interface**: Simple navigation to switch between component and layout showcase views
3. **Maintain theme consistency**: Use existing CSS custom properties system from claymorphism-theme.css
4. **Follow existing styling patterns**: Use CSS-in-JS approach similar to DesignPrototype

## Implementation Requirements

### File to Create

- `apps/desktop/src/components/showcase/ShowcaseLayout.tsx`

### Component Structure

```typescript
interface ShowcaseLayoutProps {
  children: React.ReactNode;
}

export function ShowcaseLayout({ children }: ShowcaseLayoutProps) {
  // Theme toggle state and logic (extracted from DesignPrototype)
  // Navigation between showcase views
  // Render children within themed container
}
```

### Theme Integration Requirements

1. **Reuse existing theme system**: Apply/remove `.dark` class to root container
2. **Extract theme toggle button**: Use similar styling to DesignPrototype theme toggle
3. **Maintain theme persistence**: Use same state management approach as existing code
4. **CSS custom properties**: Leverage existing claymorphism-theme.css variables

### Navigation Requirements

1. **Simple navigation tabs/buttons**: Switch between "Components" and "Layout" views
2. **Active state indication**: Show which showcase is currently active
3. **React Router integration**: Use `Link` or `useNavigate` for navigation
4. **Consistent styling**: Follow existing design language from DesignPrototype

### Layout Structure

```typescript
<div className={isDark ? "dark" : ""}>
  <header>
    {/* Theme toggle button */}
    {/* Navigation tabs */}
  </header>
  <main>
    {children}
  </main>
</div>
```

## Acceptance Criteria

- ✅ ShowcaseLayout component renders without errors
- ✅ Theme toggle switches between light and dark modes correctly
- ✅ Navigation tabs switch between component and layout showcase routes
- ✅ Theme state persists across navigation between showcases
- ✅ Styling follows existing design language from DesignPrototype
- ✅ CSS custom properties respond correctly to theme changes
- ✅ Component works within React Router setup
- ✅ Hot reload updates component correctly during development

## Dependencies

- Requires completion of React Router setup task
- Access to existing theme CSS from claymorphism-theme.css
- React Router navigation hooks (`useNavigate` or `Link` components)

## Theme Toggle Implementation Details

Extract and adapt this pattern from DesignPrototype.tsx:

```typescript
const [isDark, setIsDark] = useState(false);
// Theme toggle button implementation
// Apply theme class to container div
```

## Navigation Implementation Details

Create tab-like navigation:

- "Components" tab → `/showcase/components`
- "Layout" tab → `/showcase/layout`
- Visual active state for current route
- Smooth navigation without page reload

## Styling Requirements

- **CSS-in-JS approach**: Follow existing patterns in DesignPrototype
- **Theme-aware styling**: All elements respond to light/dark theme changes
- **Clean, minimal design**: Focus attention on showcased components
- **Consistent typography**: Use existing font tokens (Plus Jakarta Sans, etc.)

## Testing Requirements

- Manual testing of theme toggle functionality
- Navigation between showcase views works correctly
- Theme state maintenance across route changes
- Visual consistency with existing app design language

## Security Considerations

- No external navigation or data sources
- Theme toggle limited to predefined light/dark options

### Log
